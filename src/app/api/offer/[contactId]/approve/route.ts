/**
 * /api/offer/[contactId]/approve
 *
 * Fired when the seller clicks "Yes, run with this plan" on the offer
 * dashboard. Logs the approval to GHL (note + tag) and emails Miles the
 * pre-prepared counter draft via GHL Conversations (no Vercel mail needed).
 */

import { NextResponse } from "next/server";
import { getOfferByToken } from "@/lib/offer-data";
import { buildCounterDraft, buildMilesApprovalEmail } from "@/lib/offer-counter-draft";

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

  const draft = buildCounterDraft(data);
  const milesEmail = buildMilesApprovalEmail(data);
  const approvedAt = new Date().toISOString();

  const noteBody = [
    `[Offer Dashboard] ${data.sellerFirstName} approved the plan.`,
    `Approved at: ${approvedAt}`,
    `Property: ${data.property.address}`,
    ``,
    `Counter draft (ready to send to Ronnie + Ed):`,
    `To: ${draft.to}`,
    `Cc: ${draft.cc}`,
    `Subject: ${draft.subject}`,
    ``,
    draft.body,
  ].join("\n");

  const results: Record<string, string> = {};

  try {
    await ghlPost(`/contacts/${contactId}/notes`, { body: noteBody });
    results.note = "ok";
  } catch (err) {
    results.note = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/contacts/${contactId}/tags`, { tags: ["offer-approved"] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    const locationId = process.env.GHL_MAMS_LOCATION_ID;
    if (!locationId) throw new Error("GHL_MAMS_LOCATION_ID missing");
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: milesEmail.to,
      subject: milesEmail.subject,
      html: milesEmail.html,
    });
    results.milesEmail = "ok";
  } catch (err) {
    results.milesEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({
    ok: true,
    approvedAt,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST with ?t=<token> to record the seller approval." },
    { status: 405 },
  );
}
