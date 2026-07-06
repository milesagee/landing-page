/**
 * /api/team/direct/submit
 *
 * Inline Anthropic call (no child_process) so it works in both local dev and
 * on Vercel. Token-validates the submitter, assembles a recipient-tailored
 * system prompt, calls Sonnet with ephemeral prompt caching, returns a
 * structured JSON response that the form renders in-page.
 *
 * v1 scope:
 *   - In-page response (primary)
 *   - No email backup yet (v2: send to recipient + CC Miles via GHL or transactional service)
 *   - No rate limit (relies on the 100-char articulation gate + the Anthropic spend guard)
 */

import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import {
  getTeamMemberByToken,
  validatePayload,
  SHAPE_LABELS,
  type TeamDirectPayload,
  type TeamDirectResponse,
  type TeamMember,
} from "@/lib/team-direct-data";
import {
  MAMS_BRAND_PHILOSOPHY,
  MONIQUE_CORE_THESIS,
} from "@/data/team-direct-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;
const TEMPERATURE = 0.7;

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const IS_VERCEL = !!process.env.VERCEL;

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

function buildTeamNoteBody(member: TeamMember, payload: TeamDirectPayload, response: TeamDirectResponse): string {
  return [
    `[TEAM DIRECT] ${member.displayName} submitted through her direct line.`,
    `Submitted: ${payload.submittedAt}`,
    `Shape of help: ${SHAPE_LABELS[payload.shape]}`,
    ``,
    `Situation (verbatim):`,
    payload.situation.trim(),
    ``,
    payload.tried ? `What she tried:\n${payload.tried.trim()}\n` : "",
    `Monique response headline: ${response.headline}`,
    ``,
    `Monique response body:`,
    response.body,
    response.nextStep ? `\nNext step: ${response.nextStep}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildTeamEmailHtml(member: TeamMember, payload: TeamDirectPayload, response: TeamDirectResponse): string {
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">${escapeHtml(member.displayName)} -> Monique direct line</div>
    <div style="font-size: 20px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${escapeHtml(response.headline || "Direct-line submit")}</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <div style="font-size: 12px; color: #003F3F99; text-transform: uppercase; letter-spacing: 0.08em;">${escapeHtml(member.displayName)}'s situation</div>
    <div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 12px 16px; margin: 8px 0 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(payload.situation.trim())}</div>
    <div style="font-size: 12px; color: #003F3F99; text-transform: uppercase; letter-spacing: 0.08em;">Shape</div>
    <div style="font-size: 14px; margin: 4px 0 16px;">${escapeHtml(SHAPE_LABELS[payload.shape])}</div>
    <div style="font-size: 12px; color: #003F3F99; text-transform: uppercase; letter-spacing: 0.08em;">Monique's response (already shown to her in-page)</div>
    <div style="font-size: 14px; margin: 4px 0 0; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(response.body)}</div>
    ${response.nextStep ? `<p style="margin: 16px 0 0; font-size: 13px; color: #003F3F99;">Next step proposed: ${escapeHtml(response.nextStep)}</p>` : ""}
  </div>
</body></html>
  `.trim();
}

async function writeLocalTeamSubmission(
  member: TeamMember,
  payload: TeamDirectPayload,
  response: TeamDirectResponse,
): Promise<string> {
  if (IS_VERCEL) return "skipped (Vercel)";
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const dir = path.join(projectRoot, "shared", "submissions", "team-direct");
    await fs.mkdir(dir, { recursive: true });
    const filename = `${stampForFilename(new Date())}-${member.slug}.json`;
    const filepath = path.join(dir, filename);
    const payloadOut = {
      member: { slug: member.slug, displayName: member.displayName, role: member.role },
      submittedAt: payload.submittedAt,
      shape: payload.shape,
      shapeLabel: SHAPE_LABELS[payload.shape],
      situation: payload.situation,
      tried: payload.tried || null,
      moniqueResponse: response,
    };
    await fs.writeFile(filepath, JSON.stringify(payloadOut, null, 2), "utf-8");
    return `ok: ${filepath}`;
  } catch (e) {
    return `failed: ${(e as Error).message}`;
  }
}

async function fireTeamGhlWrites(
  member: TeamMember,
  payload: TeamDirectPayload,
  response: TeamDirectResponse,
): Promise<void> {
  const contactIdEnv = member.slug === "chozen"
    ? process.env.GHL_MAMS_CHOZEN_CONTACT_ID
    : process.env.GHL_MAMS_WENDY_CONTACT_ID;
  if (!contactIdEnv) return;
  const tag = `team-direct-${member.slug}-submitted`;
  const noteBody = buildTeamNoteBody(member, payload, response);
  const emailHtml = buildTeamEmailHtml(member, payload, response);
  const subjectTrail = payload.situation.slice(0, 60).trim();
  const writes = await Promise.allSettled([
    ghlPost(`/contacts/${contactIdEnv}/notes`, { body: noteBody }),
    ghlPost(`/contacts/${contactIdEnv}/tags`, { tags: [tag] }),
    ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId: contactIdEnv,
      emailTo: "miles@milesagee.com",
      subject: `${member.displayName} -> Monique: ${subjectTrail}`,
      html: emailHtml,
    }),
  ]);
  for (const w of writes) {
    if (w.status === "rejected") {
      console.error("[team-direct][ghl-write]", (w as PromiseRejectedResult).reason);
    }
  }
}

