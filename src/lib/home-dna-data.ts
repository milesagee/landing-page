/**
 * Home DNA (buyer concierge) data shape + lookup.
 *
 * Consumed by /home-dna/[contactId] route. A MAMS LLC buyer-side surface that
 * captures the criteria the MLS cannot filter on (natural light, exterior feel)
 * and presents a cited deep-research read on the buyer's target areas in the
 * concierge aesthetic.
 *
 * Distinct from buyer-match (which is a property shortlist). Here Miles owns the
 * MLS auto-search; this surface carries the two proprietary scoring systems
 * (Natural Light Score + Facade Clash Check) and the area intelligence that no
 * saved search gives the buyer.
 *
 * Lookup model: contactId + token. Token via URL query only, validated against
 * the SAME string the page-load gate reads. Read-only surface in v1 (no submit),
 * so no API route. Phase 2 may add curated candidate properties + a tour/pass
 * submit, at which point the three-GHL-write pattern applies.
 *
 * EVERY market figure carries an inline source comment naming the PC report
 * citation it came from. The PC report is archived at
 * shared/completed/2026-06-30-1140-mary-buyer-concierge-area-intel.md.
 * Zero invented numbers. If a figure is not in the report, it does not appear.
 */

export type LightFactor = {
  name: string;
  // What earns the top 2 points, in plain buyer language.
  topMark: string;
};

export type FacadeRule = {
  verdict: "PASS" | "FLAG";
  label: string;
  detail: string;
};

// A sample facade the buyer can read through the Facade Clash Check so the rule
// is demonstrated, not just asserted. The Tupper Branch entry is the calibration
// proof and MUST resolve to FLAG.
export type FacadeExample = {
  label: string;
  materials: string;
  verdict: "PASS" | "FLAG";
  why: string;
  isCalibration?: boolean;
};

export type AreaRead = {
  name: string;
  rankLabel: string; // "Your #1", "Your #2", "Opportunistic", "Wildcard"
  // Inventory + price reality at her budget, cited.
  budgetReality: string;
  // Dominant era + facade material mix, with the dealbreaker prevalence read.
  facadeRead: string;
  facadePrevalence: string; // "Rare" | "Occasional" | "Occasional to common"
  // Lot, canopy, orientation -> natural-light implication.
  lightRead: string;
  // Renovated-kitchen + hardwood prevalence.
  renoRead: string;
  // Commute, walkability, amenities (fair-housing-safe).
  livabilityRead: string;
};

export type HomeDnaData = {
  contactId: string;
  firstName: string;
  shareToken: string;

  // The Big Two, in her own framing.
  bigTwo: string[];

  // Home DNA criteria card (her framing).
  budgetLabel: string; // "$300K ideal, $360K ceiling"
  configLabel: string; // "2 bed / 1 bath minimum"
  dnaPoints: { label: string; value: string }[];
  facadeDealbreaker: string; // her exact dealbreaker, her framing

  // Miles voice opener under the hero (the read on her search).
  milesRead: string;

  // The MAMS edge.
  lightScoreIntro: string;
  lightFactors: LightFactor[];
  lightVeto: string; // the dim-photo veto, plain language
  facadeIntro: string;
  facadeRules: FacadeRule[];
  facadeExamples: FacadeExample[];

  // Area Intelligence (synthesized + cited). Verdict first.
  verdict: string;
  areaReads: AreaRead[];

  // Sources audit (rendered in footer).
  sources: { url: string; description: string }[];

  completedAt: string; // ISO8601 when the PC research finished
};

