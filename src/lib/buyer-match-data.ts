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
  sourceUrl: string; // Zillow/Redfin/FSBO/etc. -- the clickable "see all photos" link

  // Primary listing photo (the buyer needs a face to the address; a list of
  // details with no image leaves them unable to tell if they've seen it or
  // get any feel for it). External CDN URL (Zillow/Redfin/MLS). Card renders a
  // thumbnail that links to sourceUrl. Null falls back to a branded placeholder.
  photoUrl: string | null;

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

// A per-neighborhood read. Renders as a card above the shortlist. Lets the
// portal carry real market mastery even before (or alongside) the property
// list -- the analysis is the part no saved search gives the buyer.
export type NeighborhoodRead = {
  name: string;
  rankLabel: string; // "Your #1", "Your #2", "Your stretch"
  body: string; // factual character, 2-4 sentences, no fair-housing claims
  budgetReality: string; // honest read on what their budget gets here
};

export type BuyerMatchData = {
  contactId: string;
  firstName: string;
  shareToken: string;

  // Top-of-page market commentary -- Miles voice, 60-100 words
  marketCommentary: string;

  // Optional: the must-have reconciliation read. Longer-form than the
  // commentary. Surfaces the tension between stated must-haves and stated
  // neighborhoods and names the trade-off the buyer has to make first.
  strategyHeading?: string;
  strategy?: string;

  // Optional: per-neighborhood reads, rendered as cards above the shortlist.
  neighborhoodReads?: NeighborhoodRead[];

  // Optional: ETA copy for the shortlist-pending state ("by tomorrow morning").
  // When properties is empty, the page renders a substantive "being built"
  // state instead of a thin placeholder.
  shortlistEta?: string;

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
export const CONTACTS: Record<string, BuyerMatchData> = {
  // Cece Bach -- intake submitted 2026-05-31. Verified shortlist (the property
  // cards) is being curated by Perplexity Computer; this entry ships the
  // market-read core today and the cards populate when PC returns.
  lgeB3atlT6LsxEzT3mdr: {
    contactId: "lgeB3atlT6LsxEzT3mdr",
    firstName: "Cece",
    shareToken: "9fomF7b7cNzO",
    marketCommentary:
      "Here is the honest read on your search, Cece. A garage plus a basement points straight at a detached single-family home. Broad Rock, your top pick, has that kind of house, but most of it trades under $250,000, so your budget is actually strong there. Jackson Ward gives you the walkable energy and covered parking, but those are condos, which means a basement is off the table. Near West End has the houses with basements, but they tend to start where your budget ends. None of that slows us down. It tells me exactly where to dig first, and which trade-off is yours to call.",
    strategyHeading: "What your must-haves are really telling me",
    strategy:
      "Garage, parking, and basement together describe a freestanding house with a yard, not a condo. That one detail decides everything else. If the house is non-negotiable, Broad Rock is where your budget reaches furthest, and I widen the radius into the Southside pockets right around it to find the renovated or larger ones that rarely hit the public sites. If walkable and close-in is what pulled you toward Jackson Ward, we trade the basement for a condo with covered parking in the $300,000s and you gain location. If the basement is the line you will not cross, Near West End has them, and we either stretch toward the top of your range or move fast on the one that has been sitting. You do not have to decide today. I just need to know which of the three matters most, because that is the lever the whole search turns on.",
    neighborhoodReads: [
      {
        name: "Broad Rock",
        rankLabel: "Your #1",
        body: "Southside neighborhood roughly ten minutes from downtown, built mostly mid-century, with detached single-family homes on their own lots and easy access to Route 1 and Hull Street. It is residential and car-friendly rather than walk-everywhere, anchored by the Broad Rock Community Center and park.",
        budgetReality:
          "This is the one neighborhood on your list where your budget is upper-tier instead of entry-level. Most homes here trade under $250,000, so $250,000 to $400,000 buys you the renovated or larger end, and a garage plus basement is most findable here. The catch is that a lot of this inventory never reaches Zillow, which is exactly where having someone pulling listings for you pays off.",
      },
      {
        name: "Near West End",
        rankLabel: "Your #2",
        body: "Dense, highly walkable historic area near the museums, full of early-1900s brick rowhouses and single-family homes, with Cary Street and Main Street retail and strong transit. This is where the houses with real basements live.",
        budgetReality:
          "This is the top of your range. Houses with basements exist, but they mostly start around $400,000, and under $350,000 here usually means a condo or a smaller attached home. Realistic if you are willing to stretch toward your prequal ceiling or move quickly on a listing that has lingered.",
      },
      {
        name: "Jackson Ward",
        rankLabel: "Your #3",
        body: "Historic neighborhood just north of Broad Street, mixing 1800s and 1900s rowhouses with newer loft-conversion condos. Very walkable, sits on the Pulse rapid-transit line, and carries the Arts District energy.",
        budgetReality:
          "Your budget fits here comfortably, but the inventory is mostly condos in the $300,000 to $400,000 band. Covered or assigned parking, yes. A private basement, almost never. Best fit if walkability and location outrank the basement on your list.",
      },
    ],
    shortlistEta: "by tomorrow morning",
    properties: [],
    sources: [],
    completedAt: "2026-06-01T00:00:00.000Z",
  },
};

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
      strategyHeading: parsed.strategyHeading,
      strategy: parsed.strategy,
      neighborhoodReads: parsed.neighborhoodReads,
      shortlistEta: parsed.shortlistEta,
      properties: parsed.properties as BuyerMatchProperty[],
      sources: parsed.sources || [],
      completedAt: parsed.completedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
