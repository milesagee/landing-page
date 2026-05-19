/**
 * Buyer-match (Stage 2) data shape + lookup.
 *
 * Consumed by /buyer-match/[contactId] route. Populated by the PC response
 * processor (scripts/insiderrva/buyer-match-processor.js) after Perplexity
 * Computer returns the deep-research deliverable.
 *
 * Lookup model: contactId + token. Token is freshly minted at processor time
 * (separate from buyer_intake_token; intake and match tokens are distinct so
 * Miles can revoke either independently).
 *
 * v1 has no production CONTACTS entries; the processor writes the v2_json to
 * GHL on a per-contact basis, and `getBuyerMatchByToken` could be upgraded
 * to read from GHL directly (sibling helper queued).
 */

export type AnchorMatch = {
  name: string;
  address: string;
  // Distance from property centroid. Either walking minutes (preferred) or drive minutes.
  // Format: "X min walk" or "X min drive".
  distance: string;
  matches: string; // The intake must-have or lifestyle tag this anchor pairs to
};

export type BuyerMatchProperty = {
  // Identity
  slug: string; // kebab-case slug from address, e.g. "2401-warwick-avenue"

  // Address block
  address: string;
  city: string;
  state: string;
  zip: string;

  // Listing facts
  listPrice: number | null; // null when off-market / FSBO without price
  priceLabel: string; // human-readable, e.g. "$425,000" / "Off-market" / "FSBO, ask Miles"
  beds: number;
  baths: number;
  sqft: number | null;
  mlsNumber: string | null; // null when not on MLS
  daysOnMarket: number | null;
  sourceUrl: string; // Zillow/Redfin/FSBO/etc.

  // The gap (the differentiator)
  gapFillReason: string; // ONE sentence; why MLS/Zillow miss it for this buyer

  // Vibes
  vibes: string; // 50-80 words, honest, one verifiable specific or empty

  // Anchor matches (exactly 3 per property)
  anchors: AnchorMatch[];

  // Per-buyer narrative
  whyThisOne: string; // ONE sentence; mechanics-first; cites intake specific
  tradeOff: string; // ONE sentence; "Clean fit -- no notable trade-offs surfaced." allowed
};

export type BuyerMatchData = {
  contactId: string;
  firstName: string;
  shareToken: string;

  // Top-of-page market commentary -- Miles voice, 60-100 words
  marketCommentary: string;

  // The shortlist
  properties: BuyerMatchProperty[];

  // Sources audit (rendered in footer)
  sources: { url: string; description: string }[];

  // Metadata
  completedAt: string; // ISO8601 when the PC research finished
};

// v1: no static contacts. Processor writes data to GHL and the page reads via
// the lookup function below. For development / first cast, populate CONTACTS
// inline (mirroring the offer-data.ts pattern) and migrate to GHL-backed
// reads in v2.
export const CONTACTS: Record<string, BuyerMatchData> = {};

export function getBuyerMatchByToken(
  contactId: string,
  token: string,
): BuyerMatchData | null {
  const d = CONTACTS[contactId];
  if (!d) return null;
  if (d.shareToken !== token) return null;
  return d;
}

// Parse a v2 JSON payload (the PC processor's output that gets written to the
// GHL `buyer_match_v2_json` custom field). Used by a future GHL-backed
// resolver to coerce the raw GHL value into a BuyerMatchData. Defensive:
// returns null if the payload is missing required keys.
export function parseBuyerMatchV2Json(raw: string | null | undefined): BuyerMatchData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BuyerMatchData>;
    if (!parsed.contactId || !parsed.firstName || !parsed.shareToken) return null;
    if (!Array.isArray(parsed.properties)) return null;
    return {
      contactId: parsed.contactId,
      firstName: parsed.firstName,
      shareToken: parsed.shareToken,
      marketCommentary: parsed.marketCommentary || "",
      properties: parsed.properties as BuyerMatchProperty[],
      sources: parsed.sources || [],
      completedAt: parsed.completedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
