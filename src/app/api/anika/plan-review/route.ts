/**
 * /api/anika/plan-review
 *
 * Token-gated submit for Anika's plan-review dashboard.
 *
 * v2 writes (added 2026-05-31 as chamber-pulse readability prereq):
 *   1. Local JSON submission file (always, skipped on Vercel) — the canonical
 *      readable artifact chamber-pulse reads even when GHL writes are skipped.
 *   2. GHL note + tag — best-effort, requires GHL_MAMS_ANIKA_CONTACT_ID env var.
 *      Tag: anika-plan-review-submitted. Note prefix: [ANIKA PLAN-REVIEW].
 *   3. GHL Conversations email to miles@milesagee.com — best-effort, same gate.
 *
 * The legacy console.log is preserved for live-log visibility.
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { isValidAnikaToken } from "@/lib/anika-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const IS_VERCEL = !!process.env.VERCEL;

type Payload = {
  submittedAt?: string;
  verdicts?: Record<string, string | null>;
  notes?: Record<string, string>;
  voiceChoice?: string | null;
  nextTestCycle?: { classes?: string; hardest?: string; nextTest?: string };
  openText?: string;
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

function buildNoteBody(payload: Payload): string {
  const verdicts = payload.verdicts || {};
  const notes = payload.notes || {};
  const cycle = payload.nextTestCycle || {};
  return [
    `[ANIKA PLAN-REVIEW] Anika submitted the plan-review dashboard.`,
    `Submitted: ${payload.submittedAt || new Date().toISOString()}`,
    ``,
    `Voice choice: ${payload.voiceChoice || "(not selected)"}`,
    ``,
    `Open text:`,
    (payload.openText || "(none)").trim(),
    ``,
    `Verdicts:`,
    ...Object.entries(verdicts).map(([k, v]) => `  - ${k}: ${v ?? "(blank)"}`),
    ``,
    `Per-layer notes:`,
    ...Object.entries(notes).map(([k, v]) => `  - ${k}: ${(v || "(blank)").trim()}`),
    ``,
    `Next test cycle:`,
    `  - Classes: ${cycle.classes || "(blank)"}`,
    `  - Hardest topic: ${cycle.hardest || "(blank)"}`,
    `  - Next test date: ${cycle.nextTest || "(blank)"}`,
    ``,
    `Raw payload:`,
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function buildMilesEmailHtml(payload: Payload): string {
  const open = (payload.openText || "(no open text)").trim();
  const voice = payload.voiceChoice || "(not selected)";
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Anika plan-review submitted</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">Anika just sent her plan-review.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 12px 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(open)}</div>
    <p style="margin: 16px 0 0; font-size: 13px; color: #003F3F99;">Voice choice: ${escapeHtml(voice)}</p>
  </div>
</body></html>
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

function stampForFilename(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate()) +
    "-" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

async function writeLocalSubmission(surface: string, slug: string, payload: Payload, results: Record<string, string>): Promise<void> {
  if (IS_VERCEL) {
    results.localFile = "skipped (Vercel)";
    return;
  }
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const dir = path.join(projectRoot, "shared", "submissions", surface);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${stampForFilename(new Date())}-${slug}.json`;
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, JSON.stringify(payload, null, 2), "utf-8");
    results.localFile = `ok: ${filepath}`;
  } catch (e) {
    results.localFile = `failed: ${(e as Error).message}`;
  }
}

export async function GET() {
  return NextResponse.json({ error: "POST only" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t");

  let body: Payload = {};
  try {
    body = (await req.json()) as Payload;
  } catch {
    // Fall through with empty body so we can still log the auth attempt below.
  }

  if (!isValidAnikaToken(t)) {
    console.log(
      "[anika-plan-review][unauthorized]",
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        reason: "invalid_token",
        payload: body,
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  console.log(
    "[anika-plan-review]",
    JSON.stringify({
      receivedAt: new Date().toISOString(),
      payload: body,
    }),
  );

  const results: Record<string, string> = {};

  // 1. Local JSON submission file (canonical readable for chamber-pulse)
  await writeLocalSubmission("anika-plan-review", "anika", body, results);

  // 2-3. GHL note + tag + email (best-effort, requires contactId env var)
  const anikaContactId = process.env.GHL_MAMS_ANIKA_CONTACT_ID;
  if (anikaContactId) {
    const noteBody = buildNoteBody(body);
    const emailHtml = buildMilesEmailHtml(body);
    const openFirst60 = (body.openText || "Anika plan-review").slice(0, 60).trim();

    const ghlWrites = await Promise.allSettled([
      ghlPost(`/contacts/${anikaContactId}/notes`, { body: noteBody }),
      ghlPost(`/contacts/${anikaContactId}/tags`, { tags: ["anika-plan-review-submitted"] }),
      ghlPost(`/conversations/messages`, {
        type: "Email",
        contactId: anikaContactId,
        emailTo: "miles@milesagee.com",
        subject: `Anika -> Monique plan-review: ${openFirst60}`,
        html: emailHtml,
      }),
    ]);
    results.ghlNote = ghlWrites[0].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[0] as PromiseRejectedResult).reason}`;
    results.ghlTag = ghlWrites[1].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[1] as PromiseRejectedResult).reason}`;
    results.milesEmail = ghlWrites[2].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[2] as PromiseRejectedResult).reason}`;
  } else {
    results.ghlNote = "skipped (GHL_MAMS_ANIKA_CONTACT_ID missing)";
    results.ghlTag = "skipped (GHL_MAMS_ANIKA_CONTACT_ID missing)";
    results.milesEmail = "skipped (GHL_MAMS_ANIKA_CONTACT_ID missing)";
  }

  return NextResponse.json({ ok: true, received: body, results });
}
