// Long-form guide content for /guides/{slug}.
//
// These three slugs sat in sitemap.ts for months against a directory that did not
// exist, so every answer engine that followed them got a 404. The rule now is the
// reverse: the route ships first, the sitemap entry follows in the same commit.
//
// Standard for every line in this file: a real number, a named place, a named
// program, or a specific tradeoff. No "hidden gem", no "world-class", no "vibrant".
// Never characterize school quality or neighborhood safety. Point at Niche,
// GreatSchools, or the district and let the source say it.

export interface GuideFAQ {
  question: string;
  answer: string;
}

export interface GuideStep {
  name: string;
  text: string;
}

export interface GuideSection {
  eyebrow: string;
  title: string;
  body: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  headline: string;
  standfirst: string;
  eyebrow: string;
  description: string;
  keywords: string[];
  reviewedDate: string;
  sections: GuideSection[];
  steps?: { name: string; intro: string; items: GuideStep[] };
  faqs: GuideFAQ[];
  ctaHeading: string;
  ctaBody: string;
  primaryCta: { href: string; label: string };
}

const REVIEWED = "2026-09-06";

// Locality real estate tax rates, dollars per $100 of assessed value, carried from
// the quiz scoring dataset (src/app/quiz/neighborhoods.ts). Localities reset these
// annually, so every surface that renders them also renders the verify line.
export const TAX_RATES: { locality: string; rate: string }[] = [
  { locality: "Richmond City", rate: "1.20" },
  { locality: "Chesterfield County", rate: "0.89" },
  { locality: "Henrico County", rate: "0.83" },
  { locality: "Hanover County", rate: "0.81" },
  { locality: "Powhatan County", rate: "0.78" },
  { locality: "New Kent County", rate: "0.72" },
  { locality: "Goochland County", rate: "0.53" },
];

