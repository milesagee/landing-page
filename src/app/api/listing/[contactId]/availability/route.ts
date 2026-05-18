/**
 * /api/listing/[contactId]/availability
 *
 * Records the seller's submitted availability for their listing dashboard.
 * Token-gated. Writes a GHL note + tag, and notifies Wendy via GHL
 * Conversations.
 */

import { NextResponse } from "next/server";
import { getListingByToken } from "@/lib/listing-activity-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type SubmissionBody = {
  selection?: Record<string, string[]>;
  summary?: Array<{ day: string; windows: string[] }>;
};

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

  const lookup = getListingByToken(contactId, t);
  if (!lookup || lookup.viewer.viewerType !== "seller") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: SubmissionBody;
  try {
    body = (await req.json()) as SubmissionBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const property = lookup.property;
  const submittedAt = new Date().toISOString();
  const summary = body.summary || [];

  const readable = summary.length
    ? summary.map((s) => `${s.day}: ${s.windows.join(", ")}`).join("\n")
    : "(No windows selected.)";

  const noteBody = [
    `[Listing Activity] ${property.sellerFirstName} submitted availability`,
    `Submitted: ${submittedAt}`,
    `Property: ${property.property.address}, ${property.property.city} ${property.property.state} ${property.property.zip}`,
    ``,
    `Windows:`,
    readable,
    ``,
    `Raw selection:`,
    JSON.stringify(body.selection || {}, null, 2),
  ].join("\n");

  const wendyEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Listing Concierge - Seller Update</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${property.sellerFirstName} confirmed her ${property.property.address} availability.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px 0;">She just submitted her windows on the listing dashboard. Buyer agents currently in the loop: Ashley Cross + the four others we've been fielding through your thread. Use these windows when responding to any new requests this week.</p>
    <p style="margin: 0 0 8px 0; font-weight: 600;">Confirmed windows:</p>
    <div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 16px 20px; margin: 12px 0 20px 0; font-size: 14px;">
      <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 14px; color: #003F3F;">${readable}</pre>
    </div>
    <p style="margin: 16px 0 8px 0; font-size: 13px; color: #003F3F99;">Submitted ${new Date(submittedAt).toLocaleString("en-US")}.</p>
  </div>
</body></html>
  `.trim();

  const results: Record<string, string> = {};

  try {
    await ghlPost(`/contacts/${contactId}/notes`, { body: noteBody });
    results.note = "ok";
  } catch (err) {
    results.note = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/contacts/${contactId}/tags`, { tags: ["availability-submitted"] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "office@mamsnow.com",
      subject: `[Listing] ${property.sellerFirstName} confirmed ${property.property.address} availability`,
      html: wendyEmailHtml,
    });
    results.wendyEmail = "ok";
  } catch (err) {
    results.wendyEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({ ok: true, submittedAt, results });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST with ?t=<token> + body { selection, summary } to record availability." },
    { status: 405 },
  );
}
