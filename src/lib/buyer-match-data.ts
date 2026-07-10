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

// A single cited school datapoint. `point` is a neutral fact or a verbatim,
// attributed parent quote. It ALWAYS carries a source. If a datapoint has no
// source it does not exist on the page (fair-housing spine: every school
// statement is a citation, never an assertion in MAMS's own voice).
export type SchoolEvidenceItem = {
  point: string; // factual datapoint OR verbatim quoted parent text
  source: { label: string; url: string };
};

// The transparent "how the Read is built" method card, rendered once above the
// shortlist (mirrors Mary's Natural Light Score method card in home-dna). It
// names the sourced factors so the buyer sees the Read is a rollup of published
// indicators, not MAMS opinion.
export type SchoolReadFactor = {
  name: string; // e.g. "Assigned elementary", "Published academic signal"
  sourceNote: string; // one line naming the sourced inputs behind this factor
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

  // ---- Elementary-school lens (optional; buyer-stated priority) ----
  // All four render together or not at all. Populated only when the assigned
  // school was resolved from the exact address AND at least one sourced
  // datapoint exists. Empty beats invented.
  assignedElementary?: { name: string; source: { label: string; url: string } };
  // 0-10 transparent rollup of the buyer's stated priority against published
  // indicators. Sourced signal, not a MAMS quality claim. Drives the re-rank.
  schoolRead?: number;
  // One paragraph synthesizing the sourced evidence in the "sourced, never
  // claimed" voice. Never characterizes ("good"/"safe"/"family-friendly").
  schoolReadSummary?: string;
  // The cited evidence behind the Read: SOL data, ratings, ratios, programs,
  // and verbatim attributed parent quotes. Each item carries its source.
  schoolEvidence?: SchoolEvidenceItem[];
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

  // Optional: the elementary-school lens intro + method card. When present, the
  // page renders a "How your Elementary School Read is built" section and the
  // shortlist is ordered by schoolRead (buyer-stated priority). When absent, the
  // page renders exactly as before (no school lens).
  schoolLensIntro?: string; // Miles-voice, you-frame, method not opinion
  schoolMethod?: SchoolReadFactor[];

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

  // Emmanuel Massi -- IG DM lead, intake 06/13 + call 06/14. Military family at
  // Fort Gregg-Adams (Fort Lee). Preliminary cast 2026-06-15: market read +
  // neighborhood strategy live, properties[] empty until the PC deep-research
  // brief returns (shared/outbox-to-pc/2026-06-15-1240-emmanuel-massi-buyer-curation.yaml).
  Oxa0NouzAdpfkwdGwhCe: {
    contactId: "Oxa0NouzAdpfkwdGwhCe",
    firstName: "Emmanuel",
    shareToken: "vxUOs3NGh_CU",
    marketCommentary:
      "Emmanuel, at $500 to $600K you are shopping the upper tier of the Southside market, not fighting for scraps, and that shapes the whole strategy. Chesterfield's median sale price was $428,714 in May 2026 per Redfin, so your range reaches newer construction with the square footage a family needs, not a fixer. The commute math is the lever. Chester and the Route 10 corridor keep you tight to I-95 and the base, while Varina trades a little drive time for more land. The 2000s-or-newer filter is where the public sites quietly bury your strongest options.",
    strategyHeading: "What your must-haves are really telling me",
    strategy:
      "Three of your asks point the same direction: 2000s-or-newer, three-plus bedrooms, and a family-sized single-family or townhouse. In this market that profile lives in the newer subdivisions, and those cluster in specific pockets rather than spread evenly across all three areas. Chester is where newer construction and quick I-95 and base access overlap best, so it is the center of gravity. Chesterfield County widens the net into the newer Route 288 and Hull Street corridor builds when you want more house or more yard per dollar. Varina is the trade: more land and a quieter setting, fewer turnkey 2000s builds, and a longer run to the base. You do not have to choose today. I just need to know whether newest-possible construction or shortest-commute-to-base wins when they pull apart, because that is the one lever the whole search turns on. September move-in gives us room to do this right.",
    neighborhoodReads: [
      {
        name: "Chester",
        rankLabel: "Your #1",
        body: "Chester runs along the Route 10 corridor in northern Chesterfield, roughly fifteen minutes from Fort Gregg-Adams and a quick on-ramp to I-95 in either direction. It mixes established subdivisions with newer construction, anchored by a historic village center, everyday retail along Route 10, and easy reach to both Richmond and the Tri-Cities.",
        budgetReality:
          "This is where your range works hardest for the commute. At $500 to $600K you sit at the top of the local market here, so 2000s-or-newer single-family homes with the bedroom count and square footage you described are realistic, not a stretch. The newest inventory moves quickly, so the edge is seeing it early.",
      },
      {
        name: "Chesterfield County",
        rankLabel: "Your wider net",
        body: "Beyond Chester, the county opens into the newer-build corridors along Route 288 and the Hull Street and Midlothian directions. These pockets trade a few minutes of base commute for more recent construction, larger lots, and master-planned communities built in the 2000s and later.",
        budgetReality:
          "Your budget stretches furthest here on house and yard. The same $500 to $600K that buys a solid home in Chester can buy more square footage or a newer subdivision a little further out. The trade you are weighing is drive time to the base against house for the money.",
      },
      {
        name: "Varina",
        rankLabel: "Your trade",
        body: "Varina sits in eastern Henrico, just across the river from the Southside, with I-295 close at hand and a more open, rural character than Chester or the inner county. It is land-rich and quieter, with newer homes spread across larger parcels rather than concentrated in dense subdivisions.",
        budgetReality:
          "This is the land-and-space play. At your range you can find acreage and a newer home, but turnkey 2000s-or-newer inventory is thinner here and the run to Fort Gregg-Adams is longer than from Chester. Worth it if more land outranks a shorter commute.",
      },
    ],
    schoolLensIntro:
      "You told us the assigned elementary drives this search, so we resolved the exact school each address is zoned to and pulled the published record for each one: Virginia DOE pass rates and trend, GreatSchools and Niche figures, ratios, and verbatim parent reviews. The Read is a rollup of that sourced evidence against your stated priority, not our opinion of any school. Reconfirm every assignment with the district before contract, since boundaries can change.",
    schoolMethod: [
      {
        name: "Assigned elementary",
        sourceNote:
          "Point-in-polygon against the Chesterfield County Public Schools boundary layer (Virginia Open Data) and the Henrico County Public Schools attendance-zone locator, from each geocoded street address.",
      },
      {
        name: "Published academic signal",
        sourceNote: "Virginia DOE SOL reading and math pass rates plus trend, GreatSchools, and Niche.",
      },
      {
        name: "Program specifics",
        sourceNote: "Gifted, immersion, and specialty programs where the district or school publishes them.",
      },
      {
        name: "Class size",
        sourceNote: "Published enrollment and student-teacher ratio.",
      },
      {
        name: "Parent-reported texture",
        sourceNote: "Verbatim, attributed quotes from GreatSchools parent reviews, positive and negative.",
      },
    ],
    properties: [
      {
        slug: "15667-henningford-dr",
        address: "15667 Henningford Dr",
        city: "Chesterfield",
        state: "VA",
        zip: "23832",
        listPrice: 553000,
        priceLabel: "$553,000",
        beds: 3,
        baths: 3,
        sqft: 2194,
        mlsNumber: "2610493",
        daysOnMarket: null,
        sourceUrl: "https://www.compass.com/homedetails/15667-Henningford-Dr-Chesterfield-VA-23832/KS2NK_pid/",
        photoUrl: "https://www.compass.com/m/d1ba9e925d5c6409e758cefec08f3115de974739_img_0_ad1c7/640x480.jpg",
        gapFillReason:
          "Active 23836 inventory at your bed count and price was sparse at research date, so this secondary-area Chesterfield home carries the highest published school indicators on the list.",
        vibes:
          "Built 2022, 2,194 sqft, 3 bedrooms and 3 full baths at $553,000, reduced from $559,900 per the Compass record. The newest build year and the smallest square footage on the shortlist. Zoned to Winterpock Elementary, where published enrollment rose from 760 to 834 across the last three reported years per the VDOE profile.",
        anchors: [
          {
            name: "Fort Gregg-Adams",
            address: "",
            distance: "~48 min drive (free-flow, OSRM)",
            matches: "base commute",
          },
        ],
        whyThisOne:
          "The zoned school posts the highest published SOL pass rates on the shortlist while the home stays under your cap.",
        tradeOff:
          "The ~48-minute free-flow commute is the second longest on the list and 3 bedrooms is your stated minimum.",
        assignedElementary: {
          name: "Winterpock Elementary",
          source: {
            label: "Chesterfield elementary boundary layer (Virginia Open Data)",
            url: "https://data.virginia.gov/dataset/elementaryschoolboundary-layer",
          },
        },
        schoolRead: 8,
        schoolReadSummary:
          "Winterpock posts the highest published numbers on your shortlist: SOL reading 86% and math 89% for 2024-25, Fully Accredited, Niche A minus, 16:1 student-teacher ratio, not a Title I school. Enrollment grew from 760 to 834 over three published years, and parent reviews on GreatSchools run both directions, including a 2021 parent describing crowding from new construction and a 2024 parent alleging bullying of new students. The Read reflects the published indicators plus that mixed parent texture; a GreatSchools overall rating was not extractable at research date.",
        schoolEvidence: [
          {
            point: "SOL All Students reading pass rate: 86% (2022-23), 83% (2023-24), 86% (2024-25); math 85%, 84%, 89%.",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/winterpock-elementary" },
          },
          {
            point: "Fully Accredited; enrollment 760 (2022-23), 798 (2023-24), 834 (2024-25).",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/winterpock-elementary" },
          },
          {
            point: "Niche grade A minus; student-teacher ratio 16:1.",
            source: { label: "Niche", url: "https://www.niche.com/k12/winterpock-elementary-school-chesterfield-va/" },
          },
          {
            point: "Not a Title I school.",
            source: { label: "Chesterfield County Public Schools Title I list", url: "https://www.oneccps.org/page/title-i" },
          },
          {
            point: "Parent, October 27, 2025: “I'm very impressed by how much attention the teachers give to each student. The principal is absolutely amazing! I noticed that she knows every student by name and truly understands their personalities and behaviors.”",
            source: { label: "GreatSchools parent review", url: "https://www.greatschools.org/virginia/chesterfield/4967-Winterpock-Elementary-School/" },
          },
          {
            point: "Parent, September 13, 2024: “Worst school allows bullying and kids being targeted because they are new.”",
            source: { label: "GreatSchools parent review", url: "https://www.greatschools.org/virginia/chesterfield/4967-Winterpock-Elementary-School/" },
          },
        ],
      },
      {
        slug: "13524-mountcastle-rd",
        address: "13524 Mountcastle Rd",
        city: "Chesterfield",
        state: "VA",
        zip: "23832",
        listPrice: 545000,
        priceLabel: "$545,000",
        beds: 4,
        baths: 2.5,
        sqft: 2824,
        mlsNumber: "2618001",
        daysOnMarket: 9,
        sourceUrl: "https://virginiacapitalrealty.com/listing-detail/1185143496/13524-Mountcastle-RD-Chesterfield-VA",
        photoUrl: "https://listing-images.homejunction.com/cvrmls/1176343950/photo_1.jpg",
        gapFillReason:
          "New since your last list and verified active July 10; it carries the strongest recent SOL scores of any home here.",
        vibes:
          "Built 2004, 2,824 sqft, 4 bedrooms and 2 full plus 1 half baths at $545,000 in Brandy Oaks on a 1.19-acre lot. Zoned to Grange Hall Elementary, whose published reading and math pass rates both climbed to about 90 percent in 2024-25. The trade is distance: it sits on the western Beach Road corridor, the longest run to base on the list.",
        anchors: [
          {
            name: "Fort Gregg-Adams",
            address: "",
            distance: "~45 min drive (free-flow, OSRM)",
            matches: "base commute",
          },
        ],
        whyThisOne:
          "The zoned elementary posts the highest recent published SOL pass rates on your shortlist while the home stays under your cap.",
        tradeOff:
          "About a 45-minute free-flow commute to base, the longest on the list, and the westernmost location.",
        assignedElementary: {
          name: "Grange Hall Elementary",
          source: {
            label: "Chesterfield County GIS elementary attendance boundary (point-in-polygon)",
            url: "https://services3.arcgis.com/TsynfzBSE6sXfoLq/arcgis/rest/services/Administrative_ProdA/FeatureServer/1",
          },
        },
        schoolRead: 8,
        schoolReadSummary:
          "Grange Hall posts the strongest recent SOL numbers on your shortlist: reading 91% and math 90% for 2024-25, both trending up over three years. GreatSchools rates it 6 of 10, Niche grades it B, and SchoolDigger places it 316th of 1,114 Virginia elementary schools at 4 of 5 stars, with about 724 students at a 16:1 ratio. Public parent reviews are thin and mixed. The Read reflects the rising pass rates and the outside ratings against that limited review texture.",
        schoolEvidence: [
          {
            point: "SOL All Students reading pass rate: 82% (2022-23), 81% (2023-24), 91% (2024-25); math 81%, 83%, 90%.",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/grange-hall-elementary" },
          },
          {
            point: "Enrollment 748 (2022-23), 748 (2023-24), 724 (2024-25); student-teacher ratio 16:1.",
            source: { label: "VDOE School Quality Profile / Niche", url: "https://www.niche.com/k12/grange-hall-elementary-school-moseley-va/" },
          },
          {
            point: "GreatSchools rating 6 of 10; Niche overall grade B.",
            source: { label: "Niche", url: "https://www.niche.com/k12/grange-hall-elementary-school-moseley-va/" },
          },
          {
            point: "SchoolDigger 4 of 5 stars; ranked 316th of 1,114 Virginia elementary schools.",
            source: { label: "SchoolDigger", url: "https://www.schooldigger.com/go/VA/schools/0084000330/school.aspx" },
          },
          {
            point: "Parent review: “It was a pretty good school except for some of the teachers ... Also the school had a really good playground.”",
            source: { label: "Niche parent review", url: "https://www.niche.com/k12/grange-hall-elementary-school-moseley-va/" },
          },
        ],
      },
      {
        slug: "10241-centralia-station-rd",
        address: "10241 Centralia Station Rd",
        city: "Chester",
        state: "VA",
        zip: "23831",
        listPrice: 519950,
        priceLabel: "$519,950",
        beds: 5,
        baths: 3,
        sqft: 3039,
        mlsNumber: "2618012",
        daysOnMarket: 2,
        sourceUrl: "https://www.trulia.com/home/10241-centralia-station-rd-chester-va-23831-12196160",
        photoUrl: "https://listing-images.homejunction.com/cvrmls/1176351683/photo_1.jpg",
        gapFillReason:
          "New listing since your last set, verified active July 10, and the newest build on the list at a mid-band price.",
        vibes:
          "Built 2022, 3,039 sqft, 5 bedrooms and 3 full baths at $519,950 in Centralia Station, listed July 2. Newest construction on your shortlist with a roughly 27-minute run to base. Zoned to Ecoff Elementary. The listing notes some conflicting lot-size figures, so confirm acreage against the MLS.",
        anchors: [
          {
            name: "Fort Gregg-Adams",
            address: "",
            distance: "~27 min drive (free-flow, OSRM)",
            matches: "base commute",
          },
        ],
        whyThisOne:
          "Newest build and most bedrooms on the list, with a mid-pack commute that balances the school-versus-drive trade.",
        tradeOff:
          "The zoned elementary posts mid-range published pass rates, and the record shows minor build-year and lot-size discrepancies to verify.",
        assignedElementary: {
          name: "Ecoff Elementary",
          source: {
            label: "Chesterfield County GIS elementary attendance boundary (point-in-polygon)",
            url: "https://services3.arcgis.com/TsynfzBSE6sXfoLq/arcgis/rest/services/Administrative_ProdA/FeatureServer/1",
          },
        },
        schoolRead: 6,
        schoolReadSummary:
          "Ecoff's published SOL pass rates sit at 72% reading and 73% math for 2024-25, with reading up from 68% over three years. GreatSchools rates it 6 of 10 and Niche grades it B minus, with about 764 students at a 14 to 15:1 ratio. Reviews run mixed, from teachers praised for preparing students to a specific complaint about how an autistic family member was treated. The Read reflects those published figures and that split texture.",
        schoolEvidence: [
          {
            point: "SOL All Students reading pass rate: 68% (2022-23), 67% (2023-24), 72% (2024-25); math 68%, 74%, 73%.",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/ecoff-elementary" },
          },
          {
            point: "Enrollment 730 (2022-23), 757 (2023-24), 764 (2024-25); student-teacher ratio 14 to 15:1.",
            source: { label: "VDOE School Quality Profile / Niche", url: "https://www.niche.com/k12/ecoff-elementary-school-chester-va/" },
          },
          {
            point: "GreatSchools rating 6 of 10; Niche overall grade B minus (Niche proficiency reading 62%, math 37%).",
            source: { label: "Niche", url: "https://www.niche.com/k12/ecoff-elementary-school-chester-va/" },
          },
          {
            point: "Student review: “Very well school. The teachers are wonderful and really try their best to prepare the students for middle and high school. The only thing wrong with this school is that they mistreated a family member of mine since he was autistic. Other than this, good school for a child.”",
            source: { label: "Niche student review", url: "https://www.niche.com/k12/ecoff-elementary-school-chester-va/" },
          },
          {
            point: "Student review: “When I went to Ecoff, it was a very welcoming, fun, safe place to be at. Nowadays, they've taken away a lot of the fun and welcoming aspect to it.”",
            source: { label: "Niche student review", url: "https://www.niche.com/k12/ecoff-elementary-school-chester-va/" },
          },
        ],
      },
      {
        slug: "13601-green-spire-cir",
        address: "13601 Green Spire Cir",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 515000,
        priceLabel: "$515,000",
        beds: 5,
        baths: 3.5,
        sqft: 3100,
        mlsNumber: "2614222",
        daysOnMarket: null,
        sourceUrl: "https://mikechenaultgroup.com/idx/mls-2614222-13601_green_spire_circle_chester_va_23836",
        photoUrl: "https://photos.prod.cirrussystem.net/1321/62952ca5db0f3e3d5c99cc93578ee0ce/3290885997.jpeg",
        gapFillReason: "Direct hit on your primary ZIP 23836 at the highest bedroom count on the shortlist, and still active as of July 10.",
        vibes:
          "Built 2009, approximately 3,100 sqft, 5 bedrooms and 3.5 baths at $515,000, up about $5,000 since the last check. Inside your primary ZIP 23836 with a free-flow base estimate of about 16 minutes and 10.3 miles. Zoned to Elizabeth N. Scott Elementary, the same assignment as 1606 Astwood Cove Dr, resolved from this exact address.",
        anchors: [
          {
            name: "Fort Gregg-Adams",
            address: "",
            distance: "~16 min drive (free-flow, OSRM)",
            matches: "base commute",
          },
        ],
        whyThisOne:
          "Five bedrooms inside your primary ZIP 23836 with the shortest commute on the shortlist, about 16 minutes to base.",
        tradeOff:
          "The zoned school's published reading pass rate fell 13 points over three years while math rose, and the price ticked up about $5,000.",
        assignedElementary: {
          name: "Elizabeth N. Scott Elementary",
          source: {
            label: "Chesterfield elementary boundary layer (Virginia Open Data)",
            url: "https://data.virginia.gov/dataset/elementaryschoolboundary-layer",
          },
        },
        schoolRead: 6,
        schoolReadSummary:
          "Same assigned school as 1606 Astwood Cove Dr. Elizabeth N. Scott's published reading pass rate fell 84% to 74% to 71% over three years while math rose to 83%. GreatSchools sub-ratings are Student Progress 7 and Test Score 6, Niche B minus, 15:1, Title I, Fully Accredited / On Track, with a Dual Language Program referenced in parent reviews. Recent parent reviews on GreatSchools cite communication concerns; a 2025 community member reviewed positively. The Read matches Astwood's because the evidence is identical.",
        schoolEvidence: [
          {
            point: "SOL All Students reading pass rate: 84% (2022-23), 74% (2023-24), 71% (2024-25); math 79%, 82%, 83%.",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/elizabeth-scott-elementary" },
          },
          {
            point: "GreatSchools sub-ratings: Student Progress 7, Test Score 6.",
            source: { label: "GreatSchools", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
          {
            point: "Niche grade B minus; student-teacher ratio 15:1; Title I school (yes).",
            source: { label: "Niche", url: "https://www.niche.com/k12/elizabeth-scott-elementary-school-chester-va/" },
          },
          {
            point: "Parent, May 15, 2026: “I made multiple requests for a parent-teacher conference to discuss my son's academics and ways to help him finish the school year strong. Unfortunately, those requests went unanswered for an extended period of time, which left me feeling ignored and concerned as a parent.”",
            source: { label: "GreatSchools parent review", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
          {
            point: "Community member, January 30, 2025: “The school is amazing, a wonderful place to work and I like that they embrace different cultures and the work environment is friendly and supportive. I love the discipline and of course the Dual Language Program.”",
            source: { label: "GreatSchools review", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
        ],
      },
      {
        slug: "1606-astwood-cove-dr",
        address: "1606 Astwood Cove Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 513950,
        priceLabel: "$513,950 (Coming Soon, activates Aug 8)",
        beds: 4,
        baths: 2.5,
        sqft: 2964,
        mlsNumber: "2617567",
        daysOnMarket: 10,
        sourceUrl: "https://www.redfin.com/VA/Chester/1606-Astwood-Cove-Dr-23836/home/59486894",
        photoUrl: "https://images-listings.coldwellbanker.com/RV/26/17/56/7/_P/2617567_P00.jpg",
        gapFillReason:
          "New Coming Soon listing in your primary ZIP with the shortest commute of the whole list; it activates August 8.",
        vibes:
          "Built 2009, 2,964 sqft, 4 bedrooms and 2 full plus 1 half baths at $513,950 in your primary ZIP 23836, the shortest run to base on the list at about 19 minutes. Listed by BHG Base Camp as Coming Soon with a confirmed activation date of August 8, so it cannot be toured or put under contract until then. Zoned to Elizabeth N. Scott Elementary, the same school as 13601 Green Spire Cir.",
        anchors: [
          {
            name: "Fort Gregg-Adams",
            address: "",
            distance: "~19 min drive (free-flow, OSRM)",
            matches: "base commute",
          },
        ],
        whyThisOne:
          "Shortest commute to base on the list inside your primary ZIP, and it lands before your September move-in window.",
        tradeOff:
          "Coming Soon, so no tour or offer until it activates August 8, and the zoned school's reading pass rate has been declining while math rose.",
        assignedElementary: {
          name: "Elizabeth N. Scott Elementary",
          source: {
            label: "Chesterfield County GIS elementary attendance boundary (point-in-polygon)",
            url: "https://services3.arcgis.com/TsynfzBSE6sXfoLq/arcgis/rest/services/Administrative_ProdA/FeatureServer/1",
          },
        },
        schoolRead: 6,
        schoolReadSummary:
          "Same assigned school as 13601 Green Spire Cir. Elizabeth N. Scott's published reading pass rate fell 84% to 74% to 71% over three years while math rose to 83%. GreatSchools sub-ratings are Student Progress 7 and Test Score 6, Niche B minus, 15:1, Title I, Fully Accredited / On Track, with a Dual Language Program referenced in parent reviews. Recent parent reviews on GreatSchools cite communication concerns; a 2025 community member reviewed positively. The Read matches Green Spire's because the evidence is identical.",
        schoolEvidence: [
          {
            point: "SOL All Students reading pass rate: 84% (2022-23), 74% (2023-24), 71% (2024-25); math 79%, 82%, 83%.",
            source: { label: "VDOE School Quality Profile", url: "https://schoolquality.virginia.gov/schools/elizabeth-scott-elementary" },
          },
          {
            point: "GreatSchools sub-ratings: Student Progress 7, Test Score 6.",
            source: { label: "GreatSchools", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
          {
            point: "Niche grade B minus; student-teacher ratio 15:1; Title I school (yes).",
            source: { label: "Niche", url: "https://www.niche.com/k12/elizabeth-scott-elementary-school-chester-va/" },
          },
          {
            point: "Parent, May 15, 2026: “I made multiple requests for a parent-teacher conference to discuss my son's academics and ways to help him finish the school year strong. Unfortunately, those requests went unanswered for an extended period of time, which left me feeling ignored and concerned as a parent.”",
            source: { label: "GreatSchools parent review", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
          {
            point: "Community member, January 30, 2025: “The school is amazing, a wonderful place to work and I like that they embrace different cultures and the work environment is friendly and supportive. I love the discipline and of course the Dual Language Program.”",
            source: { label: "GreatSchools review", url: "https://www.greatschools.org/virginia/chester/4966-Elizabeth-Scott-Elementary-School/" },
          },
        ],
      },
    ],
    sources: [
      {
        url: "https://www.compass.com/homedetails/15667-Henningford-Dr-Chesterfield-VA-23832/KS2NK_pid/",
        description: "15667 Henningford Dr, Chesterfield 23832. Active as of July 10, 2026, 2022 build, MLS 2610493.",
      },
      {
        url: "https://virginiacapitalrealty.com/listing-detail/1185143496/13524-Mountcastle-RD-Chesterfield-VA",
        description: "13524 Mountcastle Rd, Chesterfield 23832. Active as of July 10, 2026, 2004 build, MLS 2618001.",
      },
      {
        url: "https://www.trulia.com/home/10241-centralia-station-rd-chester-va-23831-12196160",
        description: "10241 Centralia Station Rd, Chester 23831. Active as of July 10, 2026, 2022 build, MLS 2618012.",
      },
      {
        url: "https://mikechenaultgroup.com/idx/mls-2614222-13601_green_spire_circle_chester_va_23836",
        description: "13601 Green Spire Cir, Chester 23836. Active as of July 10, 2026 at $515,000, 2009 build, MLS 2614222.",
      },
      {
        url: "https://www.redfin.com/VA/Chester/1606-Astwood-Cove-Dr-23836/home/59486894",
        description: "1606 Astwood Cove Dr, Chester 23836. Coming Soon, activates Aug 8, 2026, 2009 build, MLS 2617567.",
      },
      {
        url: "https://schoolquality.virginia.gov/",
        description: "Virginia DOE School Quality Profiles. SOL pass rates, accreditation, enrollment for every assigned school (All Students group).",
      },
      {
        url: "https://data.virginia.gov/dataset/elementaryschoolboundary-layer",
        description: "Chesterfield County elementary attendance boundary layer (Virginia Open Data). Used for point-in-polygon school assignment.",
      },
      {
        url: "https://www.henricoschools.us/school-locator/",
        description: "Henrico County Public Schools attendance-zone locator. Used for point-in-polygon school assignment.",
      },
      {
        url: "https://www.oneccps.org/page/title-i",
        description: "Chesterfield County Public Schools Title I list.",
      },
      {
        url: "https://router.project-osrm.org",
        description: "OSRM public routing engine. Free-flow (no-traffic) drive-time and distance to Fort Gregg-Adams; peak-hour times run higher.",
      },
    ],
    completedAt: "2026-07-10T15:40:00-04:00",
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
