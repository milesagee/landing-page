/**
 * /api/status/[contactId]/check-in
 *
 * Walker's pre-appraisal check-in submission. Token-gated. Writes a GHL note,
 * tag, and a mirror email to Miles. Skips the Conversations email to the
 * contact themselves (Walker has SMS+Email DND active in MAMS GHL; outbound
 * to him goes via Miles's personal iMessage, not GHL).
 */

import { NextResponse } from "next/server";
import { getStatusByToken } from "@/lib/walker-status-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type SubmissionBody = {
  note?: string;
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
    throw new Error(
      `GHL POST ${urlPath} -> ${res.status}: ${text.substring(0, 200)}`,
    );
  }
  return res.json();
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return NextResponse.json(
      { ok: false, error: "missing_token" },
      { status: 400 },
    );
  }

  const data = getStatusByToken(contactId, t);
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: SubmissionBody;
  try {
    body = (await req.json()) as SubmissionBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const note = (body.note || "").trim();
  if (!note) {
    return NextResponse.json(
      { ok: false, error: "empty_note" },
      { status: 400 },
    );
  }

  const submittedAt = new Date().toISOString();

  const noteBody = [
    `[Closing Concierge] ${data.firstName} sent a pre-appraisal check-in.`,
    `Property: ${data.property.address}, ${data.property.city} ${data.property.state}`,
    `Submitted: ${submittedAt}`,
    ``,
    `Question / note:`,
    note,
  ].join("\n");

  const safe = note
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const milesEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#003F3F;max-width:640px;margin:0 auto;padding:20px;line-height:1.55;">
  <div style="background:#003F3F;color:white;padding:20px;border-radius:8px 8px 0 0;">
    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#D4AF37;font-weight:600;">Closing Concierge</div>
    <div style="font-size:22px;font-weight:700;margin-top:8px;font-family:'Fraunces',serif;">${data.firstName} sent a pre-appraisal check-in.</div>
  </div>
  <div style="background:white;border:1px solid #003F3F1A;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <p style="margin:0 0 8px 0;font-style:italic;color:#003F3F99;">${data.property.address}</p>
    <div style="background:#FAF7F1;border-left:3px solid #D4AF37;padding:14px 18px;margin:12px 0;font-size:14px;white-space:pre-wrap;">${safe}</div>
    <p style="margin:16px 0 0 0;font-size:13px;color:#003F3F99;">Submitted ${new Date(submittedAt).toLocaleString("en-US")}.</p>
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
    await ghlPost(`/contacts/${contactId}/tags`, {
      tags: ["walker-appraisal-week-check-in"],
    });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "miles@mamsnow.com",
      subject: `[Closing] ${data.firstName} pre-appraisal check-in`,
      html: milesEmailHtml,
    });
    results.milesEmail = "ok";
  } catch (err) {
    results.milesEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({ ok: true, submittedAt, results });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST with ?t=<token> + body { note } to send a check-in.",
    },
    { status: 405 },
  );
}
