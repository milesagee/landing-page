export interface FAQ {
  question: string;
  answer: string;
}

export interface NeighborhoodContent {
  slug: string;
  name: string;
  county: string;
  parent: string;
  oneLineFit: string;
  housingStock: string;
  buyingReality: string;
  sellingReality: string;
  lifestyle: string;
  fitChecklist: string[];
  faqs: FAQ[];
  milesTake: string;
  reviewedDate: string;
  geo?: { latitude: number; longitude: number };
}

const TODAY = "2026-05-04";

const STANDARD_SCHOOLS_FAQ: FAQ = {
  question: "What about schools in this neighborhood?",
  answer:
    "Public school zoning in Richmond changes by address and grade level. For accurate, up-to-date school information including ratings and reviews, check Niche (https://www.niche.com/) and GreatSchools (https://www.greatschools.org/), and verify zoning through the official school district website before making any decisions.",
};

export const neighborhoods: NeighborhoodContent[] = [
  {
    slug: "the-fan",
    name: "The Fan",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Walkable, historic, restaurant-dense, Richmond's flagship urban neighborhood, anchored by Monument Avenue and the Virginia Museum of Fine Arts.",
    housingStock:
      "Block after block of brick and stone rowhouses from the late 1800s and early 1900s, with a smaller mix of converted condos and accessory dwelling units. Lot sizes are tight, parking is on-street, and most homes need active historic-character maintenance.",
    buyingReality:
      "Inventory moves fast on the best blocks. When a renovated rowhouse near Monument Avenue or close to the VMFA comes up in good condition, it draws multiple offers and rarely sits. Your edge is being ready to move and knowing which blocks command a premium and which are quietly better value. Condition matters more here than almost anywhere in the city, because a 100-year-old home can hide its real costs behind fresh paint.",
    sellingReality:
      "Buyers come to The Fan for character, walkability, and the address. Price to the block, not to the neighborhood average, because a corner on Hanover trades differently than a mid-block on Stuart. Staging that respects the original detail, the plaster, the heart pine, the transoms, beats a flip-style gut every time with this buyer. Presentation and pricing strategy decide whether you get one offer or several.",
    lifestyle:
      "You can walk to dinner, coffee, the farmers market, and the VMFA without starting your car. Carytown is minutes away and Monument Avenue is your front yard. The trade is on-street parking and the steady hum of a dense, social neighborhood. People who love The Fan love that they never have to drive to live their day.",
    fitChecklist: [
      "You want walkability and access to restaurants, coffee, and nightlife without driving.",
      "You appreciate historic architecture and are comfortable with the maintenance reality of a 100+ year old home.",
      "You don't need a private driveway, large yard, or new construction.",
    ],
    faqs: [
      {
        question: "What's the typical price range in The Fan?",
        answer:
          "Single-family rowhouses in The Fan typically trade in the upper $500Ks to mid $700Ks depending on block, condition, and renovation level, with smaller homes and condos available below that range and renovated three-story houses on Monument Avenue trading higher. Pricing changes; verify with current MLS data before making decisions.",
      },
      {
        question: "Is The Fan a good fit for first-time buyers?",
        answer:
          "It can be, but the realistic entry points for first-time buyers in The Fan are usually two-bedroom rowhouses, condos, or homes that need renovation. Walkability, condition, and street parking should drive the search. Talk through your budget and the current inventory with a Richmond agent before you tour.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "The Fan is the neighborhood most people picture when they picture Richmond, and that reputation is earned. The mistake buyers make is falling for the prettiest house instead of the right block. I would rather put you in a slightly less finished home on a stronger street than a flip on a weaker one. The block is permanent. The finishes are not.",
    reviewedDate: TODAY,
    geo: { latitude: 37.5556, longitude: -77.4639 },
  },

  {
    slug: "church-hill",
    name: "Church Hill",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Richmond's oldest neighborhood, historic, revitalizing, river views, and the city's deepest origin story (St. John's Church, Patrick Henry, the entire East End).",
    housingStock:
      "Federal and Italianate rowhouses, 1920s-era frame houses, and pockets of new infill construction. Renovation status varies dramatically block to block; a home that backs to a renovated street can sit next to one that has not been touched in decades.",
    buyingReality:
      "Church Hill rewards buyers who can read a block. Two houses a hundred feet apart can sit at very different price points based on which streets have turned and which have not. The upside is real for buyers willing to do that homework, because the historic core keeps gaining as the East End fills in. Get a contractor's eye on any home that looks untouched, because original does not always mean sound.",
    sellingReality:
      "The buyer here is paying for history, river views, and a true neighborhood story, so lead with what makes the specific home and block special. Renovated historic homes near St. John's and Libby Hill see the strongest demand. Price honestly to the block's reality, because Church Hill buyers do their research and will not overpay for a good address attached to deferred maintenance.",
    lifestyle:
      "You get Richmond's oldest streets, Libby Hill's skyline view, and an East End food scene that punches well above its size. The James River and Great Shiplock Park are a short walk or ride away. It is a real neighborhood with a strong identity, not a polished district. People who choose Church Hill want roots and story, not turnkey sameness.",
    fitChecklist: [
      "You want historic character and a true Richmond neighborhood feel without paying Fan prices.",
      "You're comfortable evaluating block-by-block differences during the search.",
      "You value access to the East End restaurant scene and James River park access.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Church Hill?",
        answer:
          "Church Hill prices vary widely by block, ranging from the low $300Ks for unrenovated rowhouses up to the mid $600Ks and above for fully renovated historic homes. Verify with current MLS data before making decisions.",
      },
      {
        question: "How does Church Hill differ from the broader East End?",
        answer:
          "Church Hill is the historic core surrounding St. John's Church and Libby Hill. The 'East End' is the broader area east of the city core that includes Church Hill, Union Hill, and several adjacent neighborhoods. They share some overlap in housing stock but pricing, walkability, and renovation status vary block by block.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Church Hill is where you buy Richmond's actual history without Fan-level prices, and that is a genuine opportunity. But it is the neighborhood where block-by-block judgment matters most, and a buyer going it alone can overpay or underestimate a renovation. This is the one where having someone who knows the streets earns its keep.",
    reviewedDate: TODAY,
    geo: { latitude: 37.5305, longitude: -77.4192 },
  },

  {
    slug: "museum-district",
    name: "Museum District",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "The quieter, residential side of Richmond's urban core, anchored by the Virginia Museum of Fine Arts, a short walk from The Fan and Carytown.",
    housingStock:
      "Brick rowhouses, larger single-family historic homes, and a strong inventory of two-and-three-story 1920s houses on tree-lined streets. Slightly more single-family detached options than The Fan, but with the same general urban historic character.",
    buyingReality:
      "Demand is steady and inventory is lean, so well-kept single-family homes near the VMFA do not last long. You are competing with buyers who want Fan-level walkability on a quieter street, which keeps pressure on the best houses. Be pre-approved and decisive. The value play is a solid home on a calmer block rather than the most renovated listing on the busiest corner.",
    sellingReality:
      "Your buyer wants the urban-historic feel without the constant nightlife, so sell the calm as much as the location. Proximity to the VMFA, Carytown, and Byrd Park is a real draw worth featuring. Renovated single-family homes set the pace on price. Stage to the home's period character and price to the specific block, because this buyer compares against The Fan and knows the difference.",
    lifestyle:
      "You wake up next to the VMFA, walk to Carytown, and reach Byrd Park in minutes, all without the volume of The Fan's main drags. The streets are tree-lined and residential, the pace is calmer, and the culture is right outside your door. It is the quieter side of the same urban coin. People here want walkability and breathing room at the same time.",
    fitChecklist: [
      "You want walkable urban living without the constant nightlife volume of The Fan.",
      "You value access to the VMFA, Carytown, and Byrd Park.",
      "You're comfortable with on-street parking and historic-home maintenance.",
    ],
    faqs: [
      {
        question: "What's the typical price range in the Museum District?",
        answer:
          "Museum District homes typically run from the high $500Ks to the high $700Ks for renovated historic single-family houses, with a smaller pool of condos available below that. Pricing varies by block, condition, and proximity to the VMFA. Verify with current MLS data before making decisions.",
      },
      {
        question: "Museum District vs. The Fan, which is right for me?",
        answer:
          "If you want maximum walkability, restaurant density, and active street life, The Fan is denser and louder. If you want a slightly quieter residential feel with the same historic character and easy access to Carytown and the VMFA, the Museum District is the calmer side of the same coin. Talk through your priorities with a Richmond agent before you commit.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "The Museum District is what a lot of people actually want when they say they want The Fan. Same architecture, same walkability, less noise, and often a little more house for the money. If you value a calm street over being in the middle of the action, this is frequently the smarter buy.",
    reviewedDate: TODAY,
    geo: { latitude: 37.5564, longitude: -77.473 },
  },

  {
    slug: "scotts-addition",
    name: "Scott's Addition",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Richmond's brewery and food district, a former industrial corridor that now leads the city in new construction, breweries, and walkable destinations.",
    housingStock:
      "Mostly new and recently-built condos, lofts, and townhouses in converted warehouses and ground-up infill construction. Very few traditional single-family detached homes inside the boundary.",
    buyingReality:
      "Most of what you will tour is condo and townhouse product, much of it new or recently built, so read the HOA and the building before you read the unit. Warranty, fees, and reserves matter as much as finishes here. Demand stays high because people want to live where the breweries and restaurants are. Know the difference between a well-run building and a flashy one.",
    sellingReality:
      "You are selling lifestyle and low maintenance to a buyer who wants to walk to food and drink. Lead with proximity, finishes, and the building's amenities and HOA health. Pricing is competitive because new inventory keeps coming, so condition, parking, and a clean HOA story are what separate your unit from the next one. Turnkey wins in Scott's Addition.",
    lifestyle:
      "You live inside Richmond's brewery and food district, where most of what you want is a walk away. It is energetic, social, and built for people who go out. The trade is that you give up yards and historic character for convenience and newness. People who pick Scott's Addition want the city's most active corner as their backyard.",
    fitChecklist: [
      "You want a low-maintenance condo or townhouse close to the breweries and restaurants you'll actually visit.",
      "You don't need a yard or extensive outdoor space.",
      "You value walkability to food, drink, and entertainment over historic architecture.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Scott's Addition?",
        answer:
          "Scott's Addition condos and townhouses typically run in the high $300Ks to low $600Ks depending on size, finish level, and building. New construction and recently-renovated lofts trade at the higher end. Verify with current MLS data before making decisions.",
      },
      {
        question: "Is Scott's Addition a good fit for first-time buyers?",
        answer:
          "It can be, particularly for buyers who want a turnkey condo or townhouse and value walkability over square footage. HOA fees and the trade-off between new construction warranty and historic character are worth thinking through with a Richmond agent.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Scott's Addition is the easiest neighborhood to fall for on a Saturday night and the one where you most need to look past the vibe. The building and the HOA matter more than the finishes, because that is what you actually own long term. Buy the well-run building, not just the cool unit.",
    reviewedDate: TODAY,
    geo: { latitude: 37.5634, longitude: -77.469 },
  },

  {
    slug: "northside",
    name: "Northside",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Tree-lined streets, single-family homes, and front porches, the residential neighborhoods north of the city, including Bellevue, Ginter Park, and Laburnum Park.",
    housingStock:
      "Predominantly single-family detached homes from the 1920s through 1950s, bungalows, foursquares, Cape Cods, and Tudor revivals on real lots with yards. New construction is rare; renovation activity is steady.",
    buyingReality:
      "Northside is single-family territory, so you are buying a house with a yard inside city limits, which is rarer than people think. The best pockets, Bellevue and Ginter Park, draw steady competition for well-kept homes. New construction is rare, so most buys are 1920s-to-1950s homes that need a real inspection. The reward is space and character at a more accessible entry than the Fan-area neighborhoods.",
    sellingReality:
      "Your buyer wants a porch, a yard, and tree canopy inside the city, so sell the lot and the street as much as the house. Bellevue and Ginter Park carry their own pricing power and should be marketed by name, not lumped into a generic Northside. Condition and curb appeal drive offers. Price to the specific pocket, because the range across Northside is wide.",
    lifestyle:
      "You get front porches, mature trees, and a quieter residential rhythm a few minutes from the city core. Bellevue's small commercial strip and neighborhood feel anchor daily life, with restaurants and nightlife a short drive away. It trades walk-to-everything density for space and calm. People choose Northside when they want a real house and yard without leaving the city.",
    fitChecklist: [
      "You want a single-family home with a yard inside city limits.",
      "You value tree canopy, front porches, and a quieter residential feel.",
      "You're willing to drive a few minutes for restaurants and nightlife rather than walking.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Northside?",
        answer:
          "Northside homes vary widely by neighborhood within the area, Bellevue and Ginter Park typically trade higher than Laburnum Park. Most single-family homes fall in the mid $300Ks to mid $600Ks depending on block, condition, and renovation status. Verify with current MLS data before making decisions.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Northside is where you get an actual single-family home with a yard and still keep a city address, and that combination is underrated. The catch is that it is a collection of distinct pockets, not one neighborhood, and the price gap between them is real. Buy the right pocket for your life, not just the right house.",
    reviewedDate: TODAY,
    geo: { latitude: 37.591, longitude: -77.46 },
  },

  {
    slug: "manchester",
    name: "Manchester",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "South of the river, Richmond's most active urban transformation corridor, with converted warehouse lofts, new construction, and direct James River access.",
    housingStock:
      "A mix of converted industrial loft buildings, newer condos and townhouses, and pockets of older single-family homes. Inventory leans heavily toward attached and multi-family product.",
    buyingReality:
      "Most inventory is lofts, condos, and newer attached product, so you are buying into buildings and development as much as a single unit. The neighborhood is still evolving, which means upside but also blocks that are mid-transformation. Read the building, the HOA, and what is planned nearby before you commit. Buyers who are comfortable with active change tend to do well here.",
    sellingReality:
      "Your buyer wants walkable, modern living south of the river with skyline and James River access, so lead with views, walkability, and newness. Pricing is competitive because new product keeps arriving. A clean HOA, parking, and a strong view command attention. Sell the trajectory of the neighborhood alongside the unit, because Manchester buyers are betting on where it is going.",
    lifestyle:
      "You live across the river from downtown with skyline views, river access, and a fast-growing slate of restaurants and breweries. It is walkable and rideable, with the T. Tyler Potterfield bridge linking you to the rest of the river. The neighborhood is still filling in, so it rewards people who like being early. People who pick Manchester want the city's most active transformation as their address.",
    fitChecklist: [
      "You want walkable urban living south of the river with views back toward the city.",
      "You're comfortable in a still-evolving neighborhood with active development.",
      "You value James River access and rideability over a traditional neighborhood feel.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Manchester?",
        answer:
          "Manchester pricing ranges widely from the low $300Ks for older condos to the high $500Ks and above for new construction and renovated lofts. Verify with current MLS data before making decisions.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Manchester is the clearest bet on Richmond's direction, and that is exactly why you buy carefully. The views and the new product are real, but you are buying a neighborhood in motion, so the building and what is planned next door matter. Get the trajectory right and the upside is real.",
    reviewedDate: TODAY,
    geo: { latitude: 37.529, longitude: -77.443 },
  },

  {
    slug: "forest-hill",
    name: "Forest Hill",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Southside Richmond's residential anchor, single-family homes, Forest Hill Park, and direct James River trail access without leaving the city.",
    housingStock:
      "Single-family detached homes from the 1920s through 1970s, bungalows, ranches, and Cape Cods on real lots, with a smaller pool of newer infill construction.",
    buyingReality:
      "Forest Hill is single-family Southside with real lots, and well-kept homes near the park move quickly. You are mostly looking at 1920s-to-1970s houses, so inspections matter and updated systems are worth paying for. The value here is space, yard, and park access at a more reachable price than the Fan-area neighborhoods. Be ready when the right house near the park comes up.",
    sellingReality:
      "Your buyer wants a yard, a quieter street, and Forest Hill Park or the river trails nearby, so sell the location and the lot. Proximity to the park is a genuine premium worth featuring. Condition and updates drive offers on these older homes. Price to the block and the home's actual condition, because Forest Hill buyers compare carefully across Southside.",
    lifestyle:
      "You get Forest Hill Park, the James River trails, and a quiet residential neighborhood all inside city limits. Weekends are built around the park, the river, and the small commercial nodes nearby. It trades urban density for space and access to nature. People choose Forest Hill when they want the outdoors at their door without leaving the city.",
    fitChecklist: [
      "You want city limits with the feel of a quieter residential neighborhood.",
      "You value access to Forest Hill Park and the James River trails.",
      "You want a single-family home with a yard at a more accessible price point than Fan-area neighborhoods.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Forest Hill?",
        answer:
          "Forest Hill homes typically run in the mid $300Ks to high $500Ks depending on block, condition, and renovation status. Verify with current MLS data before making decisions.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Forest Hill is one of the best values in the city for a buyer who wants a yard and the river without a suburban commute. The park access alone carries the neighborhood. The homes are older, so spend on the inspection and reward the houses with updated systems. Done right, this is a lot of life for the money.",
    reviewedDate: TODAY,
    geo: { latitude: 37.529, longitude: -77.483 },
  },

  {
    slug: "bellevue",
    name: "Bellevue",
    county: "Richmond City",
    parent: "Richmond, Virginia",
    oneLineFit:
      "Northside Richmond's tightest residential pocket, tree-lined streets, well-kept early-1900s single-family homes, and a strong neighborhood identity.",
    housingStock:
      "Single-family detached homes from the 1920s through 1940s, primarily Tudor revivals, foursquares, bungalows, and Cape Cods on real lots with tree canopy. Renovations are common; new construction is rare.",
    buyingReality:
      "Bellevue runs lean on inventory, so when a well-kept historic home comes up it draws real competition. You are buying 1920s-to-1940s single-family homes with character and tree canopy, which means inspections matter. The neighborhood's tight identity and small commercial strip keep demand steady. Be pre-approved and ready, because the best homes here do not wait.",
    sellingReality:
      "Your buyer is paying for character, canopy, and a strong neighborhood identity, so sell the street and the community as much as the house. Lean inventory works in your favor, but condition and original detail still decide the number. Price to Bellevue's own pocket within Northside, not to a broad city average, because this buyer knows exactly what the neighborhood is worth.",
    lifestyle:
      "You get one of Northside's tightest, most walkable residential pockets, with a small commercial strip on MacArthur Avenue and serious tree canopy overhead. It is a real neighborhood where people know their streets. The trade is driving for nightlife and bigger restaurant scenes. People choose Bellevue for community and character over density.",
    fitChecklist: [
      "You want a historic-character single-family home in city limits with a real yard.",
      "You value tree canopy, walkable cross-streets, and a tight neighborhood feel.",
      "You're willing to drive for restaurants and nightlife rather than walking.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Bellevue?",
        answer:
          "Bellevue homes typically run in the high $400Ks to high $600Ks depending on block, condition, and renovation level. Pricing has tightened as inventory has stayed lean. Verify with current MLS data before making decisions.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Bellevue is small, tight, and quietly one of the most desirable pockets in the city, which is why inventory is thin and good homes go fast. If you want it, be ready to move when one comes up. This is a neighborhood you buy on conviction, not on endless browsing.",
    reviewedDate: TODAY,
    geo: { latitude: 37.601, longitude: -77.468 },
  },

  {
    slug: "bon-air",
    name: "Bon Air",
    county: "Chesterfield County",
    parent: "Greater Richmond, Virginia",
    oneLineFit:
      "Established suburban Chesterfield, mature trees, larger lots, single-family homes, and easy access back to the city.",
    housingStock:
      "Mostly single-family detached homes from the 1950s through 1980s, ranches, split-levels, colonials, and contemporaries on suburban lots. Some newer infill, but the character is established suburban.",
    buyingReality:
      "Bon Air is established suburban Chesterfield, so you are buying larger lots, mature trees, and 1950s-to-1980s homes a short drive from the city. Inventory is steadier than the city neighborhoods, which gives you more room to be selective. Condition and updates vary widely across this era of homes, so a real inspection pays off. The value is space and a shorter commute than the outer suburbs.",
    sellingReality:
      "Your buyer wants suburban space with an easy path back to the city, so sell the lot, the trees, and the commute. Updated kitchens and systems move the needle on these mid-century homes. Pricing is more stable than the city, but condition still decides where you land in the range. Stage to the home's strengths and price to the comps in your specific part of Bon Air.",
    lifestyle:
      "You get mature trees, larger lots, and a quiet established-suburban feel with a commute back to the city that beats the outer suburbs. Daily life means driving for groceries, restaurants, and entertainment, which is the trade for the space. It is settled and calm rather than walkable. People choose Bon Air for room to breathe without going far out.",
    fitChecklist: [
      "You want suburban Chesterfield with a shorter commute than Midlothian or Brandermill.",
      "You value larger lots and mature tree canopy.",
      "You're comfortable driving for groceries, restaurants, and entertainment.",
    ],
    faqs: [
      {
        question: "What's the typical price range in Bon Air?",
        answer:
          "Bon Air homes typically run in the high $300Ks to mid $600Ks depending on size, lot, condition, and renovation status. Verify with current MLS data before making decisions.",
      },
      STANDARD_SCHOOLS_FAQ,
    ],
    milesTake:
      "Bon Air is the move when you want real suburban space but refuse to add thirty minutes to your commute. You give up walkability, which is the honest trade. If your life runs on a car anyway and you want lot size and trees close to the city, Bon Air is a sensible, underrated pick.",
    reviewedDate: TODAY,
    geo: { latitude: 37.515, longitude: -77.566 },
  },
];

export function getNeighborhood(slug: string): NeighborhoodContent | undefined {
  return neighborhoods.find((n) => n.slug === slug);
}

export const neighborhoodSlugs: string[] = neighborhoods.map((n) => n.slug);
