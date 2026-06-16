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
    properties: [
      {
        slug: "1769-outrigger-dr",
        address: "1769 Outrigger Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 505000,
        priceLabel: "$505,000",
        beds: 4,
        baths: 3,
        sqft: 2248,
        mlsNumber: "2605747",
        daysOnMarket: 96,
        sourceUrl: "https://www.homes.com/property/1769-outrigger-dr-chester-va/ywjdlj07kc2k0/",
        photoUrl: null,
        gapFillReason:
          "The 96-day listing reads stale on the portals before a buyer notices it is a 2023 ranch with the shortest base commute in the set.",
        vibes:
          "The cleanest logistics fit in the group: a 2023 one-story home in Twin Rivers at Meadowville Landing, 4 beds, 3 baths, 2,248 sqft, screened porch, high ceilings, granite counters, induction cooktop, tankless water heater, and a direct-access 2-car garage. The $106 per month HOA brings pool, fitness, and water-oriented community amenities.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "15 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "4 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "5 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It hits your newer-construction requirement with 2023 build quality, 4 beds, 3 full baths, and the fastest verified Fort Gregg-Adams commute on this list.",
        tradeOff:
          "The longer days-on-market count needs a showing-level explanation, because it may signal pricing friction despite strong criteria fit.",
      },
      {
        slug: "12218-winbolt-dr",
        address: "12218 Winbolt Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 500000,
        priceLabel: "$500,000",
        beds: 4,
        baths: 2.5,
        sqft: 2560,
        mlsNumber: "2611744",
        daysOnMarket: 43,
        sourceUrl: "https://www.homes.com/property/12218-winbolt-dr-chester-va/sjytndddw758s/",
        photoUrl: null,
        gapFillReason:
          "Portals treat it as one more Meadowville Landing result, but the $500,000 price plus 2016 build gives it a stronger value-to-commute ratio than several prettier higher-priced cards.",
        vibes:
          "A 2016 single-family home in Meadowville Landing's Mount Blanco section with 4 beds, 2.5 baths, 2,560 sqft, fresh paint and carpet, granite counters, induction cooktop, kitchen island, and a 2-car rear garage. The listing shows a $32,000 price drop and a $106 per month HOA tied to pool, boat dock, beach, and tennis amenities.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "17 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "5 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "6 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It is the lowest-priced verified finalist while still clearing the 2000-plus build, bedroom, bath, and base-access requirements.",
        tradeOff:
          "The rear-garage layout and community HOA should be checked against how you and Shannon actually use parking, storage, and outdoor space.",
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
        daysOnMarket: 20,
        sourceUrl: "https://www.homes.com/property/13601-green-spire-cir-chester-va/mh1g3d5szqff7/",
        photoUrl: null,
        gapFillReason:
          "The portal card reads like a standard 5-bedroom suburban listing, but 3,100 sqft on a cul-de-sac lot with equal I-95 and I-295 access is the real buyer-specific fit.",
        vibes:
          "This 2009 Cypress Woods home has 5 beds, 3.5 baths, 3,100 sqft, an 11,761 sqft cul-de-sac lot, fenced backyard, large deck, granite counters, 2-car attached garage, and a $43 per month HOA. The listing calls out proximity to I-295, I-95, and VA-288.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "16 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "5 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "5 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It gives you 5 beds, 3.5 baths, and 3,100 sqft while staying near the bottom of budget and close to both requested interstates.",
        tradeOff:
          "It is not the newest home in the set, so finishes and system condition need to justify choosing it over the 2023 and new-construction options.",
      },
      {
        slug: "12225-twin-rivers-dr",
        address: "12225 Twin Rivers Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 554950,
        priceLabel: "$554,950",
        beds: 3,
        baths: 2.5,
        sqft: 2041,
        mlsNumber: "2614824",
        daysOnMarket: 14,
        sourceUrl: "https://www.homes.com/property/12225-twin-rivers-dr-chester-va/gv8rs3g5x2kks/",
        photoUrl: null,
        gapFillReason:
          "With only 3 beds and 2,041 sqft, broad portal sorting underrates it, but it directly matches the newer-home, low-maintenance lifestyle side of what you described.",
        vibes:
          "This 2023 one-story Twin Rivers home has 3 beds, 2.5 baths, 2,041 sqft, a river-front lot notation, built-ins, high ceilings, French doors, granite counters, in-ground pool, patio, 2.5-car heated garage, tankless water heater, and community boat dock and fitness amenities. The HOA is listed at $212 per month.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "16 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "5 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "6 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It is a 2023 single-family home that clears the bedroom and bath minimums and keeps Fort Gregg-Adams and both interstates very manageable.",
        tradeOff:
          "The higher HOA and smaller square footage make this more of a lifestyle fit than a maximum-space play.",
      },
      {
        slug: "1625-n-white-mountain-dr",
        address: "1625 N White Mountain Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 569950,
        priceLabel: "$569,950",
        beds: 5,
        baths: 3,
        sqft: 3154,
        mlsNumber: "2613685",
        daysOnMarket: 25,
        sourceUrl: "https://www.homes.com/property/1625-n-white-mountain-dr-chester-va/fblbvb9jwkcxc/",
        photoUrl: null,
        gapFillReason:
          "It looks like a mid-budget 5-bedroom among many, but the Mount Blanco on the James setting, 2013 construction, and 17-minute base drive make it a stronger fit than the price alone suggests.",
        vibes:
          "A 2013 Mount Blanco on the James home with 5 beds, 3 baths, 3,154 sqft, a 16,509 sqft lot, water views, gas fireplace, large bonus room, deck, granite counters, island kitchen, soaking tub, and community pool, boat dock, playground, and basketball amenities. The HOA is listed at $106 per month.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "17 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "5 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "6 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It offers the 5-bed, 3-full-bath layout with water views while staying inside budget and close to both I-95 and I-295.",
        tradeOff:
          "At $569,950 it competes directly with newer builds, so the showing needs to prove the condition is worth the premium.",
      },
      {
        slug: "1813-james-overlook-dr",
        address: "1813 James Overlook Dr",
        city: "Chester",
        state: "VA",
        zip: "23836",
        listPrice: 584900,
        priceLabel: "$584,900",
        beds: 4,
        baths: 2.5,
        sqft: 3022,
        mlsNumber: "2615479",
        daysOnMarket: 8,
        sourceUrl: "https://www.homes.com/property/1813-james-overlook-dr-chester-va/v2mv5mlyw08gq/",
        photoUrl: "https://ssl.cdn-redfin.com/photo/262/mbpaddedwide/479/genMid.2615479_0.jpg",
        gapFillReason:
          "Search cards emphasize river-front appeal and price, but the buyer-specific value is the 2018 build, 3,022 sqft, and the same tight Chester 23836 base and interstate geometry.",
        vibes:
          "A 2018 Meadowville Landing home with 4 beds, 2.5 baths, 3,022 sqft, a river-front lot notation, wood flooring, loft, deck, tankless water heater, butler's pantry, granite counters, 2-car garage, and a $107 per month HOA. This is one of the freshest active resales on the list by days on market.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "16 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "5 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 15A, VA-10 East Hundred Road",
            address: "VA-10 at I-295, Chester, VA 23836",
            distance: "6 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It gives you a 2018 single-family home over 3,000 sqft with a short Fort Gregg-Adams drive and strong I-95 and I-295 access.",
        tradeOff:
          "It is near the top of the no-stretch budget while offering 2.5 baths rather than 3 full baths.",
      },
      {
        slug: "5106-timsbury-pointe-dr",
        address: "5106 Timsbury Pointe Dr",
        city: "Chester",
        state: "VA",
        zip: "23831",
        listPrice: 525000,
        priceLabel: "$525,000",
        beds: 5,
        baths: 2.5,
        sqft: 3064,
        mlsNumber: "2611122",
        daysOnMarket: 19,
        sourceUrl: "https://www.homes.com/property/5106-timsbury-pointe-dr-chester-va/9rcpyxng3kftk/",
        photoUrl: null,
        gapFillReason:
          "Portals do not elevate it because it is less riverfront and less new than some competitors, but the 2.87-acre lot is unusually strong for the price band.",
        vibes:
          "This 2010 Stoney Glen South home has 5 beds, 2.5 baths, 3,064 sqft, a 2.87-acre wooded lot, gas fireplace, deck, granite counters, 2-car attached garage, fenced backyard, and a sprinkler system, with a $16 per month HOA. It also shows a $20,000 price drop.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "23 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-95 Exit 61, VA-10 Chester Road",
            address: "VA-10 at I-95, Chester, VA 23831",
            distance: "7 min drive",
            matches: "I-95 access",
          },
          {
            name: "I-295 Exit 9B, VA-36 Oaklawn Boulevard",
            address: "VA-36 at I-295, Colonial Heights, VA 23834",
            distance: "10 min drive",
            matches: "I-295 access",
          },
        ],
        whyThisOne:
          "It fits the bedroom, size, and construction requirements while adding acreage that most $500,000 to $600,000 Chester options do not offer.",
        tradeOff:
          "The base commute is meaningfully longer than the Chester 23836 finalists, so this is the privacy-and-land option rather than the shortest drive.",
      },
      {
        slug: "6909-sir-galahad-rd",
        address: "6909 Sir Galahad Rd",
        city: "Henrico",
        state: "VA",
        zip: "23231",
        listPrice: 514000,
        priceLabel: "$514,000",
        beds: 5,
        baths: 3.5,
        sqft: 2738,
        mlsNumber: "2614869",
        daysOnMarket: 13,
        sourceUrl: "https://www.homes.com/property/6909-sir-galahad-rd-henrico-va/hdwzdjz81rc02/",
        photoUrl: null,
        gapFillReason:
          "Varina and eastern Henrico listings get lost when the search starts in Chester, but this 2020 Castleton home keeps I-295 close and stays near the low end of budget.",
        vibes:
          "A 2020 Castleton single-family home with 5 beds, 3.5 baths, 2,738 sqft, a 27,007 sqft corner lot, main-floor primary bedroom, gas fireplace, formal dining, granite counters, 2-car garage, deck, and porch, with a $65 per month HOA. The listing notes a 15-minute drive to Richmond.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "21 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-295 Exit 22, VA-5 Charles City Road",
            address: "VA-5 at I-295, Henrico, VA 23231",
            distance: "6 min drive",
            matches: "I-295 access",
          },
          {
            name: "I-95 Exit 74, Bells Road area",
            address: "I-95 at Bells Road, Richmond, VA 23234",
            distance: "8 min drive",
            matches: "I-95 access",
          },
        ],
        whyThisOne:
          "It gives you a newer 2020 build with 5 beds and 3.5 baths in your Varina and eastern Henrico target lane while keeping I-295 close.",
        tradeOff:
          "It is not as base-convenient as the Chester 23836 homes, so the location only wins if Varina or eastern Henrico is a real lifestyle preference.",
      },
      {
        slug: "2905-clifford-tower-dr",
        address: "2905 Clifford Tower Dr",
        city: "Henrico",
        state: "VA",
        zip: "23231",
        listPrice: 524950,
        priceLabel: "$524,950",
        beds: 4,
        baths: 3,
        sqft: 2754,
        mlsNumber: "2603729",
        daysOnMarket: 82,
        sourceUrl: "https://www.homes.com/property/2905-clifford-tower-dr-henrico-va/e4s4kcb2qxffj/",
        photoUrl: null,
        gapFillReason:
          "The 82-day count pushes buyers past it, but the builder-model-home detail and 2019 construction keep it relevant for a buyer who explicitly does not want an old house.",
        vibes:
          "This Castleton home is a 2019 builder's model with 4 beds, 3 baths, 2,754 sqft, a newly remodeled notation, solar panels, crown molding, vaulted ceilings, loft, gas fireplace, induction cooktop, granite, soaking tub, and plantation shutters, with pool, tennis, and fitness amenities through a $65 per month HOA.",
        anchors: [
          {
            name: "Fort Gregg-Adams Gregg Avenue Gate",
            address: "500 Gregg Ave, Fort Gregg-Adams, VA 23801",
            distance: "21 min drive",
            matches: "Fort Gregg-Adams commute",
          },
          {
            name: "I-295 Exit 22, VA-5 Charles City Road",
            address: "VA-5 at I-295, Henrico, VA 23231",
            distance: "6 min drive",
            matches: "I-295 access",
          },
          {
            name: "I-95 Exit 74, Bells Road area",
            address: "I-95 at Bells Road, Richmond, VA 23234",
            distance: "8 min drive",
            matches: "I-95 access",
          },
        ],
        whyThisOne:
          "It fits the 2000-plus, 4-bed, 3-bath requirement and gives a Varina and eastern Henrico alternative without pushing above budget.",
        tradeOff:
          "The 82 days on market deserves scrutiny around pricing history, condition, and whether the model-home upgrades translate into daily-use value.",
      },
    ],
    sources: [
      {
        url: "https://www.homes.com/property/1769-outrigger-dr-chester-va/ywjdlj07kc2k0/",
        description: "1769 Outrigger Dr, Chester 23836. Active listing, 2023 build, MLS 2605747.",
      },
      {
        url: "https://www.homes.com/property/12218-winbolt-dr-chester-va/sjytndddw758s/",
        description: "12218 Winbolt Dr, Chester 23836. Active listing, 2016 build, MLS 2611744.",
      },
      {
        url: "https://www.homes.com/property/13601-green-spire-cir-chester-va/mh1g3d5szqff7/",
        description: "13601 Green Spire Cir, Chester 23836. Active listing, 2009 build, MLS 2614222.",
      },
      {
        url: "https://www.homes.com/property/12225-twin-rivers-dr-chester-va/gv8rs3g5x2kks/",
        description: "12225 Twin Rivers Dr, Chester 23836. Active listing, 2023 build, MLS 2614824.",
      },
      {
        url: "https://www.homes.com/property/1625-n-white-mountain-dr-chester-va/fblbvb9jwkcxc/",
        description: "1625 N White Mountain Dr, Chester 23836. Active listing, 2013 build, MLS 2613685.",
      },
      {
        url: "https://www.homes.com/property/1813-james-overlook-dr-chester-va/v2mv5mlyw08gq/",
        description: "1813 James Overlook Dr, Chester 23836. Active listing, 2018 build, MLS 2615479.",
      },
      {
        url: "https://www.homes.com/property/5106-timsbury-pointe-dr-chester-va/9rcpyxng3kftk/",
        description: "5106 Timsbury Pointe Dr, Chester 23831. Active listing, 2010 build, MLS 2611122.",
      },
      {
        url: "https://www.homes.com/property/6909-sir-galahad-rd-henrico-va/hdwzdjz81rc02/",
        description: "6909 Sir Galahad Rd, Henrico 23231. Active listing, 2020 build, MLS 2614869.",
      },
      {
        url: "https://www.homes.com/property/2905-clifford-tower-dr-henrico-va/e4s4kcb2qxffj/",
        description: "2905 Clifford Tower Dr, Henrico 23231. Active listing, 2019 build, MLS 2603729.",
      },
      {
        url: "https://www.redfin.com/county/2957/VA/Chesterfield-County/housing-market",
        description: "Redfin, Chesterfield County. April 2026 median sale price $433,788, up 2.1% year over year.",
      },
      {
        url: "https://www.srmfre.com/market-report/Henrico-County/491816/",
        description: "SRMF, Henrico County last-30-days report. Median sold $426,000, indexed June 7, 2026.",
      },
    ],
    completedAt: "2026-06-15T13:10:00-04:00",
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
