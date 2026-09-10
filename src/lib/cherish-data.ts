/**
 * The Cherish Room, token lookup and payload validation.
 *
 * Private weekly accountability surfaces for the two men whose perspective Miles
 * trusts. One page each, never shared, never indexed. Personal lane.
 *
 * Neither recipient has a GHL contact record and neither should get one. They are
 * friends, not leads. Submissions relay through Miles's own contact record so
 * nothing about this touches the business pipeline.
 *
 * The page-side source of truth is scripts/cherish-room/state/recipients.json.
 * Tokens must match that file. Rotate with:
 *   node -e "console.log(require('crypto').randomBytes(9).toString('base64url'))"
 */

export type CherishRecipient = {
  slug: "reid" | "darius";
  token: string;
  displayName: string;
  pageSlug: string;
};

export const CHERISH_RECIPIENTS: Record<string, CherishRecipient> = {
  reid: {
    slug: "reid",
    token: "zNgjL9qECS8w",
    displayName: "Reid",
    pageSlug: "r-MfqhdW8ehU0",
  },
  darius: {
    slug: "darius",
    token: "lXmUcUGD9fSI",
    displayName: "Darius",
    pageSlug: "d-aYdeanFCEMQ",
  },
};

/** Miles's own GHL contact record. The relay, so friends stay out of the CRM. */
export const RELAY_CONTACT_ID = "aTE32T0AwFEzoyqRXtMt";
export const RELAY_EMAIL = "miles@milesagee.com";

export type CherishPayload = {
  see?: string;
  hold?: string;
  dinner?: string;
  note?: string;
  weekOf: string;
  submittedAt: string;
  userAgent?: string;
};

export type ValidationError = { field: string; reason: string };

const CAP = 5000;

export function getCherishRecipientByToken(token: string): CherishRecipient | null {
  for (const r of Object.values(CHERISH_RECIPIENTS)) {
    if (r.token === token) return r;
  }
  return null;
}

export function validateCherishPayload(p: Partial<CherishPayload>): ValidationError | null {
  const fields: Array<keyof CherishPayload> = ["see", "hold", "dinner", "note"];
  for (const f of fields) {
    const v = p[f];
    if (v != null && typeof v !== "string") {
      return { field: f, reason: "Expected text." };
    }
    if (typeof v === "string" && v.length > CAP) {
      return { field: f, reason: `Cap is ${CAP} characters.` };
    }
  }
  const filled = fields.some((f) => typeof p[f] === "string" && (p[f] as string).trim().length > 0);
  if (!filled) {
    return { field: "see", reason: "Write something first." };
  }
  if (!p.weekOf || !/^\d{4}-\d{2}-\d{2}$/.test(p.weekOf)) {
    return { field: "weekOf", reason: "Missing or malformed week." };
  }
  return null;
}
