/**
 * /api/offer/[contactId]/approve
 *
 * Fired when the seller taps "Yes, push [agent], Miles" on the offer
 * dashboard. The button is a greenlight on Miles's recommendation, NOT
 * acceptance of any offer (nothing is signed).
 *
 * Behavior:
 *   1. Validate token + offerId.
 *   2. Build the "do better" outreach draft for the targeted buyer's agent.
 *   3. Log GHL note + tag the contact (`offer-greenlit-<agent-slug>`).
 *   4. Email Miles via GHL Conversations with:
 *        - the full draft body inline
 *        - a one-tap "Open in Gmail Compose (pre-filled)" link
 *      Miles opens the compose URL, eyeballs the pre-filled draft, hits send.
 *      Nothing goes to the buyer's agent without Miles's send.
 */

import { NextResponse } from "next/server";
import { getOfferByToken } from "@/lib/offer-data";
import {
  buildDoBetterDraft,
  buildMilesGreenlightEmail,
} from "@/lib/offer-counter-draft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

async function ghlPost(urlPath: string, body: unknown) {
  const token = process.env.GHL_MAMS_TOKEN;
  if (!token) throw new Error("GHL_MAMS_TOKEN missing");
  const res = await fetch(`${GHL_API}${urlPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL POST ${urlPath} -> ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

function slugifyAgentName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, "");
}

function buildGmailComposeUrl(to: string, subject: string, body: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const data = getOfferByToken(contactId, t);
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Pull offerId from POST body, fall back to the contact's default greenlight target
  let offerId = data.greenlightOfferId;
  try {
    const body = (await req.json()) as { offerId?: string } | null;
    if (body?.offerId) offerId = body.offerId;
  } catch {
    // empty body is fine, use default
  }

  const target = data.offers.find((o) => o.offerId === offerId);
  if (!target) {
    return NextResponse.json(
      { ok: false, error: `offer_not_found:${offerId}` },
      { status: 400 },
    );
  }

  const draft = buildDoBetterDraft(data, offerId);
  const composeUrl = buildGmailComposeUrl(draft.to, draft.subject, draft.body);
  const milesEmail = buildMilesGreenlightEmail(data, offerId, true);
  // Inject the one-tap compose link into the Miles email HTML
  const milesHtmlWithCta = milesEmail.html.replace(
    "</body>",
    `<div style="margin: 20px auto 0; max-width: 600px;">
      <a href="${composeUrl}" style="display: inline-block; background: #D4AF37; color: #003F3F; padding: 14px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px;">
        Open in Gmail Compose (pre-filled)
      </a>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #003F3F99;">
        Opens a fresh Gmail compose window with the draft pre-loaded. Eyeball, edit if needed, hit send.
      </p>
    </div></body>`,
  );

  const approvedAt = new Date().toISOString();
  const noteBody = [
    `[Offer Dashboard] ${data.sellerFirstName} greenlit the ${target.buyer.agentName.split(" ")[0]} do-better outreach.`,
    `Greenlit at: ${approvedAt}`,
    `Target offer: ${target.buyer.name} via ${target.buyer.agentName} (${target.buyer.agentBrokerage})`,
    `Sent via: GHL Conversations email to Miles. Draft awaiting his send.`,
    ``,
    `Draft body:`,
    `To: ${draft.to}`,
    `Subject: ${draft.subject}`,
    ``,
    draft.body,
  ].join("\n");

  const tag = `offer-greenlit-${slugifyAgentName(target.buyer.agentName)}`;
  const results: Record<string, string> = {};

  try {
    await ghlPost(`/contacts/${contactId}/notes`, { body: noteBody });
    results.note = "ok";
  } catch (err) {
    results.note = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/contacts/${contactId}/tags`, { tags: [tag] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: milesEmail.to,
      subject: milesEmail.subject,
      html: milesHtmlWithCta,
    });
    results.milesEmail = "ok";
  } catch (err) {
    results.milesEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({
    ok: true,
    approvedAt,
    offerId,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST with ?t=<token> and {offerId} body to record the seller greenlight.",
    },
    { status: 405 },
  );
}
