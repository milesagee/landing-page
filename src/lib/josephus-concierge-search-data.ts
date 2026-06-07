/**
 * Josephus Allmond curated buyer search.
 *
 * Token-gated dual-account dashboard. Two share tokens (Josephus + Dominique) both
 * resolve to the same GHL contactId. viewerType distinguishes whose actions get logged.
 *
 * Property data sourced from Perplexity Computer brief 2026-06-07-1437-josephus-refresh-v2
 * (markdown at shared/completed/2026-06-07-1437-josephus-refresh-v2.md). Every disclosed
 * field cites the listing source. Undisclosed fields are explicitly marked, never invented.
 *
 * Role-neutral by design. Internal context (dossier, gateway strategy, energy methodology)
 * lives at projects/josephus-allmond/ and never appears on this surface.
 */

export type ViewerType = "primary" | "partner";

export type Viewer = {
  contactId: string;
  shareToken: string;
  viewerType: ViewerType;
  firstName: string;
  dataId: string;
};

export type PropertyTier = "tier1" | "tier2" | "watch";

export type PropertyStatus = "active" | "coming-soon" | "pending" | "status-conflict" | "comp";

export type Property = {
  slug: string;
  rank: number;
  tier: PropertyTier;
  status: PropertyStatus;
  address: string;
  city: string;
  county: string;
  zip: string;
  price: number;
  // The hand-prepared "why this is on your list" line. Plain, specific, sourced.
  whyItMatters: string;
  // The honest gap or thing to verify on tour. Empty if no caveat.
  caveat: string | null;
  zillowUrl: string;
  // Energy intel surfaced per property. Each field can be "yes" / "no" / "not disclosed" / number.
  energy: {
    existingSolar: "yes" | "no" | "not disclosed";
    evCharger: "yes" | "no" | "not disclosed";
    panelAmperage: string;
    electrificationStatus: string;
    estMonthlyUtilityCost: string;
    energyNotes: string;
  };
};

export type EquitySnapshotCard = {
  currentAddress: string;
  ownedSince: string;
  solarAddedNote: string;
  bandTopLine: string;
  bridgeLine: string;
};

export type JosephusSearchData = {
  id: string;
  primaryFirstName: string;
  partnerFirstName: string;
  partnerFullName: string;
  moveInDeadline: string;
  criteria: {
    budgetTarget: number;
    budgetCeiling: number;
    bedsMain: number;
    bathsMain: number;
    mainFloorSqftFloor: number;
    geoLine: string;
    suiteLine: string;
  };
  properties: Property[];
  equitySnapshot: EquitySnapshotCard;
  milesNote: {
    headline: string;
    body: string[];
  };
  fieldsNotDisclosed: string[];
};

const JOSEPHUS_CONTACT_ID = "dgJ8MBUeXP4ywL3EqhfX";

export const VIEWERS: Record<string, Viewer> = {
  // Josephus's view. Primary account.
  "kT7-MzqWb9Lf": {
    contactId: JOSEPHUS_CONTACT_ID,
    shareToken: "kT7-MzqWb9Lf",
    viewerType: "primary",
    firstName: "Josephus",
    dataId: "josephus-2026-06-07",
  },
  // Dominique's view. Partner account, same data record, different actor for GHL logs.
  "9Hd_4XnPyVcA": {
    contactId: JOSEPHUS_CONTACT_ID,
    shareToken: "9Hd_4XnPyVcA",
    viewerType: "partner",
    firstName: "Dominique",
    dataId: "josephus-2026-06-07",
  },
};

