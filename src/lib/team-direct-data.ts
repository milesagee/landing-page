/**
 * Team direct-line data shape + token lookup.
 *
 * Each entry maps a per-recipient token to identity, role, and which bundled
 * context block (from src/data/team-direct-prompts.ts) to load. The pattern
 * mirrors src/lib/buyer-intake-data.ts but covers team members instead of
 * prospects.
 *
 * Tokens generated via:
 *   node -e "console.log(require('crypto').randomBytes(9).toString('base64url'))"
 *
 * To rotate a token: regenerate, paste here, push, hand the new URL to the
 * recipient. The old token immediately stops resolving.
 */

import { CHOZEN_CONTEXT, WENDY_CONTEXT } from "@/data/team-direct-prompts";

export type ShapeOfHelp = "draft" | "research" | "sparring" | "other";

export const SHAPE_LABELS: Record<ShapeOfHelp, string> = {
  draft: "Draft something for me to send",
  research: "Research depth I don't have time for",
  sparring: "Spar on a decision I'm sitting on",
  other: "Something else",
};

export type TeamDirectPayload = {
  situation: string;
  shape: ShapeOfHelp;
  tried?: string;
  submittedAt: string;
  userAgent?: string;
};

export type TeamMember = {
  slug: "chozen" | "wendy";
  token: string;
  displayName: string;
  role: string;
  email: string;
  // The bundled context string the API loads into the system prompt
  contextBundle: string;
};

export const TEAM_MEMBERS: Record<string, TeamMember> = {
  chozen: {
    slug: "chozen",
    token: "0-lqIk3XCvHN",
    displayName: "Chozen",
    role: "MAMS Lead Manager & Client Coordinator",
    email: "concierge@mamsnow.com",
    contextBundle: CHOZEN_CONTEXT,
  },
  wendy: {
    slug: "wendy",
    token: "MFCWUG5x_8e_",
    displayName: "Wendy",
    role: "MAMS Transaction Coordinator",
    email: "office@mamsnow.com",
    contextBundle: WENDY_CONTEXT,
  },
};

export function getTeamMemberByToken(token: string): TeamMember | null {
  for (const member of Object.values(TEAM_MEMBERS)) {
    if (member.token === token) return member;
  }
  return null;
}

export type TeamDirectResponse = {
  headline: string;
  body: string;
  nextStep?: string;
};

export type ValidationError = { field: string; reason: string };

export function validatePayload(
  p: Partial<TeamDirectPayload>,
): ValidationError | null {
  if (!p.situation || typeof p.situation !== "string") {
    return { field: "situation", reason: "Tell me what's going on." };
  }
  if (p.situation.trim().length < 100) {
    return {
      field: "situation",
      reason: "Give me at least a hundred characters of context. The fuller the picture, the sharper the answer.",
    };
  }
  if (p.situation.length > 5000) {
    return { field: "situation", reason: "Cap is 5000 characters. Anything longer, email it." };
  }
  if (!p.shape || !(["draft", "research", "sparring", "other"] as const).includes(p.shape as ShapeOfHelp)) {
    return { field: "shape", reason: "Pick the shape of help you need." };
  }
  if (p.tried && p.tried.length > 3000) {
    return { field: "tried", reason: "Cap on 'what you tried' is 3000 characters." };
  }
  return null;
}
