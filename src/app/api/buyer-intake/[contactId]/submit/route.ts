/**
 * /api/buyer-intake/[contactId]/submit
 *
 * Orchestrates the Stage 1 + Stage 2 launch when a buyer submits the intake
 * wizard. Token-gated. Returns the Stage 1 insight panel inline so the
 * confirmation card renders rich content immediately. Stage 2 (PC research)
 * is queued out-of-band; this endpoint never waits on it.
 *
 * Writes performed on every successful submit (parallel where independent):
 *   1. GHL Note  -- [BUYER INTAKE] marker + full payload
 *   2. GHL Tag   -- buyer-intake-submitted
 *   3. GHL Email -- summary to miles@milesagee.com via Conversations
 *   4. PC YAML brief -- shared/outbox-to-pc/<stem>.yaml from pc-brief-template.yaml
 *   5. iMessage ping to Miles -- spawn pc-ping-imessage.js fire-and-forget
 *   6. Monique-line SMS via GHL Conversations (skipped via _testFlags)
 *   7. Stage 1 Claude API call -- spawn buyer-intake-stage1.js, wait, return
 *
 * The endpoint returns in 5-10s (Stage 1 dominates). All other writes are
 * fire-and-forget so the prospect never sits.
 */

import { NextResponse } from "next/server";
import * as path from "node:path";
import * as fs from "node:fs/promises";

// Resolve child_process at runtime to defeat turbopack's static analysis of
// spawn() arguments — Next 16's bundler tries to bundle the script path as
// a module otherwise, which breaks the Vercel build even though the spawn
// only matters in local dev where the sibling scripts exist on disk.
type CP = typeof import("node:child_process");
function getCp(): CP {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return (Function("return require")() as NodeRequire)("child_process");
}
import {
  getBuyerIntakeByToken,
  validateIntake,
  type BuyerIntakePayload,
  type Stage1Response,
} from "@/lib/buyer-intake-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// True when the route runs on Vercel (serverless, no Mac access). On Vercel
// the sibling Node scripts (Stage 1 runner, iMessage ping) don't exist on
// disk and child_process must be skipped. Local-dev returns false so the
// full orchestration fires.
const IS_VERCEL = !!process.env.VERCEL;

// Resolved at request time (defeats turbopack static path analysis on the
// child_process spawn targets). The buyer-intake submit is local-dev-only
// orchestration — in production on Vercel these paths will not exist, and
// the GHL writes + Monique SMS still proceed.
function getPaths() {
  const projectRoot = path.resolve(process.cwd(), "..");
  return {
    projectRoot,
    scriptsDir: path.join(projectRoot, "scripts", "insiderrva"),
    skillDir: path.join(projectRoot, ".claude", "skills", "buyer-intake-portal"),
    outboxDir: path.join(projectRoot, "shared", "outbox-to-pc"),
  };
}

type Params = Promise<{ contactId: string }>;

type SubmitBody = BuyerIntakePayload & {
  _testFlags?: {
    skipMoniqueSms?: boolean;
    skipPcBrief?: boolean;
    skipStage1?: boolean;
    skipImessagePing?: boolean;
  };
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

function computeEta(submittedAt: Date): string {
  const h = submittedAt.getHours();
  // 0-9am EST → "by end of day today"
  if (h < 9) return "by end of day today";
  // 9am-5pm → "by 9am tomorrow"  (PC runs overnight)
  // 5pm-midnight → "by 9am tomorrow"
  return "by 9am tomorrow";
}

function slugifyForRequestId(firstName: string): string {
  return firstName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "buyer";
}

function requestIdNow(firstName: string): string {
  const d = new Date();
  const stamp =
    d.getUTCFullYear() +
    "-" +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getUTCDate()).padStart(2, "0") +
    "-" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0");
  return `${stamp}-buyer-match-${slugifyForRequestId(firstName)}`;
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));
}

