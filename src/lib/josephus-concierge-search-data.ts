/**
 * Josephus Allmond curated buyer search.
 *
 * Token-gated dual-account dashboard. Two share tokens (Josephus + Dominique) both
 * resolve to the same GHL contactId. viewerType distinguishes whose actions get logged.
 *
 * Property data sourced from Perplexity Computer brief 2026-07-06-2018-josephus-refresh-v3
 * (markdown at shared/inbox-from-pc/2026-07-06-2018-josephus-refresh-v3.md). This V3 run
 * supersedes the June 7 (v2) run. Every disclosed field cites the listing source. Undisclosed
 * fields are explicitly marked, never invented. Energy fields are read from listing fuel type
 * plus current Dominion residential rates; utility figures are ranges, not billed amounts.
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
  // Primary listing photo (broker/MLS source). Required on any listing that ships;
  // parity with the buyer-match dashboard. Optional at the type level only so the
  // hold state compiles before the re-verified data lands.
  photoUrl?: string;
  // Live-status verification. When the listing shipped, this records that active
  // status was confirmed against a live MLS-backed source, with the date and source.
  statusVerifiedOn?: string;
  statusSource?: string;
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
    dataId: "josephus-2026-07-10",
  },
  // Dominique's view. Partner account, same data record, different actor for GHL logs.
  "9Hd_4XnPyVcA": {
    contactId: JOSEPHUS_CONTACT_ID,
    shareToken: "9Hd_4XnPyVcA",
    viewerType: "partner",
    firstName: "Dominique",
    dataId: "josephus-2026-07-10",
  },
};

export const SEARCHES: Record<string, JosephusSearchData> = {
  "josephus-2026-07-10": {
    id: "josephus-2026-07-10",
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
      // Source: PC brief 2026-07-06-2018-josephus-refresh-v3.md, Active Tier 1 table.
      {
        slug: "stanbrook-5823",
        rank: 1,
        tier: "tier1",
        status: "active",
        address: "5823 Stanbrook Dr",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23234",
        price: 465000, // V3, Zillow.
        whyItMatters:
          "Strongest all-around active match. Walk-out daylight basement suite with a bedroom, walk-in closet, full bath with a tiled walk-in shower, and a kitchenette with stove and refrigerator, all reached through a private entrance. Brick ranch on Falling Creek, no HOA.",
        caveat: null,
        zillowUrl:
          "https://www.zillow.com/homedetails/5823-Stanbrook-Dr-North-Chesterfield-VA-23234/12180702_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "All-electric: heat pump, electric cooktop, electric water heater",
          estMonthlyUtilityCost: "approx $160 to $230 (Dominion 14 to 17.4 c/kWh, 2026)",
          energyNotes:
            "Solar-siting read: 7 of 10. Newer 25-year hurricane-rated shingle roof and a 1.35-acre lot both help a future array. No HOA means no solar covenant to fight. Heat pump already in place.",
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
        price: 324950, // V3, Zillow.
        whyItMatters:
          "Best price value in the set. Walk-out basement is fully set up as an in-law suite: two bedrooms, full bath, living room with a wood-burning fireplace, kitchenette, and a separate entrance. Ranch in Olney Park, no HOA.",
        caveat:
          "At $324,950 you sit well under the $475K target, which leaves real budget for an energy retrofit.",
        zillowUrl:
          "https://www.zillow.com/homedetails/4420-Chickahominy-Ave-Richmond-VA-23222/12347236_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "All-electric: forced-air electric heat, electric stove",
          estMonthlyUtilityCost: "approx $150 to $220",
          energyNotes:
            "Solar-siting read: 7 of 10. Nearly one-acre lot, no HOA restriction. Heat is forced-air electric today, so a heat-pump upgrade would cut the bill further. Closest of the Tier 1 set to downtown.",
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
        price: 410000, // V3, Zillow.
        whyItMatters:
          "One-level ranch with a fully dedicated in-law suite: its own entrance, foyer, kitchenette, living room, bedroom, full bath with double vanity, and its own washer and dryer. No stairs to the suite. No HOA.",
        caveat: "Well and septic, not public water and sewer. Confirm both on tour.",
        zillowUrl:
          "https://www.zillow.com/homedetails/1100-Dotson-Rd-Henrico-VA-23231/12367647_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "All-electric: heat pump, electric cooking, electric water heater",
          estMonthlyUtilityCost: "approx $160 to $230",
          energyNotes:
            "Solar-siting read: 7 of 10. Metal roof is durable and solar-compatible, and the 1.55-acre lot supports a roof array or a ground mount. Heat pump present. Detached garage could take a 240V EV circuit.",
        },
      },
      {
        slug: "elmart-1633",
        rank: 4,
        tier: "tier1",
        status: "active",
        address: "1633 Elmart Ln",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23235",
        price: 475000, // V3, Zillow. Down $16K from $490,700.
        whyItMatters:
          "Just dropped $16,000 to $475,000, which pulls it back inside your priority band. Rare in-law suite with a separate entrance, full bath, kitchen area, and its own heating and air. Low-cost HOA around $120 a year.",
        caveat:
          "Sits right at the $475K priority ceiling. Confirm the HOA covenant does not restrict rooftop solar.",
        zillowUrl:
          "https://www.zillow.com/homedetails/1633-Elmart-Ln-North-Chesterfield-VA-23235/12170177_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "All-electric: heat pump, electric cooking, electric water heater; suite has its own electric HVAC zone",
          estMonthlyUtilityCost: "approx $170 to $240 (two HVAC zones)",
          energyNotes:
            "Solar-siting read: 6 of 10. Two HVAC zones raise the baseline load, but both are heat pumps. Confirm the low-cost HOA has no solar covenant.",
        },
      },
      {
        slug: "beauregard-110",
        rank: 5,
        tier: "tier1",
        status: "active",
        address: "110 Beauregard Ave",
        city: "Henrico",
        county: "Henrico",
        zip: "23075",
        price: 402500, // V3, MLS 2616207.
        whyItMatters:
          "New to your list. Lower-level suite with its own private entrance to a patio, a kitchenette area, a full bath, and room for a bedroom and sitting area. Main level already has 2 bedrooms and 2 full baths. Under target on a large lot.",
        caveat:
          "Main-floor square footage is not confirmed at 1,200 or more, and it is sold as-is. Verify both before tour.",
        zillowUrl:
          "https://bluedogrva.com/idx/mls-2616207-110_beauregard_avenue_henrico_va_23075",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "Not disclosed on the listing",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Solar-siting read: 6 of 10. Large lot supports array siting. HVAC and electrical details were not stated on the listing, so this is a tour-day read.",
        },
      },
      // Active Tier 2 (strong separate space, minor conversion or a flagged constraint).
      {
        slug: "lancers-2233",
        rank: 6,
        tier: "tier2",
        status: "active",
        address: "2233 Lancers Blvd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23224",
        price: 385000, // V3, MLS 2611621.
        whyItMatters:
          "Suite quality is exceptional. Each level has a full kitchen and a private entrance, so it functions as two independent units. Lower level is a full suite with two bedrooms or a bedroom plus office. Brand-new roof and HVAC in 2025. Well under target.",
        caveat:
          "Only two full baths total, one per level, so the main-house two-full-bath minimum is met only by counting both levels. Verify on tour.",
        zillowUrl:
          "https://www.zillow.com/homedetails/2233-Lancers-Blvd-North-Chesterfield-VA-23224/12178448_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "All-electric: electric heat, electric water heater",
          estMonthlyUtilityCost: "approx $160 to $230",
          energyNotes:
            "Solar-siting read: 6 of 10. The brand-new 2025 roof is ideal for solar and the HVAC is new. No HOA. Two full kitchens mean two cooking and refrigeration loads.",
        },
      },
      {
        slug: "tuxford-9810",
        rank: 7,
        tier: "tier2",
        status: "active",
        address: "9810 Tuxford Rd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23236",
        price: 420000, // V3, MLS 2613754. Was coming-soon 6/11, expected active now.
        whyItMatters:
          "Basement has a room used as a kitchenette, a full bath with a marble-floored shower, a second wood-burning fireplace, and garage access. Under target at $420,000.",
        caveat:
          "Came on as Coming Soon June 11, so confirm it is live and still available. No explicit private exterior entrance or dedicated basement bedroom is stated yet, so verify the suite on tour.",
        zillowUrl:
          "https://www.zillow.com/homedetails/9810-Tuxford-Rd-North-Chesterfield-VA-23236/12159304_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "Attached garage with workshop, a candidate for a 240V circuit (amperage not stated)",
          electrificationStatus: "All-electric: heat pump, electric cooking, electric water heater",
          estMonthlyUtilityCost: "approx $160 to $230",
          energyNotes:
            "Solar-siting read: 6 of 10. Heat pump present, no HOA. The attached garage with workshop is the natural spot for an EV circuit.",
        },
      },
      {
        slug: "wraywood-4512",
        rank: 8,
        tier: "tier2",
        status: "active",
        address: "4512 Wraywood Ave",
        city: "Chester",
        county: "Chesterfield",
        zip: "23831",
        price: 499500, // V3, MLS 2614462.
        whyItMatters:
          "Best accessibility in the active pool. Full finished walk-out basement with a rare direct-access, step-free exterior entrance, a basement bedroom, family room, laundry, and a shower.",
        caveat:
          "No kitchenette or plumbing rough-in is stated in the suite, so budget for that. Sits at the $500K stretch ceiling, and Chester is near the 35-minute edge, so confirm the drive.",
        zillowUrl:
          "https://www.zillow.com/homedetails/4512-Wraywood-Ave-Chester-VA-23831/12199153_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "Mostly electric: heat pump and electric water heater, but gas cooking",
          estMonthlyUtilityCost: "approx $170 to $240 (electric plus gas cooking)",
          energyNotes:
            "Solar-siting read: 6 of 10. Composition roof suitable for solar. Gas cooking is the only non-electric load, so an induction swap completes the electrification. No HOA.",
        },
      },
      {
        slug: "archdale-3240",
        rank: 9,
        tier: "tier2",
        status: "active",
        address: "3240 Archdale Rd",
        city: "Richmond",
        county: "Richmond City",
        zip: "23235",
        price: 485000, // V3, Zillow FSBO.
        whyItMatters:
          "For-sale-by-owner with a strong accessibility story. Lower level has a separate outside entrance, a stated handicap-accessible layout, a walk-in shower, and step-free rear doors to the parking area, plus room to set up a kitchenette.",
        caveat:
          "Kitchenette is not yet installed. FSBO and on market since December 2024, so we go in eyes open on price discipline.",
        zillowUrl:
          "https://www.zillow.com/homedetails/3240-Archdale-Rd-Richmond-VA-23235/12507014_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "Mixed fuel: electric, gas, and wood or pellet heat sources listed. Not all-electric",
          estMonthlyUtilityCost: "not disclosed (mixed fuel could not be bounded)",
          energyNotes:
            "Solar-siting read: 6 of 10. Asphalt roof suitable for solar and all utilities are underground. Full electrification would need a heat-pump conversion. No HOA.",
        },
      },
      {
        slug: "woodrow-2717",
        rank: 10,
        tier: "tier2",
        status: "active",
        address: "2717 Woodrow Ave",
        city: "Richmond",
        county: "Richmond City",
        zip: "23222",
        price: 499950, // V3, Zillow.
        whyItMatters:
          "New to your list and the closest of the whole set to downtown. Newly finished basement with a wet bar, a third full bath, and a separate entrance, ready to work as an in-law suite.",
        caveat:
          "The wet bar gives you the plumbing rough-in, but upgrade to a full kitchenette for real suite independence. 1924 build sitting at the $500K stretch ceiling.",
        zillowUrl:
          "https://www.zillow.com/homedetails/2717-Woodrow-Ave-Richmond-VA-23222/12527871_zpid/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "Electric heat pump for heat and cool; cooking and water heater not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Solar-siting read: 5 of 10. Small urban lot and a 1924 vintage may limit array size and warrant a panel and service review before adding EV or suite loads. Shingle roof.",
        },
      },
      // Sold comps. What real multigenerational pricing cleared at in your band.
      {
        slug: "gregory-9231",
        rank: 11,
        tier: "watch",
        status: "comp",
        address: "9231 Gregory Dr",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23236",
        price: 475000, // sold approx mid-May 2026.
        whyItMatters:
          "Sold around $475,000 in mid-May. Best in-band comp to your target: a fully finished walk-out basement built out as a complete in-law suite with bedroom, full bath, kitchen, dinette, and living area.",
        caveat: "Sold comp only. Not available.",
        zillowUrl:
          "https://www.bhgre.com/home/detail/va/north-chesterfield/9231-gregory-dr/lid-P00800000H9RLNI3pUCSG3FWi8GM6QN0ZFA3x7AC",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "Mixed: heat pump plus oil baseboard (not all-electric)",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Comp for pricing. Energy fields not carried on the sold record.",
        },
      },
      {
        slug: "cardova-8391",
        rank: 12,
        tier: "watch",
        status: "comp",
        address: "8391 Cardova Cir",
        city: "Henrico",
        county: "Henrico",
        zip: "23227",
        price: 452000, // sold 6/10/2026.
        whyItMatters:
          "Sold $452,000 on June 10, listed at $465,900, so it closed 3 percent under ask. Renovated four-bed with a walkout basement. Fresh in-band data point on where offers are landing.",
        caveat: "Sold comp only. Not available.",
        zillowUrl:
          "https://foundationrealestategroup.com/listing-detail/1178015092/8391-Cardova-CIR-Henrico-VA",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Comp for pricing. Energy fields not enriched on the sold record.",
        },
      },
      {
        slug: "kidsgrove-4337",
        rank: 13,
        tier: "watch",
        status: "comp",
        address: "4337 Kidsgrove Rd",
        city: "Henrico",
        county: "Henrico",
        zip: "23231",
        price: 345000, // sold 6/23/2026.
        whyItMatters:
          "Sold $345,000 on June 23, listed at $339,950, so it closed 1.5 percent over ask. Townhouse with a finished walkout basement and full bath marketed for generational or in-law use. Shows the low end of the band still draws competition.",
        caveat: "Sold comp only. Townhouse with a $152 a month HOA. Not available.",
        zillowUrl:
          "https://www.ballenrealty.com/sold-listing/detail/1195926190/4337-Kidsgrove-RD-Henrico-VA",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes:
            "Comp for pricing. Townhouse HOA may restrict roof solar. Energy fields not enriched on the sold record.",
        },
      },
      {
        slug: "redington-701",
        rank: 14,
        tier: "watch",
        status: "comp",
        address: "701 Redington Ct",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23235",
        price: 450000, // sold 4/24/2026.
        whyItMatters:
          "Sold $450,000 on April 24. In-band price and size comp for the neighborhood, at roughly $167 a square foot.",
        caveat: "Sold comp only. A separate suite was not documented on the record. Not available.",
        zillowUrl:
          "https://www.redfin.com/VA/North-Chesterfield/9707-Goodward-Ct-23236/home/59529097",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Comp for pricing. Energy fields not enriched on the sold record.",
        },
      },
      {
        slug: "heppel-142",
        rank: 15,
        tier: "watch",
        status: "comp",
        address: "142 Heppel Rd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23236",
        price: 449000, // sold 3/4/2026.
        whyItMatters:
          "Sold $449,000 on March 4. Five-bedroom layout that often supports a lower-level suite, at roughly $168 a square foot. Rounds out the picture of what your band bought this spring.",
        caveat: "Sold comp only. A separate suite was not documented on the record. Not available.",
        zillowUrl:
          "https://www.redfin.com/VA/North-Chesterfield/9707-Goodward-Ct-23236/home/59529097",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Comp for pricing. Energy fields not enriched on the sold record.",
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
        "This is about the buy side. The sell side is on the calendar when you're ready to talk it.",
    },
    milesNote: {
      headline: "Josephus, your pool got a real energy read this round.",
      body: [
        "I re-verified all eight of your prior homes and swept fresh in-law inventory across the five counties. Every one is still active, and 1633 Elmart just dropped $16,000 to $475,000, which pulls it back inside your priority band. Two new ones earned a slot: 110 Beauregard in Henrico at $402,500, and 2717 Woodrow, the closest of the whole set to downtown.",
        "The bigger change is the energy column. Last time the listings gave us nothing there. This round I could read each home's heating, cooking, and water setup, tag the all-electric ones, and put a real monthly utility band on them using current Dominion rates. Six of the ten are already fully electric. Two run mixed fuel, so I flagged exactly what it takes to finish the electrification. That is the lens you asked for, on the page, per home.",
        "You and Dominique each have your own view. Rate what fits, hide what does not, and I read both sides. The five sold homes at the bottom are the comps that show what real multigenerational pricing cleared at in your band this season. The Equity Snapshot on Troy is still there for whenever the sell-side timing lines up.",
      ],
    },
    fieldsNotDisclosed: [
      "Existing rooftop solar (none of the ten has it installed today)",
      "Exact roof orientation and a measured solar production estimate",
      "Dedicated EV charger or a confirmed 240V circuit",
      "Electrical panel amperage",
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
