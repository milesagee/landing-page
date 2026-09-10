/**
 * The Cherish Room, write-back capture.
 *
 * Forked from api/team/direct/submit (token gate, validation) and
 * api/family/[contactId]/submit (GHL note + email to Miles).
 *
 * Deliberately has NO model call. Monique never answers Miles's brothers in his
 * name. This route captures what they wrote, puts it where he will see it, and
 * gets out of the way.
 *
 * Three independent best-effort writes, each recorded into `results` so a partial
 * failure still returns 200:
 *   1. disk  -> shared/submissions/cherish-room/, for chamber-pulse. Local only;
 *              on Vercel the filesystem is ephemeral and this is expected to fail.
 *   2. note  -> a note on Miles's OWN contact record. Reid and Darius are friends,
 *              not leads, and never get a CRM record of their own.
 *   3. email -> miles@milesagee.com. The durable channel in production.
 *
 * Returns 502 only when both durable writes (note and email) fail.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCherishRecipientByToken,
  validateCherishPayload,
  RELAY_CONTACT_ID,
  RELAY_EMAIL,
  type CherishPayload,
  type CherishRecipient,
} from "@/lib/cherish-data";

export const dynamic = "force-dynamic";

const GHL_BASE = "https://services.leadconnectorhq.com";

async function ghlPost(urlPath: string, body: unknown) {
  const res = await fetch(`${GHL_BASE}${urlPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_MAMS_TOKEN}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GHL ${urlPath} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const FIELDS: Array<{ key: "see" | "hold" | "dinner" | "note"; label: string }> = [
  { key: "see", label: "What you see" },
  { key: "hold", label: "What you'd hold me to" },
  { key: "dinner", label: "The dinner" },
  { key: "note", label: "Anything else" },
];

function plainBody(who: CherishRecipient, p: CherishPayload) {
  const parts = [
    `The Cherish Room, week of ${p.weekOf}`,
    `From: ${who.displayName}`,
    `Submitted: ${p.submittedAt}`,
    "",
  ];
  for (const f of FIELDS) {
    const v = (p[f.key] || "").trim();
    if (v) parts.push(`${f.label}:`, v, "");
  }
  return parts.join("\n").trim();
}

/**
 * Gmail strips the `background:` shorthand, so every fill here is longhand
 * background-color plus a bgcolor attribute. See feedback_gmail_strips_background_shorthand.
 */
function emailHtml(who: CherishRecipient, p: CherishPayload) {
  const blocks = FIELDS.map((f) => {
    const v = (p[f.key] || "").trim();
    if (!v) return "";
    return `
      <tr><td style="padding:0 28px 22px 28px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B1922E;font-weight:bold;padding-bottom:8px;">${esc(f.label)}</div>
        <div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#003F3F;border-left:2px solid #D4AF37;padding-left:14px;">${esc(v).replace(/\n/g, "<br>")}</div>
      </td></tr>`;
  }).join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background-color:#FAF7F1;" bgcolor="#FAF7F1">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAF7F1" style="background-color:#FAF7F1;">
<tr><td align="center" style="padding:28px 12px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFDF9" style="background-color:#FFFDF9;max-width:600px;border:1px solid #E8E2D6;">
  <tr><td bgcolor="#003F3F" style="background-color:#003F3F;padding:22px 28px;">
    <div style="font-family:Georgia,serif;font-style:italic;font-size:19px;color:#D4AF37;">The Cherish Room</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FAF7F1;padding-top:6px;">${esc(who.displayName)} wrote back &middot; week of ${esc(p.weekOf)}</div>
  </td></tr>
  <tr><td style="padding:26px 28px 20px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#003F3F;">
    He answered the page. You answer him yourself.
  </td></tr>
  ${blocks}
  <tr><td style="padding:8px 28px 26px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8578;border-top:1px solid #E8E2D6;padding-top:18px;">
    Submitted ${esc(p.submittedAt)}
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("t");
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }
  const who = getCherishRecipientByToken(token);
  if (!who) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }

  let payload: Partial<CherishPayload>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const invalid = validateCherishPayload(payload);
  if (invalid) {
    return NextResponse.json({ ok: false, error: invalid.reason, field: invalid.field }, { status: 422 });
  }
  const p = payload as CherishPayload;

  const results: Record<string, string> = {};

  // 1. Disk, for chamber-pulse. Expected to no-op on Vercel.
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "..", "shared", "submissions", "cherish-room");
    await fs.mkdir(dir, { recursive: true });
    const stamp = p.submittedAt.replace(/[:.]/g, "-");
    await fs.writeFile(
      path.join(dir, `${stamp}-${who.slug}.json`),
      JSON.stringify({ surface: "cherish-room", contributor: who.slug, displayName: who.displayName, ...p }, null, 2),
    );
    results.disk = "ok";
  } catch (e) {
    results.disk = `skipped: ${(e as Error).message.slice(0, 120)}`;
  }

  // 2. Note on Miles's own contact record.
  try {
    await ghlPost(`/contacts/${RELAY_CONTACT_ID}/notes`, { body: plainBody(who, p) });
    results.note = "ok";
  } catch (e) {
    results.note = `failed: ${(e as Error).message.slice(0, 200)}`;
  }

  // 3. Email to Miles. The durable channel in production.
  try {
    const first = (p.see || p.hold || p.dinner || p.note || "").trim().replace(/\s+/g, " ").slice(0, 60);
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId: RELAY_CONTACT_ID,
      emailTo: RELAY_EMAIL,
      subject: `${who.displayName} → The Cherish Room: ${first}`,
      html: emailHtml(who, p),
    });
    results.email = "ok";
  } catch (e) {
    results.email = `failed: ${(e as Error).message.slice(0, 200)}`;
  }

  if (results.note !== "ok" && results.email !== "ok") {
    return NextResponse.json({ ok: false, error: "delivery_failed", results }, { status: 502 });
  }

  return NextResponse.json({ ok: true, recipient: who.slug, results });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed", hint: "POST to /api/cherish/submit?t=<token>" },
    { status: 405 },
  );
}
