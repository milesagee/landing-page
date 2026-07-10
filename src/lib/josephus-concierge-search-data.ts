/**
 * Josephus Allmond curated buyer search.
 *
 * Token-gated dual-account dashboard. Two share tokens (Josephus + Dominique) both
 * resolve to the same GHL contactId. viewerType distinguishes whose actions get logged.
 *
 * Property data sourced from Perplexity Computer brief 2026-07-10-1428-josephus-LIVE-STATUS-refresh
 * (markdown at shared/completed/2026-07-10-1428-josephus-LIVE-STATUS-refresh.md). Every active
 * listing was verified against a live, non-cached broker/MLS IDX page on 2026-07-10, with the
 * status source and check date recorded per listing and the photo URL confirmed to load (HTTP 200).
 * Homes that could not be confirmed live are held in Watch, never shown as available. Sold homes
 * are labeled comps. This replaces the prior V3 data, which shipped cached-snapshot listings that
 * turned out to be sold / under contract.
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
  // Primary listing photo (broker/MLS source), verified to load. Required on any active
  // listing that ships; parity with the buyer-match dashboard. Optional at the type level
  // only so the hold state and comp/watch rows (no photo needed) compile.
  photoUrl?: string;
  // Live-status verification. Set on any active listing: proof that active status was
  // confirmed against a live MLS-backed source, with the date and the source URL.
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
      // Active, verified live against a broker/MLS IDX page on 2026-07-10.
      {
        slug: "beauregard-110",
        rank: 1,
        tier: "tier1",
        status: "active",
        address: "110 Beauregard Ave",
        city: "Henrico",
        county: "Henrico",
        zip: "23075",
        price: 375000, // live CVRMLS via United IDX, verified 2026-07-10.
        photoUrl:
          "https://api.cotality.com/trestle/Media/Property/PHOTO-Jpeg/1174605571/1/MjkxOS8xNzA2LzIw/MjAvMTM5ODUvMTc4MzU1NTU1NQ/nT8Kq_3p3sXTo6NtbIqNg0GoKBUVm1C4_jgUYhSS3ys",
        statusVerifiedOn: "July 10, 2026",
        statusSource:
          "https://www.unitedrealestaterichmond.com/home/for-sale/henrico-va/110-beauregard-avenue/55372766",
        whyItMatters:
          "Best all-around fit and the tightest commute of the group, roughly 13 minutes to downtown. Walk-out lower-level in-law suite with its own private entrance to the patio, a kitchenette, a full bath, and room for a bedroom and sitting area. Primary bedroom is on the main floor. Now $375,000, improved from $402,500.",
        caveat:
          "Mixed fuel (heat pump plus oil, two gas fireplaces), so budget a separate oil or gas bill on top of electric. Confirm the exact main-floor square footage on tour.",
        zillowUrl:
          "https://www.unitedrealestaterichmond.com/home/for-sale/henrico-va/110-beauregard-avenue/55372766",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "Mixed fuel: heat pump plus oil, with electric cooking and electric water heater and two gas fireplaces",
          estMonthlyUtilityCost: "approx $105 to $155 electric, plus a separate oil or gas bill (est)",
          energyNotes:
            "Oil is the one non-electric heating load. A future heat-pump-only conversion would simplify the bill. Solar, EV, and panel amperage are not disclosed on the listing. Verify on tour.",
        },
      },
      {
        slug: "stanbrook-5823",
        rank: 2,
        tier: "tier1",
        status: "active",
        address: "5823 Stanbrook Dr",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23234",
        price: 489000, // live CVRMLS, updated 2026-07-10 03:22 PM ET.
        photoUrl:
          "https://prd-pbgo-mls-photos.s3.amazonaws.com/cvrmls/properties/photos/2608014_69ab79056fa036a13ae55c8b1e134937.jpg",
        statusVerifiedOn: "July 10, 2026",
        statusSource:
          "https://www.villagesells.com/real-estate/5823-stanbrook-drive-north-chesterfield-va-23234/2608014/193989467",
        whyItMatters:
          "Best suite quality in the set. Move-in-ready walk-out daylight basement suite with a private entrance, a kitchenette (stove and refrigerator), and a full bath with a walk-in shower. Brick ranch on a 1.35-acre Falling Creek waterfront lot.",
        caveat:
          "At $489,000 this is the top of your stretch ceiling. The live MLS price is up from the $465,000 the old cached data showed, so the number is current as of today. Drive time is the most variable of the group.",
        zillowUrl:
          "https://www.villagesells.com/real-estate/5823-stanbrook-drive-north-chesterfield-va-23234/2608014/193989467",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "Not fully disclosed on the listing; reads all-electric-equivalent",
          estMonthlyUtilityCost: "approx $155 to $230 electric (est, Dominion 15 c/kWh 2026)",
          energyNotes:
            "The 1.35-acre waterfront lot likely offers good roof and lot solar siting, but roof orientation is not disclosed. Solar, EV, and panel amperage not disclosed.",
        },
      },
      {
        slug: "elmart-1633",
        rank: 3,
        tier: "tier1",
        status: "active",
        address: "1633 Elmart Ln",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23235",
        price: 459999, // live welschrealtygroup IDX, verified 2026-07-10.
        photoUrl:
          "https://api.cotality.com/trestle/Media/Property/PHOTO-Jpeg/1159303288/1/Mzc4LzEwOTA3LzIw/MjAvMjA5MTMvMTc3ODM1ODY0MQ/0nhCXrNaT98BaZlNyIWFRPE-PNdtLgOXvuhdTIY-W_Y",
        statusVerifiedOn: "July 10, 2026",
        statusSource:
          "https://welschrealtygroup.com/homes-for-sale-details/1633-ELMART-LANE-CHESTERFIELD-VA-23235/2611487/31/",
        whyItMatters:
          "Value play with a real suite. Attached in-law suite has a separate entrance, a full bath, its own kitchen area, and its own heating and air zone. Just cut roughly $31,000 from the original $490,700.",
        caveat:
          "Broker feeds disagree on the exact list price and active MLS number (2611487 vs 2617137). Treat $459,999 as current and confirm the live number before writing an offer.",
        zillowUrl:
          "https://welschrealtygroup.com/homes-for-sale-details/1633-ELMART-LANE-CHESTERFIELD-VA-23235/2611487/31/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "Not fully disclosed; the suite runs its own independent HVAC zone",
          estMonthlyUtilityCost: "approx $155 to $230 electric (est)",
          energyNotes:
            "Two conditioned zones raise the baseline a little. Solar, EV, and panel amperage not disclosed. Verify on tour.",
        },
      },
      {
        slug: "wraywood-4512",
        rank: 4,
        tier: "tier2",
        status: "active",
        address: "4512 Wraywood Ave",
        city: "Chester",
        county: "Chesterfield",
        zip: "23831",
        price: 435900, // live CVRMLS, updated 2026-07-10 03:22 PM ET.
        photoUrl:
          "https://prd-pbgo-mls-photos.s3.amazonaws.com/cvrmls/properties/photos/2614462_659b8e23b8bd7363cc8ab63f4278e52d.jpg",
        statusVerifiedOn: "July 10, 2026",
        statusSource:
          "https://www.villagesells.com/real-estate/4512-wraywood-avenue-chester-va-23831/2614462/",
        whyItMatters:
          "Accessibility standout. Full finished walk-out basement with a rare step-free, no-step private exterior entrance, the best aging-in-place feature in the pool.",
        caveat:
          "The basement has no kitchenette yet, so budget to add one to complete the suite. The price is the least stable of the set (live CVRMLS $435,900 sits about $60K below the old cached portals), so lock the number early. Chester is near the 35-minute edge, so confirm the drive.",
        zillowUrl:
          "https://www.villagesells.com/real-estate/4512-wraywood-avenue-chester-va-23831/2614462/",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus:
            "Mixed fuel: electric and heat pump heating, but gas cooking; septic tank",
          estMonthlyUtilityCost: "approx $130 to $200 electric, plus gas (est)",
          energyNotes:
            "Gas cooking is the only non-electric load; an induction swap would complete the electrification. Solar, EV, and panel amperage not disclosed.",
        },
      },
      // Watch. Great layout, but I could not confirm it active on a today-dated source.
      // Shown here on purpose so it is never presented as available until verified.
      {
        slug: "lancers-2233",
        rank: 5,
        tier: "watch",
        status: "status-conflict",
        address: "2233 Lancers Blvd",
        city: "North Chesterfield",
        county: "Chesterfield",
        zip: "23224",
        price: 379950,
        whyItMatters:
          "The best layout of anything I found: two full kitchens and two private entrances, essentially two independent units, all-electric. If it is still available it jumps near the top.",
        caveat:
          "I could not confirm it is still active on a current source (the freshest listing page is over a month old). I am reconfirming live status before we act, so I am holding it here rather than putting it in front of you as available.",
        zillowUrl:
          "https://unitedrealestaterichmond.com/home/for-sale/chesterfield-va/2233-lancers-boulevard/54234063",
        energy: {
          existingSolar: "no",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "All-electric: electric heat, central electric A/C, electric water heater",
          estMonthlyUtilityCost: "approx $155 to $230 electric (est)",
          energyNotes: "All-electric already. Status being reconfirmed before any tour.",
        },
      },
      // Sold comps. Recent closings for pricing truth. None are available.
      {
        slug: "chickahominy-4420",
        rank: 6,
        tier: "watch",
        status: "comp",
        address: "4420 Chickahominy Ave",
        city: "Richmond",
        county: "Richmond City",
        zip: "23222",
        price: 315000, // sold 6/22/2026, listed $324,950.
        whyItMatters:
          "This was on the old list as active. It actually sold June 22 at $315,000. It is the closest direct comp to what you want: a basement in-law suite with two bedrooms, a full bath, a kitchenette, and a separate entrance.",
        caveat: "Sold comp only. Not available.",
        zillowUrl:
          "https://www.coldwellbanker.com/va/richmond/4420-chickahominy-ave/lid-P00800000HAX5YN7tTijk3pf6eDyquMU62LokG0E",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Sold comp for pricing context.",
        },
      },
      {
        slug: "chillingham-3510",
        rank: 7,
        tier: "watch",
        status: "comp",
        address: "3510 Chillingham Ct",
        city: "Henrico",
        county: "Henrico",
        zip: "23231",
        price: 485000, // sold 6/22/2026.
        whyItMatters:
          "Sold June 22 at $485,000. A larger flexible-space home at the upper end of your band, useful for seeing what more square footage costs.",
        caveat: "Sold comp only. Not available.",
        zillowUrl: "https://www.trulia.com/home/9417-sherry-ln-henrico-va-23231-12369205",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Sold comp for pricing context.",
        },
      },
      {
        slug: "ravenscraig-7105",
        rank: 8,
        tier: "watch",
        status: "comp",
        address: "7105 Ravenscraig Cres",
        city: "Henrico",
        county: "Henrico",
        zip: "23231",
        price: 455000, // sold 6/24/2026.
        whyItMatters:
          "Sold June 24 at $455,000. A Henrico corridor comp in the heart of your band, right where the strongest active options sit.",
        caveat: "Sold comp only. Not available.",
        zillowUrl: "https://www.trulia.com/home/9417-sherry-ln-henrico-va-23231-12369205",
        energy: {
          existingSolar: "not disclosed",
          evCharger: "not disclosed",
          panelAmperage: "not disclosed",
          electrificationStatus: "not disclosed",
          estMonthlyUtilityCost: "not disclosed",
          energyNotes: "Sold comp for pricing context.",
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
      headline: "Josephus, I rebuilt this on homes I confirmed active today.",
      body: [
        "Straight with you: the version I had up before leaned on stale listing data, and some of those homes were already sold or under contract. I pulled it down and started over. Every active home on this page was verified against the live MLS today, July 10, with a photo and the source behind it. If it is here, it is real as of today.",
        "Four cleared that bar. 110 Beauregard in Henrico is the standout at $375,000: a true walk-out suite with its own entrance and kitchenette, the primary bedroom on the main floor, and the shortest drive downtown of the group. 5823 Stanbrook is the best suite, on a 1.35-acre waterfront lot at the top of your range. 4512 Wraywood has a rare step-free basement entrance. 1633 Elmart just cut about $31,000 and has a suite with its own kitchen and HVAC. Prices moved since the old data, so each card shows today's number.",
        "One more, 2233 Lancers, has the best layout of all, two full kitchens and two entrances, but I could not confirm it is still active on a current source, so I am holding it in Watch until I verify rather than put it in front of you as available. The three sold homes at the bottom are recent closings so you can see what these suites actually trade for. You and Dominique each have your own view. Rate what fits.",
      ],
    },
    fieldsNotDisclosed: [
      "Existing rooftop solar (none of the active homes has it installed today)",
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
