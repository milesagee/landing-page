/**
 * Buyer-intake data shape + lookup.
 *
 * Single source of truth for the BuyerIntakePayload type the wizard
 * constructs and the submit API consumes. Mirrors the contract in
 * `.claude/skills/buyer-intake-portal/intake-shape.md`.
 *
 * Lookup model: contactId + token. The token is generated server-side
 * via `node -e "require('crypto').randomBytes(9).toString('base64url')"`
 * and stored on the GHL contact as `buyer_intake_token`. The CONTACTS
 * map below is the v1 static fallback so the page renders during the
 * skill's first cast; production reads from GHL directly via the
 * lib/ghl-buyer-intake.ts helper (sibling, queued).
 */

export type IntakeTimeline =
  | "this-month"
  | "next-30-60-days"
  | "next-90-days"
  | "flexible-3-6-months"
  | "still-deciding";

export type IntakeCurrentSituation =
  | "renting"
  | "with-family"
  | "owning-selling-first"
  | "owning-keeping"
  | "relocating-to-richmond"
  | "other";

export type BuyerIntakePayload = {
  budgetMin: number;
  budgetMax: number;
  prequalAmount: number;
  minBeds: number;
  minBaths: number;
  topNeighborhoods: string[];
  mustHaves: string[];
  timeline: IntakeTimeline;
  currentSituation: IntakeCurrentSituation;
  notes: string;
  submittedAt: string;
  userAgent: string;
};

export type Stage1Insight = {
  slot: number;
  eyebrow: string;
  headline: string;
  body: string;
  verifiableSpecific: string;
};

export type Stage1Response = {
  insights: Stage1Insight[];
  nextStepPromise: string;
};

export type BuyerIntakeContact = {
  contactId: string;
  shareToken: string;
  firstName: string;
  // Established-channel flag drives the Monique-line SMS routing.
  // "personal-cell-imessage" => post-submit SMS includes the Monique intro context
  // "mams-line-established"  => Monique already known, skip intro framing
  // "cold"                   => first contact ever, full Monique intro
  establishedChannel: "personal-cell-imessage" | "mams-line-established" | "cold";
  // Optional pre-filled values from past conversations or initial outreach.
  // The wizard reads these as starting state and the buyer can override.
  prefill?: Partial<BuyerIntakePayload>;
};

// v1 ref impl: Ethan Halfhide, +1-757-746-4322, prequal landed 2026-05-18.
// $300k now, $350k after final qualification. Established channel: Miles's
// personal cell, iMessage. Created in MAMS GHL on 2026-05-18 via
// scripts/insiderrva/buyer-intake-bootstrap.js.
export const CONTACTS: Record<string, BuyerIntakeContact> = {
  "bVWiepmFuABEHLmbxTwF": {
    contactId: "bVWiepmFuABEHLmbxTwF",
    shareToken: "uXs2yBlT--zO",
    firstName: "Ethan",
    establishedChannel: "personal-cell-imessage",
    prefill: {
      // Source: 2026-05-18 iMessage. Ethan: "For $300k once I get official
      // qualification will hopefully be $350k." Two-bed floor inherited from
      // prior conversation context (Rockets Landing 1bd was undersized).
      minBeds: 2,
      minBaths: 1,
      prequalAmount: 300000,
      budgetMax: 350000,
    },
  },
};

export function getBuyerIntakeByToken(
  contactId: string,
  token: string,
): BuyerIntakeContact | null {
  const c = CONTACTS[contactId];
  if (!c) return null;
  if (c.shareToken !== token) return null;
  return c;
}

// ----- Chip sets (mirrored from intake-shape.md, locked at v1) -----

export const NEIGHBORHOOD_CHIPS: string[] = [
  "Scott's Addition",
  "The Fan",
  "Museum District",
  "Church Hill",
  "Shockoe Bottom",
  "Manchester",
  "Carytown",
  "Forest Hill",
  "Westover Hills",
  "Northside",
  "Oregon Hill",
  "The Diamond",
  "Jackson Ward",
  "Bellevue",
  "Ginter Park",
  "Battery Park",
  "Highland Park",
  "Byrd Park",
  "Maymont",
  "Randolph",
  "Deerbourne",
  "Stratford Hills",
  // Districts (umbrella)
  "Near West",
  "East End",
  "Southside",
  "Downtown",
  "Broad Rock",
];