export const guides: Guide[] = [
  {
    slug: "richmond-relocation",
    title: "The Richmond Relocation Guide",
    metaTitle:
      "Moving to Richmond VA: The Relocation Guide | Zones, Taxes, and Tradeoffs",
    eyebrow: "Greater Richmond · Relocation",
    headline: "Moving to Richmond without touring blind.",
    standfirst:
      "Eighteen zones, seven localities, and seven different tax rates. Most relocation content skips all of that and shows you a photo of the Fan. This is the version that tells you what each part of the metro costs and what it asks you to give up.",
    description:
      "A working relocation guide to Greater Richmond, Virginia. How the metro is actually laid out, what the seven locality tax rates do to your monthly payment, which zone fits which life, and the mistakes out-of-state buyers make on their first tour trip.",
    keywords: [
      "moving to Richmond VA",
      "relocating to Richmond Virginia",
      "Richmond VA relocation guide",
      "where to live in Richmond VA",
      "Richmond VA cost of living",
      "Richmond VA property tax rates",
      "Henrico vs Chesterfield vs Hanover",
      "best areas to live near Richmond VA",
    ],
    reviewedDate: REVIEWED,
    sections: [
      {
        eyebrow: "Start Here",
        title: "Richmond is seven localities, not one city",
        body: [
          "People say Richmond and mean the metro. The metro is the independent City of Richmond plus Henrico, Chesterfield, Hanover, Goochland, Powhatan, and New Kent counties, and in Virginia an independent city is not part of any county. That is not trivia. It sets your tax rate, your school district, your trash pickup, and your car tax, and it changes on the far side of a street.",
          "The practical version: two homes you like at the same price can carry meaningfully different monthly costs, and the difference is a line on the assessment, not the listing.",
        ],
      },
      {
        eyebrow: "The Number Nobody Shows You",
        title: "What the locality does to your payment",
        body: [
          "Real estate tax is charged per $100 of assessed value. Richmond City is the highest rate in the metro and Goochland is the lowest, and the spread between them is more than double.",
          "Run it on a $450,000 assessment. Richmond City is roughly $5,400 a year. Henrico is roughly $3,735. That gap is about $139 a month before you have compared a single kitchen.",
          "None of that makes the city wrong. It buys you a walk score the counties cannot match. It means the comparison you were making was never apples to apples.",
        ],
        bullets: [
          "Localities reset these rates annually. Confirm the current year with the locality assessor before you rely on any of them.",
          "Assessed value and sale price are different numbers. A recent sale often triggers a reassessment.",
          "Virginia also charges a personal property tax on vehicles, and that rate is set by locality too.",
        ],
      },
      {
        eyebrow: "How To Read The Metro",
        title: "Four bands, working outward",
        body: [
          "Urban core: the Fan, Museum District, Church Hill, Scott's Addition, Jackson Ward, Manchester. Walkable, older housing stock, city tax rate, street parking.",
          "Near suburbs: Lakeside, Bon Air, Tuckahoe, the Northside edge. Yards and county tax rates while staying inside a fifteen minute drive of downtown.",
          "Outer suburbs: Short Pump, Glen Allen, Midlothian, Mechanicsville. Newer construction, county services, commutes that start at twenty minutes and go up.",
          "Land: Goochland, Powhatan, New Kent, western Hanover. Acreage and the lowest rates in the metro, paid for in drive time and in fewer places to eat on a Tuesday.",
        ],
      },
      {
        eyebrow: "The Tour Trip",
        title: "What out-of-state buyers get wrong",
        body: [
          "Almost every relocating buyer books one weekend, tours nine houses, and picks a house instead of picking a place. Six months later the house is fine and the commute is not.",
          "Reverse it. Spend the first day driving zones with no showings on the calendar. Park in Lakeside and walk to Roy's Big Burger. Sit in Sub Rosa in Church Hill on a Saturday morning. Drive Broad Street west at 5:30pm and feel what Short Pump traffic actually is. Then spend day two touring inside the two zones that survived.",
          "The listings will still be there. The read on the neighborhood is the part you cannot get from a phone.",
        ],
      },
      {
        eyebrow: "Schools",
        title: "How to check schools without taking anyone's word for it",
        body: [
          "Public school assignment in Greater Richmond changes by address and by grade level, and it changes when the district redraws boundaries. An agent telling you a neighborhood has good schools is giving you an opinion that is not theirs to give.",
          "Pull the data yourself. Niche and GreatSchools publish ratings and parent reviews. The Virginia Department of Education publishes SOL pass rates by school. Then confirm the actual assigned school for the exact address through the district, because a zoning map from last year can be wrong this year.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the property tax rate in Richmond, Virginia?",
        answer:
          "The City of Richmond levies real estate tax at $1.20 per $100 of assessed value, the highest rate in the metro. Surrounding counties are lower: Chesterfield $0.89, Henrico $0.83, Hanover $0.81, Powhatan $0.78, New Kent $0.72, and Goochland $0.53. Localities reset these rates annually, so confirm the current year rate with the locality assessor before relying on it.",
      },
      {
        question: "Is Richmond, Virginia part of a county?",
        answer:
          "No. Richmond is an independent city, which in Virginia means it is not part of any county. That is why a home inside the city line and a home a block outside it can sit in different school districts, pay different tax rates, and receive different services.",
      },
      {
        question: "How long is the commute from Short Pump to downtown Richmond?",
        answer:
          "Roughly 25 minutes in normal conditions on I-64 or Broad Street, and longer during afternoon peak. Glen Allen runs about 20 minutes, Midlothian about 20, Mechanicsville about 20, and the urban core neighborhoods are 5 to 10. These are representative zone averages rather than address-level drive times.",
      },
      {
        question: "Which part of Greater Richmond is most affordable?",
        answer:
          "On price per home, the outer counties. New Kent and Charles City carry the lowest median range in the metro along with a $0.72 tax rate, and Powhatan and Goochland trade acreage at rates well under the city. The cost shows up as drive time and fewer amenities within ten minutes. Inside the city, the Northside and Southside zones carry the lowest entry points.",
      },
      {
        question: "Do I need to visit Richmond before buying?",
        answer:
          "You do not legally need to, and plenty of relocating buyers close on video tours. What is worth protecting is the zone decision rather than the house decision. If you can only make one trip, spend the first day driving neighborhoods without showings booked and the second day touring inside whichever two zones survived that drive.",
      },
      {
        question: "How do I check which schools serve a Richmond address?",
        answer:
          "Look up ratings and parent reviews on Niche (https://www.niche.com/) and GreatSchools (https://www.greatschools.org/), pull SOL pass rates from the Virginia Department of Education, then confirm the assigned school for the exact address with the school district directly. Assignment changes by address and grade level and districts redraw boundaries.",
      },
    ],
    ctaHeading: "Want the long version, in print?",
    ctaBody:
      "The full Richmond Relocation Guide runs 75 pages: every zone, the school-checking workflow, the moving timeline, and the neighborhood callouts that did not fit here. It is free and it comes to your inbox.",
    primaryCta: { href: "/#guide", label: "Get the Full Guide" },
  },

  {
    slug: "first-time-buyers-richmond-va",
    title: "Buying Your First Home in Richmond",
    metaTitle:
      "First-Time Home Buyer Guide, Richmond VA | The Process, Step by Step",
    eyebrow: "Richmond VA · First-Time Buyers",
    headline: "Your first Richmond house, start to keys.",
    standfirst:
      "Nobody hands you the order of operations. Here it is: what happens when, what it costs at each step, where Virginia does it differently, and the four places first-time buyers in this market actually lose money.",
    description:
      "A step-by-step guide to buying your first home in Richmond, Virginia. Pre-approval, the Virginia purchase contract, earnest money, inspection and appraisal, closing costs, Virginia Housing programs, and the mistakes that cost first-time buyers the most.",
    keywords: [
      "first time home buyer Richmond VA",
      "buying a house in Richmond Virginia",
      "Richmond VA home buying process",
      "Virginia Housing first time buyer",
      "closing costs Richmond VA",
      "earnest money Virginia",
      "home inspection Richmond VA",
      "down payment assistance Virginia",
    ],
    reviewedDate: REVIEWED,
    sections: [
      {
        eyebrow: "Before You Look",
        title: "Pre-approval is not pre-qualification",
        body: [
          "A pre-qualification is a lender's opinion after you told them your numbers. A pre-approval is a lender's decision after they pulled your credit and looked at documents. In a market where a good listing can draw several offers, a listing agent reads one of those as a real buyer and the other as a maybe.",
          "Get the pre-approval before the first showing, not after you fall for a house. The two weeks you spend on it are two weeks you are not competing.",
        ],
      },
      {
        eyebrow: "The Money",
        title: "What you actually need in cash",
        body: [
          "Down payment is the number everyone talks about. It is not the only one, and for most first-time buyers it is not the one that breaks the deal.",
        ],
        bullets: [
          "Earnest money deposit, delivered days after ratification, typically about one percent of the purchase price. It is credited to you at closing, and it is genuinely at risk if you walk outside your contingencies.",
          "Home inspection, paid out of pocket at the time of inspection, generally in the several hundred dollar range depending on square footage and add-ons like radon or sewer scope.",
          "Appraisal, ordered by the lender and usually paid up front.",
          "Closing costs, which in Virginia include lender fees, title insurance, recordation, and prepaid taxes and insurance. Ask your lender for a Loan Estimate early, because that document is standardized and comparable across lenders.",
        ],
      },
      {
        eyebrow: "Virginia Specifics",
        title: "Three things that work differently here",
        body: [
          "Virginia is an attorney-optional, title-company-normal closing state, and most Richmond closings settle at a title company rather than a lawyer's office.",
          "Virginia is a caveat emptor state on residential resale. The seller is not obligated to volunteer defects the way sellers in some states are. That puts real weight on your inspection and on what you negotiate after it.",
          "Virginia Housing runs first-time buyer loan programs and down payment assistance, and the eligibility rules and assistance amounts change. Check the current terms directly at virginiahousing.com rather than trusting a number in an article, including this one.",
        ],
      },
      {
        eyebrow: "The Offer",
        title: "Price is one of six terms",
        body: [
          "First-time buyers argue about price and then lose to an offer that was not higher. What moves a seller is usually the whole shape of the deal: the closing date against their next move, the size of the earnest money, whether financing is conventional or government-backed, how long the inspection window runs, and whether there is an appraisal gap.",
          "An appraisal gap clause says you will cover some amount of the difference if the home appraises below contract. It is a real risk and it is real cash. Understand the number before you sign it, not while your agent is on the phone with the listing side.",
        ],
      },
      {
        eyebrow: "Where It Goes Wrong",
        title: "The four expensive mistakes",
        body: [],
        bullets: [
          "Buying the house instead of the block. Finishes are replaceable. The street is permanent, and in Richmond the difference between two blocks a hundred feet apart is real.",
          "Skipping or rushing the inspection to win. In a caveat emptor state that is the most expensive way to save money.",
          "Opening a credit line between ratification and closing. New debt can move your debt-to-income ratio and kill an approval days before settlement.",
          "Ignoring the locality. Richmond City at $1.20 per $100 assessed versus Henrico at $0.83 is about $139 a month on a $450,000 assessment. That is payment capacity you could have spent on the house.",
        ],
      },
    ],
    steps: {
      name: "How to buy your first home in Richmond, Virginia",
      intro:
        "The order matters more than the speed. Each step gates the next one, and doing them out of sequence is what creates the scramble.",
      items: [
        {
          name: "Get pre-approved",
          text: "Pick a lender, submit documents, and get a written pre-approval with a credit pull behind it. Ask for a Loan Estimate so you can compare lenders on standardized numbers.",
        },
        {
          name: "Pick the zone before the house",
          text: "Decide which part of the metro fits your commute, your budget, and your tax tolerance. Drive it at the hour you would actually be driving it.",
        },
        {
          name: "Tour with a buyer agent",
          text: "Sign a buyer representation agreement and understand how your agent is compensated. Since 2024, buyer agent compensation is negotiated in writing up front rather than assumed from the listing.",
        },
        {
          name: "Write the offer",
          text: "Negotiate price alongside closing date, earnest money, financing type, inspection window, and any appraisal gap. Know your walk-away number before you submit.",
        },
        {
          name: "Ratify and deliver earnest money",
          text: "Once both sides sign, deliver the earnest money deposit within the contract deadline. Missing that deadline is a default.",
        },
        {
          name: "Inspect and negotiate repairs",
          text: "Order the general inspection immediately and add radon or sewer scope where the age and location warrant it. Negotiate inside the contingency window, not after it closes.",
        },
        {
          name: "Clear the appraisal and underwriting",
          text: "The lender orders the appraisal. Answer underwriting requests same day, and open no new credit lines until after settlement.",
        },
        {
          name: "Final walkthrough and settlement",
          text: "Walk the home shortly before closing to confirm condition and agreed repairs, then settle at the title company. Bring a government ID and wired funds arranged directly with the settlement agent by phone.",
        },
      ],
    },
    faqs: [
      {
        question: "How much do I need for a down payment in Richmond, VA?",
        answer:
          "It depends entirely on the loan. Conventional loans can go as low as three percent for qualified first-time buyers, FHA is 3.5 percent, and VA and USDA loans can require nothing down for eligible borrowers. Virginia Housing also runs first-time buyer programs with down payment assistance. Terms change, so confirm current eligibility at virginiahousing.com and with your lender rather than relying on a published figure.",
      },
      {
        question: "How much is earnest money in Virginia?",
        answer:
          "It is negotiated, not fixed, and around one percent of the purchase price is common in the Richmond market. It is credited back to you at closing. It is genuinely at risk if you terminate outside your contract contingencies, which is why the inspection and financing windows matter.",
      },
      {
        question: "Does Virginia require an attorney at closing?",
        answer:
          "No. Virginia permits closings to be conducted by licensed settlement agents, and most Richmond area residential closings settle at a title company. You can retain an attorney if you want one.",
      },
      {
        question: "Is Virginia a caveat emptor state?",
        answer:
          "Yes for residential resale. Sellers are generally not obligated to disclose known defects the way sellers in disclosure states are, and Virginia uses a residential property disclosure statement that puts the duty of inquiry on the buyer. Practically, that raises the stakes on your home inspection.",
      },
      {
        question: "How long does it take to buy a house in Richmond?",
        answer:
          "From ratified contract to closing, 30 to 45 days is typical for a financed purchase, and cash can close faster. The part that varies most is the search itself, which can run anywhere from one weekend to many months depending on price point and how specific your requirements are.",
      },
      {
        question: "Who pays the buyer's agent in Virginia?",
        answer:
          "It is negotiated. Since the 2024 changes to how agent compensation is handled, buyers sign a written buyer representation agreement stating what their agent is paid, and whether the seller contributes toward that is a term of the deal rather than an assumption. Commissions are not set by law and are always negotiable.",
      },
    ],
    ctaHeading: "First house, and you want the map first?",
    ctaBody:
      "Take the seven-question zone quiz to narrow eighteen zones to three, or text Miles and walk through your specific numbers before you talk to a lender.",
    primaryCta: { href: "/quiz", label: "Take the Quiz" },
  },

  {
    slug: "selling-in-richmond-va",
    title: "Selling a Home in Richmond",
    metaTitle:
      "Selling a House in Richmond VA | Pricing, Prep, and the Coming Soon Play",
    eyebrow: "Richmond VA · Sellers",
    headline: "Selling in Richmond, priced to the block.",
    standfirst:
      "The neighborhood average is not your price. Here is how Richmond listings actually get priced, what prep is worth paying for, and the Coming Soon sequence that let two of our listings build a waiting list before a single interior photo went up.",
    description:
      "How to sell a house in Richmond, Virginia. Block-level pricing rather than neighborhood averages, which prep spends return, the Coming Soon floor plan sequence, how to read an offer past the price, and what a seller net sheet actually includes.",
    keywords: [
      "selling a house in Richmond VA",
      "how to sell my home Richmond Virginia",
      "Richmond VA home selling process",
      "Richmond VA listing agent",
      "seller closing costs Virginia",
      "home pricing strategy Richmond",
      "coming soon listing strategy",
      "should I sell my house in Richmond",
    ],
    reviewedDate: REVIEWED,
    sections: [
      {
        eyebrow: "Pricing",
        title: "Price to the block, not the neighborhood",
        body: [
          "Richmond punishes neighborhood-average pricing more than most metros because the housing stock changes street by street. A corner on Hanover in the Fan does not trade like a mid-block on Stuart. Two houses a hundred feet apart in Church Hill can carry very different numbers depending on which streets have turned.",
          "A pricing analysis that pulls comps from a three-mile radius and calls it a market read is describing a zip code. Ask for the comps on your street and the two streets that feed it, and ask which ones were adjusted and why.",
        ],
      },
      {
        eyebrow: "Prep",
        title: "What is worth spending on, in order",
        body: [
          "Most sellers over-invest in the wrong end. The order that actually returns, roughly:",
        ],
        bullets: [
          "Anything a buyer's inspector will find anyway. You are paying for it either way, and you pay less when it is not being negotiated under a deadline.",
          "Paint. It is the cheapest square-foot-for-square-foot change in the building.",
          "Light. Bulbs to a consistent temperature, blinds up, every fixture working. Photos and showings both live on it.",
          "Decluttering and depersonalizing, which costs time rather than money.",
          "Then, and only then, discretionary upgrades. A new kitchen rarely returns its cost inside a sale window, and in historic Richmond stock a flip-style gut can actively cost you with the buyer paying for the original detail.",
        ],
      },
      {
        eyebrow: "The Play",
        title: "Coming Soon, one floor plan, nothing else",
        body: [
          "This one came from watching two buyers do the same thing independently. Both asked for a floor plan before they would engage at all. Both of those listings closed.",
          "So the sequence changed. The Coming Soon goes live with one or two hero shots, front and back, plus a CubiCasa floor plan. No interior gallery. Buyers who need to understand the layout get exactly what they asked for, and buyers who want the reveal have a reason to wait for it.",
          "Then you watch the saves-to-views ratio from the moment it posts. Saves are the number that tells you whether demand is stacking before you go active. Views tell you the marketing worked. Saves tell you somebody is planning around your house.",
        ],
      },
      {
        eyebrow: "Offers",
        title: "The highest number is not the best offer",
        body: [
          "Read past price to the terms that decide whether the deal actually closes: financing type and the strength of the pre-approval behind it, the size of the earnest money deposit, the length of the inspection window and how it is written, whether there is an appraisal gap and how much, and the closing date against your own next move.",
          "An offer twelve thousand higher with a shaky approval and a wide-open inspection contingency can easily be worth less than the clean one under it. The question is not what they offered. It is what survives to settlement.",
        ],
      },
      {
        eyebrow: "The Net",
        title: "What comes out before you get paid",
        body: [
          "Ask for a seller net sheet before the listing goes live, not after an offer arrives. It should show your mortgage payoff, brokerage compensation as negotiated, Virginia grantor tax and recordation, settlement fees, prorated real estate taxes for the locality, any agreed seller credits, and repairs negotiated after inspection.",
          "Commissions are negotiable and are not set by law or by any association. Anyone who tells you a rate is standard is telling you their rate.",
        ],
      },
    ],
    steps: {
      name: "How to sell a house in Richmond, Virginia",
      intro:
        "Sequence beats speed. Doing the prep after the photos, or pricing before the comps, is what creates a price reduction in week three.",
      items: [
        {
          name: "Get a block-level pricing analysis",
          text: "Pull comps from your street and the streets that feed it, with adjustments explained. Reject a three-mile-radius average as a pricing basis.",
        },
        {
          name: "Run the pre-inspection triage",
          text: "Handle what an inspector will find anyway, then paint and light, then declutter. Skip discretionary renovation unless the analysis says it moves the price.",
        },
        {
          name: "Shoot the hero images and order the floor plan",
          text: "Two exterior hero shots, front and back, plus a CubiCasa floor plan. Hold the interior gallery.",
        },
        {
          name: "Go Coming Soon and watch saves",
          text: "Publish the Coming Soon with the floor plan only, then track the saves-to-views ratio daily to read demand before you go active.",
        },
        {
          name: "Go active with the full gallery",
          text: "Release interiors, open the showing calendar, and let the buyers who have been waiting on the reveal move first.",
        },
        {
          name: "Evaluate offers on terms, not price",
          text: "Compare financing strength, earnest money, inspection window, appraisal gap, and closing date alongside the number. Counter on terms where the price is close.",
        },
        {
          name: "Manage inspection and appraisal",
          text: "Respond inside the contract windows. Where an appraisal comes in low, the gap clause you negotiated decides who covers it.",
        },
        {
          name: "Close",
          text: "Confirm the final net sheet against the settlement statement before the table, and settle at the title company.",
        },
      ],
    },
    faqs: [
      {
        question: "What are seller closing costs in Virginia?",
        answer:
          "Typically the mortgage payoff, brokerage compensation as negotiated, Virginia grantor tax and recordation fees, settlement and title fees, prorated locality real estate taxes, plus any seller credits or post-inspection repairs agreed in the contract. Ask for a seller net sheet before you list rather than after an offer arrives, and confirm figures with your settlement agent.",
      },
      {
        question: "What commission does a listing agent charge in Richmond?",
        answer:
          "There is no standard rate. Commissions are negotiable and are not set by law or by any association or board. What matters more than the headline number is what the compensation actually buys in marketing, pricing work, and negotiation, and whether the seller contributes anything toward buyer agent compensation, which is now a separately negotiated term.",
      },
      {
        question: "Should I list my Richmond home as Coming Soon?",
        answer:
          "It works well when you have something specific to release later. The version we run posts one or two exterior hero shots plus a CubiCasa floor plan and holds the interior gallery, because two separate buyers independently asked for a floor plan before they would engage, and both of those listings closed. The signal to watch during Coming Soon is the saves-to-views ratio, which reads demand before you go active.",
      },
      {
        question: "Do I need to fix everything before listing in Richmond?",
        answer:
          "No, but the things a buyer's inspector will find anyway are worth handling first, because you pay for them either way and you pay less outside a negotiation deadline. After that the returns are in paint, lighting, and decluttering. Discretionary renovation rarely returns its cost inside a single sale window, and in historic Richmond stock a gut renovation can cost you with buyers who came for the original detail.",
      },
      {
        question: "How long does it take to sell a house in Richmond, VA?",
        answer:
          "Days on market varies significantly by price point, condition, and block. Rather than trusting a metro-wide average, ask for days on market on the comps from your own street and the streets feeding it, since that is the pool your buyer is actually shopping. From ratified contract to closing, 30 to 45 days is typical for a financed buyer.",
      },
      {
        question: "Is the highest offer always the best offer?",
        answer:
          "No. Financing strength, earnest money size, inspection window length, appraisal gap coverage, and closing date all affect whether an offer survives to settlement. A higher number attached to a weak approval and an open-ended inspection contingency is frequently worth less than a lower clean offer.",
      },
    ],
    ctaHeading: "Want the read on your specific block?",
    ctaBody:
      "Send the address and Miles will pull the comps from your street and the streets that feed it, with the adjustments shown. No listing presentation attached.",
    primaryCta: { href: "/connect", label: "Send Your Address" },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export const guideSlugs: string[] = guides.map((g) => g.slug);