async function writePcBrief(args: {
  requestId: string;
  firstName: string;
  contactId: string;
  payload: BuyerIntakePayload;
  contactContext: string;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (IS_VERCEL) return { ok: false, error: "skipped: Vercel runtime cannot write to local mailbox" };
  try {
    const { skillDir, outboxDir } = getPaths();
    const tmplPath = path.join(skillDir, "pc-brief-template.yaml");
    const tmpl = await fs.readFile(tmplPath, "utf-8");

    const filled = fillTemplate(tmpl, {
      request_id: args.requestId,
      created_iso: new Date().toISOString(),
      buyer_first_name: args.firstName,
      buyer_phone: "see GHL contact",
      buyer_email: "see GHL contact",
      budget_min: String(args.payload.budgetMin),
      budget_max: String(args.payload.budgetMax),
      prequal_amount: String(args.payload.prequalAmount),
      min_beds: String(args.payload.minBeds),
      min_baths: String(args.payload.minBaths),
      top_neighborhoods_csv: args.payload.topNeighborhoods.join(", "),
      must_haves_csv: args.payload.mustHaves.join(", "),
      timeline: args.payload.timeline,
      current_situation: args.payload.currentSituation,
      notes: args.payload.notes || "(none)",
      contact_context_block: args.contactContext,
      contact_id: args.contactId,
    });

    await fs.mkdir(outboxDir, { recursive: true });
    const outPath = path.join(outboxDir, `${args.requestId}.yaml`);
    await fs.writeFile(outPath, filled, "utf-8");
    return { ok: true, path: outPath };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function spawnStage1(payload: BuyerIntakePayload, firstName: string): Promise<Stage1Response | null> {
  return new Promise((resolve) => {
    if (IS_VERCEL) {
      resolve(null);
      return;
    }
    try {
      const { projectRoot, scriptsDir } = getPaths();
      const scriptName = ["buyer-intake-stage1", "js"].join(".");
      const script = `${scriptsDir}/${scriptName}`;
      const child = getCp().spawn("node", [script, firstName], {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d: Buffer) => (stdout += d.toString()));
      child.stderr?.on("data", (d: Buffer) => (stderr += d.toString()));

      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
      }, 25000);

      child.on("close", () => {
        clearTimeout(timeout);
        try {
          const parsed = JSON.parse(stdout) as Stage1Response;
          resolve(parsed);
        } catch {
          if (stderr) console.error("[stage1] stderr:", stderr.slice(0, 500));
          resolve(null);
        }
      });

      child.on("error", (e) => {
        clearTimeout(timeout);
        console.error("[stage1] spawn error:", e.message);
        resolve(null);
      });

      child.stdin?.write(JSON.stringify(payload));
      child.stdin?.end();
    } catch (e) {
      console.error("[stage1] sync throw:", (e as Error).message);
      resolve(null);
    }
  });
}

function fireAndForgetImessagePing(requestId: string, firstName: string): void {
  if (IS_VERCEL) return;
  try {
    const { projectRoot, scriptsDir } = getPaths();
    const scriptName = ["pc-ping-imessage", "js"].join(".");
    const script = `${scriptsDir}/${scriptName}`;
    const child = getCp().spawn("node", [script, requestId, firstName], {
      cwd: projectRoot,
      detached: true,
      stdio: "ignore",
    });
    child.unref();
  } catch (e) {
    console.error("[imessage-ping] spawn failed:", (e as Error).message);
  }
}

function buildNoteBody(firstName: string, payload: BuyerIntakePayload): string {
  return [
    `[BUYER INTAKE] ${firstName} submitted the intake wizard.`,
    `Submitted: ${payload.submittedAt}`,
    ``,
    `Budget: $${payload.budgetMin.toLocaleString()} - $${payload.budgetMax.toLocaleString()}`,
    `Prequal: $${payload.prequalAmount.toLocaleString()}`,
    `Footprint: ${payload.minBeds === 0 ? "Studio+" : `${payload.minBeds}+ bed`} / ${payload.minBaths}+ bath`,
    `Neighborhoods (in order): ${payload.topNeighborhoods.join(", ")}`,
    `Must-haves: ${payload.mustHaves.length > 0 ? payload.mustHaves.join(", ") : "(none)"}`,
    `Timeline: ${payload.timeline}`,
    `Current housing: ${payload.currentSituation}`,
    ``,
    `Notes:`,
    payload.notes || "(none)",
    ``,
    `Raw payload:`,
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function buildMilesEmailHtml(firstName: string, payload: BuyerIntakePayload, requestId: string): string {
  const nh = payload.topNeighborhoods.join(", ");
  const mh = payload.mustHaves.length > 0 ? payload.mustHaves.join(", ") : "(none)";
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Buyer Intake - submitted</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${firstName} just filled out the intake.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px 0;">Stage 1 insight panel rendered on their confirmation card. PC brief queued at <code>shared/outbox-to-pc/${requestId}.yaml</code>. Check iMessage for the paste-to-PC ping.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Budget</td><td style="padding: 4px 0;">$${payload.budgetMin.toLocaleString()} - $${payload.budgetMax.toLocaleString()}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Prequal</td><td style="padding: 4px 0;">$${payload.prequalAmount.toLocaleString()}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Footprint</td><td style="padding: 4px 0;">${payload.minBeds === 0 ? "Studio+" : `${payload.minBeds}+ bed`} / ${payload.minBaths}+ bath</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Neighborhoods</td><td style="padding: 4px 0;">${nh}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Must-haves</td><td style="padding: 4px 0;">${mh}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Timeline</td><td style="padding: 4px 0;">${payload.timeline}</td></tr>
    </table>
    ${payload.notes ? `<div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 12px 16px; margin: 16px 0 0 0; font-size: 14px; line-height: 1.6;"><strong>Notes:</strong><br/>${escapeHtml(payload.notes)}</div>` : ""}
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

function buildMoniqueSms(firstName: string, eta: string, establishedChannel: string): string {
  // Template A (personal-cell-established, like Ethan) is the v1 default; the
  // skill's monique-intro-sms.md documents all three. Use "--" (double-hyphen)
  // as the dash per the no-em-dash rule.
  if (establishedChannel === "mams-line-established") {
    return `Hi ${firstName}, this is Monique with MAMS -- Miles's concierge coordinator. He looped me in on your refreshed search. Your full curated dashboard lands ${eta}. Reply here if anything shifts.`;
  }
  if (establishedChannel === "cold") {
    return `Hi ${firstName}, this is Monique with MAMS -- I work with Miles Agee on the concierge side. Your intake came through. Your full curated dashboard lands ${eta}. Reply here if anything else comes to mind.`;
  }
  // personal-cell-imessage
  return `Hi ${firstName}, this is Monique with MAMS -- I'm Miles's concierge coordinator. He passed me your intake. Your full curated dashboard lands ${eta}. If anything else comes to mind in the meantime, just reply here.`;
}

export async function POST(req: Request, ctx: { params: Params }) {
  try {
    return await handleSubmit(req, ctx);
  } catch (e) {
    console.error("[buyer-intake/submit] unhandled:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: "Something snagged on our side. Text Miles directly and he'll catch it.",
      },
      { status: 500 },
    );
  }
}

async function handleSubmit(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });

  const contact = getBuyerIntakeByToken(contactId, t);
  if (!contact) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const testFlags = body._testFlags || {};
  const isProd = process.env.NODE_ENV === "production";

  const validationErr = validateIntake(body);
  if (validationErr) {
    return NextResponse.json({ ok: false, error: "validation_failed", details: validationErr }, { status: 422 });
  }

  const submittedAt = new Date(body.submittedAt || Date.now());
  const eta = computeEta(submittedAt);
  const requestId = requestIdNow(contact.firstName);

  const results: Record<string, string> = {};

  // 1-3. GHL writes (parallel) -- the note, tag, and miles-notification email
  const noteBody = buildNoteBody(contact.firstName, body);
  const emailHtml = buildMilesEmailHtml(contact.firstName, body, requestId);

  const ghlWrites = await Promise.allSettled([
    ghlPost(`/contacts/${contactId}/notes`, { body: noteBody }),
    ghlPost(`/contacts/${contactId}/tags`, { tags: ["buyer-intake-submitted"] }),
    (async () => {
      const locationId = process.env.GHL_MAMS_LOCATION_ID;
      if (!locationId) throw new Error("GHL_MAMS_LOCATION_ID missing");
      return ghlPost(`/conversations/messages`, {
        type: "Email",
        contactId,
        emailTo: "miles@milesagee.com",
        subject: `[Buyer Intake] ${contact.firstName} submitted`,
        html: emailHtml,
      });
    })(),
  ]);
  results.ghlNote = ghlWrites[0].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[0] as PromiseRejectedResult).reason}`;
  results.ghlTag = ghlWrites[1].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[1] as PromiseRejectedResult).reason}`;
  results.milesEmail = ghlWrites[2].status === "fulfilled" ? "ok" : `failed: ${(ghlWrites[2] as PromiseRejectedResult).reason}`;

  // 4. PC YAML brief
  if (!(testFlags.skipPcBrief && !isProd)) {
    const contactContext = `Contact ID: ${contactId}\nEstablished channel: ${contact.establishedChannel}\nMAMS GHL custom fields available via API on demand.`;
    const briefResult = await writePcBrief({
      requestId,
      firstName: contact.firstName,
      contactId,
      payload: body,
      contactContext,
    });
    results.pcBrief = briefResult.ok ? `ok: ${briefResult.path}` : `failed: ${briefResult.error}`;
  } else {
    results.pcBrief = "skipped (test flag)";
  }

  // 5. iMessage ping to Miles (fire-and-forget)
  if (!(testFlags.skipImessagePing && !isProd)) {
    fireAndForgetImessagePing(requestId, contact.firstName);
    results.imessagePing = "spawned";
  } else {
    results.imessagePing = "skipped (test flag)";
  }

  // 6. Monique-line SMS -- skip on resubmits where the contact already heard
  // from Monique (suppressMoniqueIntro flag in CONTACTS). Avoids duplicate
  // first-touch intros that erode trust when a buyer hits the link twice.
  if (contact.suppressMoniqueIntro) {
    results.moniqueSms = "skipped: prior Monique intro on record";
  } else if (!(testFlags.skipMoniqueSms && !isProd)) {
    try {
      const sms = buildMoniqueSms(contact.firstName, eta, contact.establishedChannel);
      await ghlPost(`/conversations/messages`, {
        type: "SMS",
        contactId,
        message: sms,
      });
      results.moniqueSms = "ok";
    } catch (e) {
      results.moniqueSms = `failed: ${(e as Error).message}`;
    }
  } else {
    results.moniqueSms = "skipped (test flag)";
  }

  // 7. Stage 1 Claude call (this is the only synchronous wait the client perceives)
  let stage1: Stage1Response | null = null;
  if (!(testFlags.skipStage1 && !isProd)) {
    stage1 = await spawnStage1(body, contact.firstName);
    results.stage1 = stage1 ? "ok" : "failed (rendered empty insights)";
  } else {
    results.stage1 = "skipped (test flag)";
  }

  return NextResponse.json({
    ok: true,
    queued: true,
    requestId,
    eta,
    stage1,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST with ?t=<token> + the BuyerIntakePayload JSON body to submit a buyer intake.",
    },
    { status: 405 },
  );
}