export type MustHaveChip = {
  slug: string;
  label: string;
};

export const MUST_HAVE_CHIPS: MustHaveChip[] = [
  { slug: "garage", label: "Garage" },
  { slug: "yard", label: "Yard" },
  { slug: "home-office", label: "Home office" },
  { slug: "primary-down", label: "Primary suite on first floor" },
  { slug: "walkable", label: "Walkable neighborhood" },
  { slug: "quiet-block", label: "Quiet block" },
  { slug: "move-in-ready", label: "Move-in ready" },
  { slug: "historic-character", label: "Historic character" },
  { slug: "new-construction", label: "New construction" },
  { slug: "parking", label: "Off-street parking" },
  { slug: "basement", label: "Basement" },
  { slug: "pet-friendly", label: "Pet-friendly (no HOA issues)" },
];

export const TIMELINE_OPTIONS: { value: IntakeTimeline; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "next-30-60-days", label: "Next 30 to 60 days" },
  { value: "next-90-days", label: "Next 90 days" },
  { value: "flexible-3-6-months", label: "Flexible, 3 to 6 months" },
  { value: "still-deciding", label: "Still deciding" },
];

export const SITUATION_OPTIONS: { value: IntakeCurrentSituation; label: string }[] = [
  { value: "renting", label: "Renting" },
  { value: "with-family", label: "Living with family" },
  { value: "owning-selling-first", label: "Own now, will sell first" },
  { value: "owning-keeping", label: "Own now, keeping it" },
  { value: "relocating-to-richmond", label: "Relocating to Richmond" },
  { value: "other", label: "Something else" },
];

// ----- Validation -----

export type ValidationError = { field: string; reason: string };

export function validateIntake(
  p: Partial<BuyerIntakePayload>,
): ValidationError | null {
  if (!p.budgetMin || p.budgetMin < 50000) {
    return { field: "budgetMin", reason: "Budget minimum must be at least $50,000" };
  }
  if (!p.budgetMax || p.budgetMax < p.budgetMin) {
    return { field: "budgetMax", reason: "Max budget must be at or above the minimum" };
  }
  if (p.budgetMax > 5000000) {
    return { field: "budgetMax", reason: "Max budget over $5M not supported at v1" };
  }
  if (p.minBeds === undefined || p.minBeds < 0 || p.minBeds > 6) {
    return { field: "minBeds", reason: "Beds must be between 0 and 6" };
  }
  if (!p.minBaths || p.minBaths < 1 || p.minBaths > 5) {
    return { field: "minBaths", reason: "Baths must be between 1 and 5" };
  }
  if (!p.topNeighborhoods || p.topNeighborhoods.length === 0) {
    return { field: "topNeighborhoods", reason: "Pick at least one neighborhood" };
  }
  if (p.topNeighborhoods.length > 5) {
    return { field: "topNeighborhoods", reason: "Cap of 5 neighborhoods" };
  }
  for (const n of p.topNeighborhoods) {
    if (!NEIGHBORHOOD_CHIPS.includes(n)) {
      return { field: "topNeighborhoods", reason: `Unknown neighborhood: ${n}` };
    }
  }
  if (p.mustHaves && p.mustHaves.length > 3) {
    return { field: "mustHaves", reason: "Cap of 3 must-haves" };
  }
  if (p.mustHaves) {
    const valid = new Set(MUST_HAVE_CHIPS.map((c) => c.slug));
    for (const m of p.mustHaves) {
      if (!valid.has(m)) {
        return { field: "mustHaves", reason: `Unknown must-have: ${m}` };
      }
    }
  }
  if (!p.timeline) {
    return { field: "timeline", reason: "Pick a timeline" };
  }
  if (!p.currentSituation) {
    return { field: "currentSituation", reason: "Pick a current situation" };
  }
  if (p.notes && p.notes.length > 2000) {
    return { field: "notes", reason: "Notes capped at 2000 characters" };
  }
  return null;
}