export const CONTACTS: Record<string, HomeDnaData> = {
  // Mary -- live MAMS buyer client, consultation 2026-06-30. Fed by the PC
  // area-intel report (request_id 2026-06-30-1140-mary-buyer-concierge-area-intel).
  // contactId + shareToken are PLACEHOLDERS until Miles confirms her MAMS GHL
  // contact at cosign. Swap both before sending. Do NOT send until cosigned.
  "mary-home-dna": {
    contactId: "mary-home-dna",
    firstName: "Mary",
    shareToken: "9Z74-a3g_18r",

    bigTwo: ["Location", "Natural light"],

    budgetLabel: "$300K ideal, $360K ceiling",
    configLabel: "2 bed / 1 bath minimum",
    dnaPoints: [
      { label: "Areas", value: "Bon Air 23235 first. Then the Parham and Henrico corridor near Lakeside. Affordable city pockets as a wildcard." },
      { label: "Two cats", value: "No fenced yard needed. A small yard is fine." },
      { label: "Garage", value: "A tiebreaker, never a dealbreaker." },
      { label: "Pluses", value: "Hardwood floors. A renovated kitchen." },
    ],
    facadeDealbreaker:
      "You love brick. Brick with vinyl is fine. What you cannot live with is the clash, faux stone veneer fighting siding on the same front. The problem was never one material. It was two materials competing.",

    // Miles voice. You-frame, polarity move, 4-beat. No em dashes, no emojis.
    milesRead:
      "Your two non-negotiables are the two things a search bar cannot find. Location it can fake with a radius. Light it cannot read at all. Most agents drag you through dark houses to find out in person. We score the light off the listing before you ever drive over, and we catch the exterior clash from the front photo. That is the whole point of this page. You see fewer homes, and the ones you see are already worth your Saturday.",

    lightScoreIntro:
      "Natural Light Score estimates how bright a home will feel before you ever set foot in it. It reads six things off the listing, the map, and the photos. Each is worth up to 2 points. The total scales to 10. We only tour homes that score 7 and up, and you see the score on every home we send.",
    lightFactors: [
      {
        name: "Orientation",
        // Source: PC report Natural Light Score Method + DOE passive solar guide.
        topMark: "The rooms you live in by day, or the rear, face south or southeast. The Department of Energy puts the best light within 30 degrees of true south.",
      },
      {
        name: "Window inventory",
        topMark: "Large windows, bays, sliders, corner windows, two exposures in a room. We count them photo by photo.",
      },
      {
        name: "Light features",
        topMark: "Skylights, a sunroom, vaulted or cathedral ceilings, an open plan, real glass doors.",
      },
      {
        name: "Listing keywords",
        topMark: "Sun-drenched, southern exposure, lots of windows, skylight, open, vaulted. Multiple of them, not one throwaway line.",
      },
      {
        name: "Lot and canopy",
        // Source: PC report -- Bon Air mature canopy is a real light variable.
        topMark: "An open or south-open lot, a corner, a wider setback. In Bon Air the tree canopy is real, so a shaded south side costs points.",
      },
      {
        name: "Photo truth test",
        topMark: "The rooms stay bright in the listing photos without looking blown out, and several show real daylight.",
      },
    ],
    lightVeto:
      "Here is the part most people miss. Listing photos are built to look bright. Pros open every blind, turn on every light, and balance the exposure. So if a room still looks dim in a professional photo, that is a warning, not a quirk. When two main rooms look dim, the score gets capped low no matter what else is going on. We prove it in person before we believe it.",

    facadeIntro:
      "The Facade Clash Check runs off the front photo. It is not about taste. It is about your one hard line. A clean single material passes. Two materials fighting on the same front gets flagged for you to veto on sight.",
    facadeRules: [
      {
        verdict: "PASS",
        label: "Passes",
        detail: "All brick. Brick with vinyl. Any clean single-material front. One material, doing one job.",
      },
      {
        verdict: "FLAG",
        label: "Flags",
        detail: "Faux or fake stone veneer mixed with siding, your exact dealbreaker. Or three or more materials competing on the front.",
      },
    ],
    facadeExamples: [
      {
        label: "All-brick ranch",
        materials: "Full brick front, no competing material",
        verdict: "PASS",
        why: "One material, clean. This is the look you already love.",
      },
      {
        label: "Brick with vinyl",
        materials: "Brick base, vinyl above",
        verdict: "PASS",
        why: "Two materials, but they are not fighting. You told me this one is fine.",
      },
      {
        label: "6729 Tupper Branch Ln",
        materials: "Faux stone veneer combined with siding",
        verdict: "FLAG",
        why: "This is the home you walked away from on the exterior alone. Faux stone veneer against siding is the exact clash. The system flags it the same way your gut did, before a tour, every time.",
        isCalibration: true,
      },
    ],

    // Source: PC report Ranked Verdict + Key Findings.
    verdict:
      "Bon Air is your cleanest fit on feel and location when the house itself passes the light test. Lakeside and the 23228 side of the Parham corridor are where your budget actually reaches, with the most homes to choose from. Pockets of 23229 are worth a fast look when a rare one lands under your ceiling. Affordable city pockets give you the most raw inventory, and the most screening, so they earn a spot listing by listing, not on the area name.",
    areaReads: [
      {
        name: "Bon Air, 23235",
        rankLabel: "Your #1",
        // Source: PC report -- 2 visible Redfin matches 6/30/26; broader 23235 median $447K July 2025.
        budgetReality:
          "Your range sits below the broader Bon Air market, where the median sale price was $447,000 in July 2025, so the homes in your band are the smaller, older, or faster-moving ones. On June 30 there were only 2 active homes in the area from $300,000 to $360,000 that fit your beds and baths. It is a thin, fast-screening lane, which is exactly where having someone watching for you pays off.",
        // Source: PC report -- Victorian cottages, post-war ranches, Cape Cods, split-levels; dealbreaker occasional.
        facadeRead:
          "Bon Air runs from Victorian resort cottages to post-war brick ranches, Cape Cods, and split-levels, with newer farmhouse and Craftsman builds mixed in. Brick and brick-with-siding are everywhere. Your faux-stone-plus-siding dealbreaker shows up mostly in newer infill and aggressive flips, not the older stock you are drawn to.",
        facadePrevalence: "Occasional",
        // Source: PC report -- mature canopy, shade risk; brighter sub-pockets.
        lightRead:
          "The mature tree canopy is what gives Bon Air its feel, and it is also the thing that can dim a ranch with small original windows. The bright homes here are the ones on wider or corner lots, on open rear yards, or with living spaces facing south or southeast. Orientation matters more here than almost anywhere on your list.",
        // Source: PC report -- hardwood plausible in mid-century stock; reno depends.
        renoRead:
          "The older stock makes original hardwood plausible. A renovated kitchen depends on the specific home. A Bon Air listing in your range with both a renovated kitchen and a high light score is the one we move on fast.",
        // Source: PC report -- ~15 min downtown via cited routes; walkability address-dependent.
        livabilityRead:
          "Forest Hill Avenue, Huguenot Road, and the Powhite and Chippenham parkways put downtown about 15 minutes out. Walkability swings by address, so we score it per home rather than by area.",
      },
      {
        name: "Lakeside and central 23228",
        rankLabel: "Your #2",
        // Source: PC report -- 5 visible 23228 matches, filtered median ~$349,950; $336K median sale, 12 DOM Sept 2025.
        budgetReality:
          "This is your most practical lane. On June 30 there were 5 active homes from $300,000 to $360,000 in 23228 that fit, with a filtered median list price near $349,950. The 23228 market is competitive, with a $336,000 median sale price and 12 days on market in September 2025, so when the right one lands we move with intent, not panic.",
        // Source: PC report -- bungalows, ranches, Cape Cods, cottages; dealbreaker occasional.
        facadeRead:
          "Lakeside is bungalows, ranches, Cape Cods, and cottages on tree-lined streets, mostly early to mid twentieth century. Brick, siding, and brick-with-siding are the norm. The faux-stone clash you dislike turns up mainly in flips and additions, not the core older homes.",
        facadePrevalence: "Occasional",
        // Source: PC report -- mature trees, listing-level shade checks.
        lightRead:
          "The same mature trees that make Lakeside charming can shade an older cottage with low window counts. The brighter ones are corner lots, homes near parks or open edges, and any home where the living spaces face south or southeast. We check the lot on satellite before we get excited.",
        // Source: PC report -- active renovation wave; hardwood common in 40s-60s homes.
        renoRead:
          "Lakeside has an active renovation wave, so updated kitchens and stainless appliances show up in your range more often here than in Bon Air. Hardwood is common in the 1940s to 1960s homes, but we confirm it in the photos rather than assume it.",
        // Source: PC report -- ~10-15 min downtown; near Lewis Ginter, Bryan Park.
        livabilityRead:
          "Lakeside puts downtown about 10 to 15 minutes away and sits near Lewis Ginter Botanical Garden and Bryan Park, with local breweries and restaurants close by. Walkability is address-by-address, so it gets scored per home.",
      },
      {
        name: "Select 23229",
        rankLabel: "Opportunistic",
        // Source: PC report -- $511K median sale, 14 DOM Jan 2026; only 2 matches near ceiling.
        budgetReality:
          "This is a rare-find lane, not a pipeline. The 23229 market runs high, with a $511,000 median sale price in January 2026, and on June 30 only 2 homes in your range showed up, both near your $360,000 ceiling. When one lands here we screen it the same day, because they do not sit.",
        // Source: PC report -- larger split-levels can combine materials; dealbreaker occasional.
        facadeRead:
          "The 23229 homes in your range skew larger and more suburban, often split-levels and bi-levels from the late 1950s on. Those can combine brick, siding, and accent materials, so each one needs a real photo review against your hard line.",
        facadePrevalence: "Occasional",
        lightRead:
          "Bigger footprints and wider lots can mean more glass and better light, but the trees and the neighbor spacing still decide it. Orientation and window count win, not the price tag.",
        renoRead:
          "Condition varies widely here. When a 23229 home lands in budget, the question is whether the inside has kept up with the location. We read that off the photos before the drive.",
        livabilityRead:
          "Strong location near Parham and Tuckahoe. Walkability is low in much of this lane, so we score it per address and weigh it against the commute you actually want.",
      },
      {
        name: "Affordable city pockets",
        rankLabel: "Wildcard",
        // Source: PC report -- 122 area results, 23 city-proper page 1, ~$339,500 visible median.
        budgetReality:
          "The city gives you the most homes and the most screening. On June 30 the search returned 122 area results, with 23 city-proper homes on the first page alone in your range, around a $339,500 median on what was visible. The trade is variety for vetting. Richmond is competitive, with a $413,752 median sale price and homes going at 101.8 percent of list in May 2026, so a budget listing earns a look only after it clears the light and facade checks.",
        // Source: PC report -- older bungalows plus new infill; dealbreaker occasional to common in infill/flips.
        facadeRead:
          "City stock runs from older bungalows and foursquares to brand-new infill. The infill and flips are where your faux-stone-plus-siding clash shows up most, so the city is the one lane where the facade check does the heaviest lifting.",
        facadePrevalence: "Occasional to common in new infill and flips",
        // Source: PC report -- citywide canopy 32% (2021), block-by-block variation.
        lightRead:
          "Narrow city lots can leave side rooms dark, but corner lots, open-plan renovations, taller ceilings, and newer window packages can score very well. Canopy swings block to block, with citywide tree cover around 32 percent as of 2021, so light here is a per-home read, never a per-area one.",
        renoRead:
          "Renovated kitchens are easy to find in this band because it includes both updated older homes and new construction. The catch is matching the renovation quality and the exterior feel to you, and confirming hardwood versus engineered or vinyl plank rather than assuming.",
        livabilityRead:
          "Richmond averages a Walk Score around 51, with the most walkable pockets near the center often above your single-family budget. We point any city candidate at the facts, never at a label, and we read safety from published crime statistics by area, not assumptions.",
      },
    ],

    sources: [
      // Source URLs lifted verbatim from the PC report Sources Table.
      {
        url: "https://www.redfin.com/zipcode/23235/filter/property-type=house,min-price=300k,max-price=360k,min-beds=2,min-baths=1",
        description: "Redfin 23235 filtered search. Bon Air active listings in your range, June 30, 2026.",
      },
      {
        url: "https://www.redfin.com/zipcode/23235/housing-market",
        description: "Redfin 23235 housing market. Broader Bon Air median sale price $447,000, July 2025.",
      },
      {
        url: "https://www.redfin.com/zipcode/23228/filter/property-type=house,min-price=300k,max-price=360k,min-beds=2,min-baths=1",
        description: "Redfin 23228 filtered search. Lakeside corridor active listings, June 30, 2026.",
      },
      {
        url: "https://www.redfin.com/zipcode/23228/housing-market",
        description: "Redfin 23228 housing market. $336,000 median sale price, 12 days on market, September 2025.",
      },
      {
        url: "https://www.redfin.com/zipcode/23229/filter/property-type=house,min-price=300k,max-price=360k,min-beds=2,min-baths=1",
        description: "Redfin 23229 filtered search. Two homes in range near ceiling, June 30, 2026.",
      },
      {
        url: "https://www.redfin.com/zipcode/23229/housing-market",
        description: "Redfin 23229 housing market. $511,000 median sale price, 14 days on market, January 2026.",
      },
      {
        url: "https://www.redfin.com/city/17149/VA/Richmond/filter/property-type=house,min-price=300k,max-price=360k,min-beds=2,min-baths=1",
        description: "Redfin Richmond filtered search. 122 area results, 23 city-proper page-one matches, June 30, 2026.",
      },
      {
        url: "https://www.redfin.com/city/17149/VA/Richmond/housing-market",
        description: "Redfin Richmond housing market. $413,752 median sale price, 101.8 percent of list, May 2026.",
      },
      {
        url: "https://ownrva.com/neighborhoods/bon-air-va/",
        description: "OwnRVA Bon Air profile. Housing stock, wooded character, roughly 15-minute downtown commute.",
      },
      {
        url: "https://ownrva.com/neighborhoods/lakeside-va/",
        description: "OwnRVA Lakeside profile. Era and architecture, mature trees, amenities, commute.",
      },
      {
        url: "https://www.richmonder.org/richmonds-rezoning-allows-more-development-should-it-also-require-more-trees/",
        description: "The Richmonder. Richmond citywide tree canopy at 32 percent in 2021.",
      },
      {
        url: "https://www.walkscore.com/VA/Richmond",
        description: "Walk Score Richmond. Citywide average around 51, higher in central neighborhoods.",
      },
      {
        url: "https://www.energy.gov/sites/default/files/2021-08/ES-Passive%20Solar%20design_081321.pdf",
        description: "U.S. Department of Energy passive solar guide. South-facing living windows within 30 degrees of true south.",
      },
      {
        url: "https://www.iacrea.com/en/blog/real-estate-photography/how-to-photograph-a-property-15-professional-tips",
        description: "IACrea real estate photography guide. Sellers maximize visible light, which is why a dim photo is a warning.",
      },
    ],

    completedAt: "2026-06-30T11:40:52-04:00",
  },
};

export function getHomeDnaByToken(
  contactId: string,
  token: string,
): HomeDnaData | null {
  const d = CONTACTS[contactId];
  if (!d) return null;
  if (d.shareToken !== token) return null;
  return d;
}
