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
