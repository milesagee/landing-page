/**
 * /api/reflection/[contactId]/submit
 *
 * Records a single card submission from the buyer-reflection portal.
 * Token-gated via URL query. Writes a GHL note + tag (card-specific) and
 * mirrors the submission to Miles via GHL Conversations email.
 */

import { NextResponse } from "next/server";
import { getReflectionByToken } from "@/lib/asihene-reflection-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type SubmissionBody = {
  cardId?:
    | "synthesis"
    | "active-listings"
    | "cheverton"
    | "sodbury"
    | "ghana";
  answers?: Record<string, string>;
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

const CARD_TAG: Record<string, string> = {
  synthesis: "asihene-synthesis-reflected",
  "active-listings": "asihene-active-listings-prioritized",
  cheverton: "asihene-cheverton-reflected",
  sodbury: "asihene-sodbury-reflected",
  ghana: "asihene-ghana-protocol-set",
};

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

  const data = getReflectionByToken(contactId, t);
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

  const cardId = body.cardId;
  if (!cardId || !(cardId in CARD_TAG)) {
    return NextResponse.json(
      { ok: false, error: "invalid_card" },
      { status: 400 },
    );
  }

  const card = data.cards.find((c) => c.id === cardId);
  if (!card) {
    return NextResponse.json(
      { ok: false, error: "card_not_in_data" },
      { status: 400 },
    );
  }

  const answers = body.answers || {};
  const submittedAt = new Date().toISOString();

  // Build a human-readable note body using each question's label as a section.
  const sections = card.questions.map((q) => {
    const value = (answers[q.id] || "").trim();
    return `Q: ${q.label}\nA: ${value || "(no answer)"}`;
  });
  const noteBody = [
    `[Asihene Reflection] ${data.firstName} submitted "${card.label} - ${card.headline}"`,
    `Submitted: ${submittedAt}`,
    ``,
    ...sections,
    ``,
    `Raw answers:`,
    JSON.stringify(answers, null, 2),
  ].join("\n");

  // Miles-facing email mirror.
  const milesEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#003F3F;max-width:640px;margin:0 auto;padding:20px;line-height:1.55;">
  <div style="background:#003F3F;color:white;padding:20px;border-radius:8px 8px 0 0;">
    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#D4AF37;font-weight:600;">Buyer Reflection</div>
    <div style="font-size:22px;font-weight:700;margin-top:8px;font-family:'Fraunces',serif;">${data.firstName} submitted the ${card.label.toLowerCase()} card.</div>
  </div>
  <div style="background:white;border:1px solid #003F3F1A;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <p style="margin:0 0 8px 0;font-style:italic;color:#003F3F99;">${card.headline}</p>
    ${card.questions
      .map((q) => {
        const value = (answers[q.id] || "").trim();
        const safe = value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `
    <div style="background:#FAF7F1;border-left:3px solid #D4AF37;padding:14px 18px;margin:12px 0;font-size:14px;">
      <p style="margin:0 0 6px 0;font-size:12px;color:#003F3F99;font-weight:600;">${q.label}</p>
      <p style="margin:0;white-space:pre-wrap;">${safe || "<em>no answer</em>"}</p>
    </div>`;
      })
      .join("")}
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
    await ghlPost(`/contacts/${contactId}/tags`, { tags: [CARD_TAG[cardId]] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "miles@mamsnow.com",
      subject: `[Reflection] ${data.firstName}: ${card.label}`,
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
      hint: "POST with ?t=<token> + body { cardId, answers } to record a reflection card submission.",
    },
    { status: 405 },
  );
}
