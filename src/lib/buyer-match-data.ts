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
  // Cece Bach -- intake submitted 2026-05-31. Shortlist populated 2026-06-07
  // from the refreshed PC brief (5 verified properties; the 6/1 set lost
  // Nicolet + 3 others to pending/sold during the 6-day refresh window).
  lgeB3atlT6LsxEzT3mdr: {
    contactId: "lgeB3atlT6LsxEzT3mdr",
    firstName: "Cece",
    shareToken: "9fomF7b7cNzO",
    marketCommentary:
      "Cece, the default feed is still missing what your mom actually needs because it treats garage, parking, basement, and storage like normal checkboxes. They are not. Jackson Ward is mostly showing condo inventory at this price, while Broad Rock and the Forest Hill / Swansboro edge are where the detached options actually live. The Richmond median sale price hit $402,292 in April 2026 per Redfin, up 0.6% year over year, so Zillow's default sort is burying the practical single-family homes that fit what you described.",
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
    properties: [
      {
        slug: "1116-e-16th-street",
        address: "1116 E 16th Street",
        city: "Richmond",
        state: "VA",
        zip: "23224",
        listPrice: 329990,
        priceLabel: "$329,990",
        beds: 3,
        baths: 2,
        sqft: 1853,
        mlsNumber: "2613963",
        daysOnMarket: 16,
        sourceUrl:
          "https://www.coldwellbanker.com/va/richmond/1116-e-16th-st/lid-P00800000HBMfGZKmlVkb1Ex78Q7sNrgp86W9W3S",
        photoUrl:
          "https://photos.zillowstatic.com/fp/a8a1855daab6d4178c7ccb6032a1e696-cc_ft_1536.jpg",
        gapFillReason:
          "Consumer portals do not tag this as a basement-plus-shed match even though the listing copy explicitly names both, so buyers filtering on 'finished basement' miss it because the standard checkbox filters don't read prose.",
        vibes:
          "This is the strongest mechanical match on the refreshed list. The listing text at villagesells.com confirms a spacious finished basement with rec room potential, a storage shed, exterior basement access, a fully fenced yard, updated granite kitchen, updated roof, HVAC, and electrical. It sits at $178 per sqft in the Oak Grove corridor south of the river, with an open house held today. The 1947 Cape Cod footprint means the basement is real, not a crawl space note buried in a brochure.",
        anchors: [
          {
            name: "Dollar Tree",
            address: "2128 Hull St, Richmond, VA 23224",
            distance: "6 min drive",
            matches: "daily-errand anchor",
          },
          {
            name: "Legend Brewing Co",
            address: "321 W 7th St, Richmond, VA 23224",
            distance: "5 min drive",
            matches: "local dining anchor",
          },
          {
            name: "Reedy Creek Trail Parking Lot",
            address: "4190 Riverside Dr, Richmond, VA 23225",
            distance: "9 min drive",
            matches: "outdoor anchor",
          },
        ],
        whyThisOne:
          "The public listing names both a finished basement and a storage shed, which is the closest confirmed mechanical match to what you described as must-haves, priced $115K under your ceiling.",
        tradeOff:
          "It sits closer to the Manchester / Oak Grove corridor than your named neighborhoods, so the commute math and daily errand pattern need a check before you commit to the location.",
      },
      {
        slug: "1600-decatur-street",
        address: "1600 Decatur Street",
        city: "Richmond",
        state: "VA",
        zip: "23224",
        listPrice: 345000,
        priceLabel: "$345,000",
        beds: 3,
        baths: 3,
        sqft: 1742,
        mlsNumber: "2614206",
        daysOnMarket: 11,
        sourceUrl:
          "https://www.era.com/property/detail/va/richmond/1600-decatur-st/lid-P00800000HBZM4X2Cc1J18meehTSBhTYAth3Yri7",
        photoUrl:
          "https://photos.zillowstatic.com/fp/d04e61de6c7fe68384ae459a7e0ea1eb-p_e.webp",
        gapFillReason:
          "The property is listed as coming-soon on some portals and fully active on others, which depresses its view count while serious buyers wait.",
        vibes:
          "Renovated 2-story Colonial near the Manchester / James River edge, 3 beds, 2.5 baths, 1,742 sqft, listed at $198 per sqft. The atkinsonrealtysales.com copy calls out a beautifully renovated home with hardwood floors and a privacy fence. On-street parking is confirmed; the listing does not name a garage or basement. The trade-off is real. The location carries the argument: under 5 minutes from Belle Isle, Hull Street corridor, and the James River park access points.",
        anchors: [
          {
            name: "Stella's Grocery Manchester",
            address: "609 Hull St, Richmond, VA 23224",
            distance: "3 min drive",
            matches: "food and errand anchor",
          },
          {
            name: "Crossroads Coffee and Ice Cream",
            address: "3600 Forest Hill Ave, Richmond, VA 23225",
            distance: "5 min drive",
            matches: "coffee anchor",
          },
          {
            name: "Belle Isle / James River Park",
            address: "Belle Isle, Richmond, VA 23224",
            distance: "5 min drive",
            matches: "outdoor anchor",
          },
        ],
        whyThisOne:
          "It gives a renovated 3-bed detached Colonial under $350K near the Manchester / James River edge, which is one click south from where the budget can get tighter.",
        tradeOff:
          "On-street parking only and no confirmed basement or storage in the public listing, so this resolves location and renovated condition but not the garage and basement asks.",
      },
      {
        slug: "227-e-35th-street",
        address: "227 E 35th Street",
        city: "Richmond",
        state: "VA",
        zip: "23224",
        listPrice: 339950,
        priceLabel: "$339,950",
        beds: 3,
        baths: 3,
        sqft: 1256,
        mlsNumber: "2614092",
        daysOnMarket: 10,
        sourceUrl:
          "https://www.redfin.com/VA/Richmond/227-E-35th-St-23224/home/55432140",
        photoUrl:
          "https://photos.zillowstatic.com/fp/6c1834598934d524b6a585088764e3cf-cc_ft_960.jpg",
        gapFillReason:
          "Zillow is showing this as off-market while Redfin and the MLS feeds all confirm it is active, which means buyers relying on Zillow as their primary feed have already moved on from a listing that is still live.",
        vibes:
          "Completely renovated 1923 bungalow in the Swansboro / Forest Hill edge, 3 beds, 3 baths (private ensuite in primary, Jack and Jill connecting the other two), 1,256 sqft, 4,251 sqft lot, $271 per sqft. The MLS data confirms parking as carport plus off-street, a mechanical detail Redfin's display understates as '1 parking space.' Hardwood floors through main living areas, all three baths fully renovated, LVP in bathrooms.",
        anchors: [
          {
            name: "Crossroads Coffee and Ice Cream",
            address: "3600 Forest Hill Ave, Richmond, VA 23225",
            distance: "3 min drive",
            matches: "coffee anchor",
          },
          {
            name: "Food Lion",
            address: "5620 Hull St, Richmond, VA 23225",
            distance: "7 min drive",
            matches: "grocery anchor",
          },
          {
            name: "Forest Hill Park",
            address: "4021 Forest Hill Ave, Richmond, VA 23225",
            distance: "5 min drive",
            matches: "outdoor anchor",
          },
        ],
        whyThisOne:
          "The MLS data confirms carport plus off-street parking, which is two of the stated must-haves addressed in the listing record. Three baths, fully renovated turnkey condition, inside budget, and positioned in the Swansboro pocket where per-sqft pricing is still reasonable.",
        tradeOff:
          "Only 1,256 sqft and no confirmed basement, so enclosed storage needs to come from the lot, not the footprint.",
      },
      {
        slug: "14-1-2-w-leigh-street",
        address: "14 1/2 W Leigh Street",
        city: "Richmond",
        state: "VA",
        zip: "23220",
        listPrice: 425000,
        priceLabel: "$425,000",
        beds: 2,
        baths: 3,
        sqft: 1672,
        mlsNumber: "2614349",
        daysOnMarket: 9,
        sourceUrl:
          "https://midatlantic.penfedrealty.com/listing/cvrmls/2614349/Richmond/14-12-W-Leigh-Street/",
        photoUrl:
          "https://photos.zillowstatic.com/fp/0d07fb38905d589cb7a7c58a47f65ea9-cc_ft_1536.jpg",
        gapFillReason:
          "A single-family detached structure in Jackson Ward under $450K is rare; most buyers searching Jackson Ward are finding condos, and this one keeps getting buried behind them.",
        vibes:
          "Historic Jackson Ward single-family, 1900 construction, 2 beds, 2.5 baths, 1,672 sqft, 3,429 sqft lot. The PenFed copy mentions original hardwood flooring, soaring ceilings, a rear mudroom with built-in storage, and 1 off-street parking spot. The listing also notes zero finished below-grade area, so no basement. The structure is the appeal: this is a house, not a unit.",
        anchors: [
          {
            name: "Monroe Park",
            address: "620 W Main St, Richmond, VA 23220",
            distance: "4 min drive",
            matches: "downtown outdoor anchor",
          },
          {
            name: "Publix Super Market at Carytown Exchange",
            address: "3501 W Cary St, Richmond, VA 23221",
            distance: "11 min drive",
            matches: "grocery anchor",
          },
          {
            name: "Ellwood Thompson's",
            address: "4 N Thompson St, Richmond, VA 23221",
            distance: "9 min drive",
            matches: "local grocery anchor",
          },
        ],
        whyThisOne:
          "It keeps Jackson Ward on the shortlist as a house structure rather than a condo, and the mudroom storage plus 1 off-street parking slot address at least two of the stated must-haves at a functional level.",
        tradeOff:
          "Near ceiling price for a 2-bed with no basement.",
      },
      {
        slug: "110-w-marshall-street-u43",
        address: "110 W Marshall Street #U43",
        city: "Richmond",
        state: "VA",
        zip: "23220",
        listPrice: 335000,
        priceLabel: "$335,000",
        beds: 2,
        baths: 2,
        sqft: 1170,
        mlsNumber: "2612460",
        daysOnMarket: null,
        sourceUrl:
          "https://www.zillow.com/homedetails/110-W-Marshall-St-U43-Richmond-VA-23220/89104816_zpid/",
        photoUrl:
          "https://photos.zillowstatic.com/fp/99d1e9e29893bb66f69eade220ee02a5-cc_ft_960.jpg",
        gapFillReason:
          "The covered parking space that conveys is not flagged in standard Jackson Ward condo searches, which push HOA parking as a separate fee add-on; this one bakes it into the price.",
        vibes:
          "1915 low-rise Jackson Ward condo, 2 beds, 2 baths, 1,170 sqft, $286 per sqft. Coming soon with an active date of June 18. Zillow copy confirms a covered parking space conveys with the unit at no additional cost, plus a new Whirlpool washer/dryer (2025), new James River Air HVAC (June 2024), exposed brick, bamboo floors, granite countertops, and a private balcony off the primary. HOA is $669/month, which is the number to run through the financing equation before treating this as a clean budget fit.",
        anchors: [
          {
            name: "Whole Foods Market",
            address: "2024 W Broad St, Richmond, VA 23220",
            distance: "6 min drive",
            matches: "grocery anchor",
          },
          {
            name: "Shields Market",
            address: "206 N Shields Ave, Richmond, VA 23220",
            distance: "8 min drive",
            matches: "local market anchor",
          },
          {
            name: "Virginia Museum of Fine Arts",
            address: "200 N Arthur Ashe Blvd, Richmond, VA 23220",
            distance: "9 min drive",
            matches: "lifestyle anchor",
          },
        ],
        whyThisOne:
          "It is the Jackson Ward control card that shows what the neighborhood actually delivers under budget, including a covered parking solution that most units at this price point do not offer.",
        tradeOff:
          "Strong neighborhood match, weak must-have match overall, with no basement or storage, and the $669/month HOA materially changes the true cost of ownership at this price point.",
      },
    ],
    sources: [
      {
        url: "https://www.coldwellbanker.com/va/richmond/1116-e-16th-st/lid-P00800000HBMfGZKmlVkb1Ex78Q7sNrgp86W9W3S",
        description: "Coldwell Banker, 1116 E 16th Street -- active status, MLS# 2613963.",
      },
      {
        url: "https://www.villagesells.com/real-estate/1116-e-16th-street-richmond-va-23224/2613963/196957273",
        description: "VillageSells, 1116 E 16th Street -- finished basement, storage shed, fenced yard, open house.",
      },
      {
        url: "https://www.era.com/property/detail/va/richmond/1600-decatur-st/lid-P00800000HBZM4X2Cc1J18meehTSBhTYAth3Yri7",
        description: "ERA Real Estate, 1600 Decatur Street -- active status, MLS# 2614206.",
      },
      {
        url: "https://atkinsonrealtysales.com/listing/cvrmls/2614206/Richmond/1600-Decatur-Street/",
        description: "AtkinsonRealtySales, 1600 Decatur Street -- renovation details, 11 days on market.",
      },
      {
        url: "https://www.redfin.com/VA/Richmond/227-E-35th-St-23224/home/55432140",
        description: "Redfin, 227 E 35th Street -- active status, MLS# 2614092, parking.",
      },
      {
        url: "https://atkinsonrealtysales.com/listing/cvrmls/2614092/Richmond/227-E-35th-Street/",
        description: "AtkinsonRealtySales, 227 E 35th Street -- carport + off-street parking confirmed.",
      },
      {
        url: "https://bluedogrva.com/idx/mls-2614092-227_e_35th_street_richmond_va_23224",
        description: "BlueDog RVA, 227 E 35th Street -- active status, last updated 6/7/26.",
      },
      {
        url: "https://midatlantic.penfedrealty.com/listing/cvrmls/2614349/Richmond/14-12-W-Leigh-Street/",
        description: "PenFed Realty, 14 1/2 W Leigh Street -- mudroom storage, single-family, MLS# 2614349.",
      },
      {
        url: "https://www.zillow.com/homedetails/110-W-Marshall-St-U43-Richmond-VA-23220/89104816_zpid/",
        description: "Zillow, 110 W Marshall Street #U43 -- coming soon 06/18, covered parking conveys, HOA $669/mo.",
      },
      {
        url: "https://www.redfin.com/city/17149/VA/Richmond",
        description: "Redfin, Richmond median sale price -- $402,292 April 2026, +0.6% YoY.",
      },
    ],
    completedAt: "2026-06-07T14:07:48-04:00",
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