export const SEARCHES: Record<string, JosephusSearchData> = {
  "josephus-2026-06-07": {
    id: "josephus-2026-06-07",
    primaryFirstName: "Josephus",
    partnerFirstName: "Dominique",
    partnerFullName: "Dominique Allmond",
    moveInDeadline: "October 2026",
    criteria: {
      budgetTarget: 450000,
      budgetCeiling: 500000,
      bedsMain: 2,
      bathsMain: 2,
      mainFloorSqftFloor: 1200,
      geoLine: "35-minute off-peak radius from downtown Richmond",
      suiteLine:
        "Separate suite with bed, full bath, private entrance, sink or plumbing rough-in for a kitchenette",
    },
    properties: [
      // Source: PC brief markdown 2026-06-07-1437-josephus-refresh-v2.md, Tier 1 table.
      {
        slug: "stanbrook-5823",
        rank: 1,
        tier: "tier1",
        status: "active",
        address: "5823 Stanbrook Dr",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23234",
        price: 465000, // PC, Zillow.
        whyItMatters:
          "Best public active match. Walk-out daylight basement with bedroom, full bath, kitchenette, stove, refrigerator, and a private entrance.",
        caveat: null,
        zillowUrl:
          "https://www.zillow.com/homedetails/5823-Stanbrook-Dr-North-Chesterfield-VA-23234/12180702_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Walk-out basement orientation supports a future heat-pump split if main-house HVAC needs replacing. Confirm panel amperage and solar restrictions on tour.",
        },
      },
      {
        slug: "chickahominy-4420",
        rank: 2,
        tier: "tier1",
        status: "active",
        address: "4420 Chickahominy Ave",
        city: "Richmond",
        county: "Richmond City",
        zip: "23222",
        price: 324950, // PC, Zillow.
        whyItMatters:
          "Strong value. Clear basement in-law setup: two bedrooms, full bath, living room, kitchenette, separate entrance.",
        caveat: "Significant headroom under the $475K target leaves budget for energy retrofit.",
        zillowUrl:
          "https://www.zillow.com/homedetails/4420-Chickahominy-Ave-Richmond-VA-23222/12347236_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Closest of the Tier 1 set to downtown Richmond. Verify roof age and tree shading on tour for any solar plan.",
        },
      },
      {
        slug: "dotson-1100",
        rank: 3,
        tier: "tier1",
        status: "active",
        address: "1100 Dotson Rd",
        city: "Henrico",
        county: "Henrico",
        zip: "23231",
        price: 410000, // PC, Zillow.
        whyItMatters:
          "Private suite includes its own entrance, foyer, kitchenette area, living room, bedroom, full bath, laundry, and backyard access.",
        caveat: null,
        zillowUrl:
          "https://www.zillow.com/homedetails/1100-Dotson-Rd-Henrico-VA-23231/12367647_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Suite has its own laundry, which suggests separate water and possibly metered utilities. Confirm on tour.",
        },
      },
      {
        slug: "lancers-2233",
        rank: 4,
        tier: "tier1",
        status: "active",
        address: "2233 Lancers Blvd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23224",
        price: 385000, // PC, Zillow.
        whyItMatters:
          "Two full kitchens and private entrances create real independence between the main house and the suite.",
        caveat:
          "Need to verify the second full bath in the main house, separate from the suite's bath.",
        zillowUrl:
          "https://www.zillow.com/homedetails/2233-Lancers-Blvd-North-Chesterfield-VA-23224/12178448_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Two kitchens means two refrigerators and two cooking loads. Worth pulling Dominion usage history if the seller will share.",
        },
      },
      {
        slug: "tuxford-9810",
        rank: 5,
        tier: "tier1",
        status: "coming-soon",
        address: "9810 Tuxford Rd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23236",
        price: 420000, // PC, Zillow.
        whyItMatters:
          "Coming soon June 11. Basement kitchenette, full bath, upgraded electrical box, multiple garages.",
        caveat: "Private exterior entrance to the suite needs showing verification.",
        zillowUrl:
          "https://www.zillow.com/homedetails/9810-Tuxford-Rd-North-Chesterfield-VA-23236/12159304_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "Upgraded electrical box disclosed (amperage not specified)",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Upgraded electrical box is the only Tier 1 property with any energy-readiness signal. Worth a Day 1 tour the moment it hits.",
        },
      },
      // Tier 2.
      {
        slug: "wraywood-4512",
        rank: 6,
        tier: "tier2",
        status: "active",
        address: "4512 Wraywood Ave",
        city: "Chester",
        county: "Chesterfield",
        zip: "23831",
        price: 499500, // PC, Zillow.
        whyItMatters:
          "Excellent no-step private basement entrance, the best accessibility setup in the active pool.",
        caveat: "Kitchenette or sink in the suite is not disclosed. Tour-day verify.",
        zillowUrl:
          "https://www.zillow.com/homedetails/4512-Wraywood-Ave-Chester-VA-23831/12199153_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Pushing budget ceiling. Accessibility win earns it the slot if the suite kitchenette pencils.",
        },
      },
      {
        slug: "elmart-1633",
        rank: 7,
        tier: "tier2",
        status: "active",
        address: "1633 Elmart Ln",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23235",
        price: 490700, // PC, Zillow.
        whyItMatters: "Suite language is strong. Multigen layout is enforced in the listing copy.",
        caveat:
          "Total bath count suggests main-house full-bath split needs agent verification before tour.",
        zillowUrl:
          "https://www.zillow.com/homedetails/1633-Elmart-Ln-North-Chesterfield-VA-23235/12170177_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Standard. No disclosed energy upgrades in the listing.",
        },
      },
      {
        slug: "archdale-3240",
        rank: 8,
        tier: "tier2",
        status: "active",
        address: "3240 Archdale Rd",
        city: "Richmond",
        county: "Richmond City",
        zip: "23235",
        price: 485000, // PC, Zillow.
        whyItMatters:
          "Large FSBO with no-step lower-level access. Strong kitchenette potential in the rec area.",
        caveat:
          "Roof and HVAC replacement risk is disclosed. FSBO means we go in eyes open on price discipline.",
        zillowUrl:
          "https://www.zillow.com/homedetails/3240-Archdale-Rd-Richmond-VA-23235/12507014_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Disclosed HVAC replacement is actually a buying angle. If we credit the buyer for it, the next system goes in as a high-efficiency heat pump from day one.",
        },
      },
      // Watch / status-conflict.
      {
        slug: "gregory-9231",
        rank: 9,
        tier: "watch",
        status: "status-conflict",
        address: "9231 Gregory Dr",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23234",
        price: 449950, // Zillow + PenFed list price.
        whyItMatters:
          "Strong suite layout. Was a top April pick. Status is contested between data feeds, agent call required.",
        caveat:
          "Trulia reports sold May 14, 2026 at $475K. Zillow and PenFed still show active. We resolve this before treating it as live.",
        zillowUrl:
          "https://www.zillow.com/homedetails/9231-Gregory-Dr-North-Chesterfield-VA-23234/12181014_zpid/",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "Carport electricity disclosed (single outlet, not full EV)",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Carport electricity is the only signal. If the home is actually still active, this is the call I want to make Monday.",
        },
      },
      {
        slug: "courthouse-7831",
        rank: 10,
        tier: "watch",
        status: "pending",
        address: "7831 Courthouse Rd",
        city: "Chesterfield",
        county: "Chesterfield",
        zip: "23832",
        price: 0, // pending, list price not load-bearing here.
        whyItMatters: "Separate entrance bonus room only. No disclosed kitchenette or full suite.",
        caveat: "Pending. Watch for fallout only.",
        zillowUrl: "",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Not actively in consideration. Tracking for fallout only.",
        },
      },
      {
        slug: "gardenia-9806",
        rank: 11,
        tier: "watch",
        status: "active",
        address: "9806 Gardenia Dr",
        city: "Henrico",
        county: "Henrico",
        zip: "23228",
        price: 0,
        whyItMatters: "Private entrance and en-suite bath only. No kitchenette disclosed.",
        caveat: "Doesn't meet the suite-independence bar on disclosed data.",
        zillowUrl: "",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Not the suite we need. Listed only so you can see what we ruled out.",
        },
      },
      {
        slug: "queensland-2939",
        rank: 12,
        tier: "watch",
        status: "active",
        address: "2939 Queensland Dr",
        city: "Henrico",
        county: "Henrico",
        zip: "23228",
        price: 0,
        whyItMatters: "Basement bedroom and full bath with a walk-out door, but no kitchenette disclosed.",
        caveat: "Half-suite. Doesn't clear independence bar without a kitchenette commitment.",
        zillowUrl: "",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Not the suite we need.",
        },
      },
      {
        slug: "tobacco-mill-2125",
        rank: 13,
        tier: "watch",
        status: "active",
        address: "2125 Tobacco Mill St",
        city: "Richmond",
        county: "Richmond City",
        zip: "23223",
        price: 0,
        whyItMatters: "First-level rec room is flexible. No separate full suite disclosed.",
        caveat: "Flexible space is not the same as a suite. Ruled out unless tour reveals more.",
        zillowUrl: "",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Not the suite we need.",
        },
      },
      {
        slug: "grey-rock-6409",
        rank: 14,
        tier: "watch",
        status: "comp",
        address: "6409 Grey Rock Ln",
        city: "Henrico",
        county: "Henrico",
        zip: "23228",
        price: 425000, // closed May 15, 2026.
        whyItMatters:
          "Sold May 15 at $425K after a $399,950 list and a two-day move from list to pending. Useful as Henrico pricing pressure.",
        caveat:
          "Used as a price-band comp only. Not a verified independent-suite match, so weight accordingly.",
        zillowUrl: "",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Comp only.",
        },
      },
    ],
    equitySnapshot: {
      currentAddress: "42 Partridge Berry Ln, Troy VA 22974",
      ownedSince: "current primary residence",
      solarAddedNote:
        "Solar added January 2025 raises the appraisal floor and is a real differentiator in a Troy sale package.",
      bandTopLine:
        "When the timing is right to list Troy, the same hands carry it. No new search, no new agent, no handoff.",
      bridgeLine:
        "This Sunday is about the buy side. The sell side is on the calendar when you're ready to talk it.",
    },
    milesNote: {
      headline: "Josephus, six days late on this brief was not the move.",
      body: [
        "I ran a full refresh because the April search left 145 homes untouched, and because you told me the energy lens matters. Two things you should know honestly. One: the listing data does not disclose solar potential, panel amperage, EV readiness, or utility cost for any of these properties. That is a listing-platform limitation, not a research gap. We verify on tour day with the panel, the roof, and the meter, not from the screen. Two: the strongest active match is 5823 Stanbrook in North Chesterfield. The strongest accessibility match is 4512 Wraywood. The strongest dark-horse is 9810 Tuxford the moment it lists June 11.",
        "You and Dominique each have your own view of this page. Rate what speaks. Hide what doesn't. The Equity Snapshot card below is for when the timing on Troy lines up. October is real and we move when you're ready.",
      ],
    },
    fieldsNotDisclosed: [
      "Existing solar (none of the refreshed candidates)",
      "Roof orientation and solar production estimates",
      "Dedicated EV charger or 240V outlet",
      "Electrical panel amperage",
      "Estimated monthly utility cost",
      "Separate-suite utility metering",
    ],
  },
};

export function getJosephusByToken(
  contactId: string,
  token: string,
): { viewer: Viewer; data: JosephusSearchData } | null {
  const viewer = VIEWERS[token];
  if (!viewer) return null;
  if (viewer.contactId !== contactId) return null;
  const data = SEARCHES[viewer.dataId];
  if (!data) return null;
  return { viewer, data };
}
