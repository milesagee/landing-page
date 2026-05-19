/**
 * /api/host/[contactId]/intake
 *
 * Fires when Eddie (or any future host) submits his property intake.
 * Writes three records to GHL: a contact note (full submission), a
 * `host-intake-submitted` tag, and a Conversations email to Miles with
 * the per-property summary so he can build the game plan dashboard off
 * real answers, not assumptions.
 */

import { NextResponse } from "next/server";
import { getHostByToken, type HostIntakePayload, type PropertyIntakePayload } from "@/lib/host-data";

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

function summarizeProperty(p: PropertyIntakePayload, idx: number): string {
  const lines = [
    `=== PROPERTY ${idx + 1}: ${p.nickname || "(no name)"} ===`,
    `Current state: ${p.currentState || "-"}`,
    `Furnishing: ${p.furnishingStatus || "-"}`,
    `Target market: ${p.targetMarket.length ? p.targetMarket.join(" + ") : "-"}`,
    `Restrictions known: ${p.restrictions.length ? p.restrictions.join(", ") : "-"}`,
    `Capital comfort: ${p.capitalBucket || "-"}`,
    `Hands-on: ${p.handsOn || "-"}`,
    `Target go-live: ${p.targetMonth || "-"}`,
  ];
  return lines.join("\n");
}

function summarizePropertyHtml(p: PropertyIntakePayload, idx: number): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#003F3F99;font-size:13px;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#003F3F;font-size:14px;font-weight:500;">${value || "—"}</td></tr>`;
  return `
    <div style="margin:24px 0;padding:20px;background:#FAF7F1;border-left:3px solid #D4AF37;border-radius:6px;">
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#B1922E;font-weight:600;margin-bottom:8px;">Property ${idx + 1}</div>
      <div style="font-family:Georgia,serif;font-size:20px;color:#003F3F;margin-bottom:14px;">${escapeHtml(p.nickname || "(no nickname)")}</div>
      <table style="border-collapse:collapse;">
        ${row("Current state", escapeHtml(p.currentState))}
        ${row("Furnishing", escapeHtml(p.furnishingStatus))}
        ${row("Target market", escapeHtml(p.targetMarket.join(" + ")))}
        ${row("Restrictions known", escapeHtml(p.restrictions.join(", ")))}
        ${row("Capital comfort", escapeHtml(p.capitalBucket))}
        ${row("Hands-on", escapeHtml(p.handsOn))}
        ${row("Target go-live", escapeHtml(p.targetMonth))}
      </table>
    </div>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const data = getHostByToken(contactId, t);
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let payload: HostIntakePayload;
  try {
    payload = (await req.json()) as HostIntakePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_payload" }, { status: 400 });
  }

  if (!payload || !Array.isArray(payload.properties) || payload.properties.length === 0) {
    return NextResponse.json({ ok: false, error: "bad_payload" }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  const noteBody = [
    `[Host Intake] ${data.firstName} ${data.lastName} submitted his hosting briefing.`,
    `Submitted at: ${submittedAt}`,
    `Property count: ${payload.properties.length}`,
    ``,
    ...payload.properties.map((p, i) => summarizeProperty(p, i)),
    ``,
    `=== Why now ===`,
    payload.whyNow || "(blank)",
    ``,
    `=== Anything else ===`,
    payload.anythingElse || "(blank)",
  ].join("\n");

  const milesHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;max-width:640px;margin:0 auto;color:#003F3F;line-height:1.55;">
      <div style="padding:24px 0;border-bottom:1px solid #003F3F1a;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B1922E;font-weight:600;">Host Intake</div>
        <div style="font-family:Georgia,serif;font-size:24px;color:#003F3F;margin-top:6px;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} sent his briefing.</div>
        <div style="font-size:13px;color:#003F3F99;margin-top:4px;">Submitted ${escapeHtml(submittedAt)}</div>
      </div>
      ${payload.properties.map((p, i) => summarizePropertyHtml(p, i)).join("")}
      <div style="margin:24px 0;padding:20px;background:#fff;border:1px solid #003F3F1a;border-radius:6px;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#B1922E;font-weight:600;margin-bottom:8px;">Why now</div>
        <div style="font-size:14px;color:#003F3F;white-space:pre-wrap;">${escapeHtml(payload.whyNow) || "<span style=\"color:#003F3F66;\">(blank)</span>"}</div>
      </div>
      <div style="margin:24px 0;padding:20px;background:#fff;border:1px solid #003F3F1a;border-radius:6px;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#B1922E;font-weight:600;margin-bottom:8px;">Anything else</div>
        <div style="font-size:14px;color:#003F3F;white-space:pre-wrap;">${escapeHtml(payload.anythingElse) || "<span style=\"color:#003F3F66;\">(blank)</span>"}</div>
      </div>
      <div style="padding:24px 0;border-top:1px solid #003F3F1a;font-size:12px;color:#003F3F99;">
        Next move: design Phase 2 (the game plan dashboard) shaped to these answers, then send it back to ${escapeHtml(data.firstName)} via the same /host link.
      </div>
    </div>
  `;

  const results: Record<string, string> = {};

  try {
    await ghlPost(`/contacts/${contactId}/notes`, { body: noteBody });
    results.note = "ok";
  } catch (err) {
    results.note = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/contacts/${contactId}/tags`, { tags: ["host-intake-submitted"] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "miles@milesagee.com",
      subject: `[Host Intake] ${data.firstName} ${data.lastName} sent his briefing`,
      html: milesHtml,
    });
    results.milesEmail = "ok";
  } catch (err) {
    results.milesEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({
    ok: true,
    submittedAt,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST with ?t=<token> and JSON body to submit the host intake." },
    { status: 405 },
  );
}
