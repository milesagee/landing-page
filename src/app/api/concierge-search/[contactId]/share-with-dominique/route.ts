/**
 * /api/concierge-search/[contactId]/share-with-dominique
 *
 * Josephus's view sends Dominique her partner link. Writes a GHL note + tag,
 * and emails her the partner URL via GHL Conversations on Josephus's contact.
 * Token-gated. Only the primary viewer may trigger this.
 */

import { NextResponse } from "next/server";
import { getJosephusByToken, VIEWERS } from "@/lib/josephus-concierge-search-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type ShareBody = {
  partnerEmail: string;
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

function findPartnerToken(contactId: string): string | null {
  for (const [token, v] of Object.entries(VIEWERS)) {
    if (v.contactId === contactId && v.viewerType === "partner") return token;
  }
  return null;
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const lookup = getJosephusByToken(contactId, t);
  if (!lookup) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (lookup.viewer.viewerType !== "primary") {
    return NextResponse.json({ ok: false, error: "primary_only" }, { status: 403 });
  }

  let body: ShareBody;
  try {
    body = (await req.json()) as ShareBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const partnerEmail = (body.partnerEmail || "").trim();
  if (!partnerEmail || !partnerEmail.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const partnerToken = findPartnerToken(contactId);
  if (!partnerToken) {
    return NextResponse.json({ ok: false, error: "partner_token_missing" }, { status: 500 });
  }

  const origin = req.headers.get("origin") || "https://mamsnow.com";
  const partnerUrl = `${origin}/concierge-search/${contactId}?t=${partnerToken}`;
  const partnerFirstName = lookup.data.partnerFirstName;
  const submittedAt = new Date().toISOString();

  const noteBody = [
    `[Concierge Search] ${lookup.viewer.firstName} shared the dashboard with ${partnerFirstName}`,
    `Submitted: ${submittedAt}`,
    `Partner email: ${partnerEmail}`,
    `Partner URL: ${partnerUrl}`,
  ].join("\n");

  const partnerEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">From Miles at MAMS</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${partnerFirstName}, your view of the Richmond search.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px 0;">${lookup.viewer.firstName} sent you the curated buyer search I built for you both. It is your own view, so anything you rate or note routes into the same record. Both sides visible.</p>
    <p style="margin: 16px 0; text-align: center;">
      <a href="${partnerUrl}" style="display: inline-block; background: #D4AF37; color: #003F3F; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px;">Open the dashboard</a>
    </p>
    <p style="margin: 16px 0 8px 0; font-size: 13px; color: #003F3F99;">The link is tied to your account. Keep it to yourself.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #003F3F99;">Reach me directly at <a href="mailto:miles@mamsnow.com" style="color: #003F3F; text-decoration: underline;">miles@mamsnow.com</a>.</p>
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
    await ghlPost(`/contacts/${contactId}/tags`, { tags: ["concierge-search-shared-partner"] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: partnerEmail,
      fromName: "Miles at MAMS",
      subject: `${partnerFirstName}, your view of the Richmond search`,
      html: partnerEmailHtml,
    });
    results.partnerEmail = "ok";
  } catch (err) {
    results.partnerEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({ ok: true, submittedAt, partnerUrl, results });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST with ?t=<primary-token> + body { partnerEmail }" },
    { status: 405 },
  );
}