function buildSystemPrompt(member: TeamMember): string {
  return [
    "# Monique direct line for " + member.displayName,
    "",
    "You are Monique, Miles Agee's AI executive assistant. You are responding directly to " + member.displayName + " (" + member.role + ") through the direct-line surface on her dashboard.",
    "",
    "Your output must be JSON with this exact shape:",
    "```json",
    JSON.stringify(
      {
        headline: "short one-line summary, plain text, 8-14 words",
        body: "the full response. Markdown allowed: paragraphs, lists, bold. This is what renders on her page.",
        next_step: "OPTIONAL. One line proposing the obvious next move (e.g., 'Want me to draft the follow-up email too?'). Omit if there isn't a clean next step.",
      },
      null,
      2,
    ),
    "```",
    "",
    "Hard rules:",
    "- JSON only, no markdown fence around the JSON itself, no prose before or after.",
    "- The `body` field uses markdown for structure but renders cleanly. Use lists, paragraphs, headers as appropriate.",
    "- No em dashes anywhere. Use commas, colons, or sentence breaks instead. This is a hard project rule.",
    "- Match Miles's voice for drafts that go OUT to clients. Match HER voice for internal notes/drafts.",
    "- Specificity over softness. Name the actual situation, never generic patterns.",
    "- Never explain what AI is or what you can do. Just deliver.",
    "",
    "## Core thesis (apply to every output)",
    "",
    MONIQUE_CORE_THESIS,
    "",
    "## Who you're talking to",
    "",
    member.contextBundle,
    "",
    "## MAMS brand philosophy (for any client-facing drafts)",
    "",
    MAMS_BRAND_PHILOSOPHY,
  ].join("\n");
}

function buildUserMessage(payload: TeamDirectPayload, member: TeamMember): string {
  return [
    member.displayName + " just submitted through her direct line. Shape of help: " + SHAPE_LABELS[payload.shape] + ".",
    "",
    "Situation (verbatim, what she wrote):",
    payload.situation.trim(),
    payload.tried
      ? [
          "",
          "What she's already tried or considered:",
          payload.tried.trim(),
        ].join("\n")
      : "",
    "",
    "Respond now. JSON only, in the shape specified in the system prompt.",
  ]
    .filter(Boolean)
    .join("\n");
}

function loadAnthropicKey(): string | null {
  const candidates = [
    process.env.ANTHROPIC_API_KEY,
    process.env.CLAUDE_API_KEY,
  ];
  for (const k of candidates) if (k) return k;
  return null;
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (cachedClient) return cachedClient;
  const apiKey = loadAnthropicKey();
  if (!apiKey) return null;
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

function parseModelResponse(raw: string): TeamDirectResponse | null {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped) as {
      headline?: string;
      body?: string;
      next_step?: string;
      nextStep?: string;
    };
    if (!parsed.body) return null;
    return {
      headline: parsed.headline || "",
      body: parsed.body,
      nextStep: parsed.next_step ?? parsed.nextStep ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "missing_token", message: "Direct line URL missing token." },
        { status: 400 },
      );
    }

    const member = getTeamMemberByToken(token);
    if (!member) {
      return NextResponse.json(
        { ok: false, error: "invalid_token", message: "This direct-line URL is not recognized." },
        { status: 401 },
      );
    }

    let payload: TeamDirectPayload;
    try {
      payload = (await req.json()) as TeamDirectPayload;
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_json", message: "Submission could not be read." },
        { status: 400 },
      );
    }

    const validationErr = validatePayload(payload);
    if (validationErr) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", details: validationErr, message: validationErr.reason },
        { status: 422 },
      );
    }

    const client = getClient();
    if (!client) {
      return NextResponse.json(
        {
          ok: false,
          error: "anthropic_key_missing",
          message: "Server is not configured to reach Monique right now. Text Miles directly.",
        },
        { status: 500 },
      );
    }

    const systemPrompt = buildSystemPrompt(member);
    const userMessage = buildUserMessage(payload, member);

    let response: TeamDirectResponse | null = null;
    try {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      });
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      response = parseModelResponse(text);
      if (!response) {
        console.error("[team-direct] model returned non-JSON. Raw:", text.slice(0, 500));
      }
    } catch (e) {
      console.error("[team-direct] Anthropic call failed:", (e as Error).message);
    }

    if (!response) {
      return NextResponse.json(
        {
          ok: false,
          error: "model_error",
          message: "Hit a wall on the response. Try again in a minute, or text Miles if it keeps happening.",
        },
        { status: 502 },
      );
    }

    // Persist for chamber-pulse readability. Local file is canonical (works
    // even when no per-team-member contactId is configured). GHL writes are
    // best-effort and gated on env vars. Both must complete BEFORE the response
    // returns: on Vercel serverless the function is frozen/killed once the
    // response ships, so a fire-and-forget write can silently never run.
    // fireTeamGhlWrites uses Promise.allSettled internally and never rejects,
    // so awaiting it is safe and cannot 500 the submission.
    const localFileStatus = await writeLocalTeamSubmission(member, payload, response);
    if (!localFileStatus.startsWith("ok")) {
      console.error("[team-direct][local-file]", localFileStatus);
    }
    await fireTeamGhlWrites(member, payload, response);

    return NextResponse.json({
      ok: true,
      recipient: member.displayName,
      response,
    });
  } catch (e) {
    console.error("[team-direct/submit] unhandled:", e);
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

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST with ?t=<token> and a TeamDirectPayload body to use the direct line.",
    },
    { status: 405 },
  );
}
