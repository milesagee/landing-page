/**
 * Asihene buyer-reflection portal data.
 *
 * Backward-looking three-card surface for Sharon (Asihene/Richardson in GHL):
 *   1. Cheverton  - the home that fit, that we missed. Lock in the blend.
 *   2. Sodbury    - still alive on MLS. What changed for her.
 *   3. Ghana      - how we tighten the loop while she is overseas.
 *
 * Every property fact + Sharon-quote in this file is cited inline against a
 * verified source: the MLS Matrix PDF in Miles's Downloads ("Sharon Richardson
 * Notes Properperties.pdf", read 2026-05-24) or her iMessage thread with Miles
 * (decoded from attributedBody same day). Per the zero-accuracy-lapses rule
 * (feedback_offer_dashboard_zero_accuracy_lapses), no assumption goes in
 * without a source comment.
 */

export type ReflectionCard = {
  id: "synthesis" | "active-listings" | "cheverton" | "sodbury" | "ghana";
  // Card chrome
  label: string;           // small uppercase label above the headline
  headline: string;        // serif headline
  // Anchor (Sharon's own verbatim line, italicized in the page)
  anchorQuote?: string;    // optional - only when we have a verified verbatim quote
  anchorAttribution?: string; // e.g. "Sharon, May 8" - source comment in code, attribution shown on page
  // Property facts block (single property, only for the Cheverton/Sodbury reflection cards)
  factBlock?: {
    address: string;
    neighborhood: string;
    listPrice: string;
    specs: string;
    status: string;
  };
  // Multi-property listing array (only for the active-listings card).
  // Rendered as a stack of mini-rows between the frame and the questions.
  listings?: ActiveListing[];
  // Frame paragraph (~50-60 words, second person, Sharon-facing)
  frame: string;
  // Interactive section
  questions: {
    id: string;
    label: string;
    placeholder?: string;
  }[];
  // Submit CTA label
  submitLabel: string;
};

// Active CVR MLS listing surfaced on the reflection portal.
// Every field except mlsUrl is required; every field must be CVR MLS direct
// (cvrmls.mlsmatrix.com) per the zero-accuracy-lapses rule.
export type ActiveListing = {
  address: string;
  neighborhood: string;
  mlsNumber: string;
  price: string;
  specs: string;             // e.g. "5BR / 5 full BA / 5,682 sq ft / 2012 build"
  garage: string;            // e.g. "3-car attached"
  style: string;             // CVR MLS verbatim style
  daysOnMarket: string;      // e.g. "16 days" or "DOM not exposed on CVR detail"
  why: string;               // one-sentence why-this-matches
  friction: string;          // one-sentence honest friction read
  isStretch?: boolean;       // true if above the $1.6M preapproval ceiling
};

export type ReflectionData = {
  contactId: string;
  shareToken: string;
  firstName: string;
  husbandFirstName: string; // for natural references ("Yaw" inside the page)
  cards: ReflectionCard[];
};

export const CONTACTS: Record<string, ReflectionData> = {
  // Sharon Richardson (canonical GHL name; MLS portal shows "William & Sharon Asihene").
  // GHL contactId fetched via MAMS Open Dispo search 2026-05-24.
  EA8FnvZCEQVCnHcYrVTs: {
    contactId: "EA8FnvZCEQVCnHcYrVTs",
    shareToken: "Hycfi_UXiLVF",
    firstName: "Sharon",
    // Husband's name. Per MLS PDF notes (3 separate appearances of "Yaw" -
    // 03/30 "Yaw is interested in viewing", 05/04 "Yaw 1 million dollar
    // question", 05/02 "Hubby likes it") + Sharon's iMessage 05/15 09:46
    // ("Yaw says not better than Sodbury") + 05/08 08:54 ("Yaw is still
    // liking Sodbury"). Miles refers to him as "Dr. Yao" verbally; Sharon
    // writes "Yaw" in every text. Going with Yaw to match how she says it.
    husbandFirstName: "Yaw",
    cards: [
      {
        // Synthesis card added 2026-05-31 after PC deep-read returned
        // (shared/completed/2026-05-31-0441-sharon-richardson-favorites-deep-read.md).
        // OPENS the door without giving away PC's punch line. The
        // "home that holds everyone / suite-for-everyone" reveal is reserved
        // for the next call eye-to-eye. The frame names "the pattern is sharper"
        // and asks one open question that primes the suite hypothesis without
        // stating it. Anchor quote is Sharon's own analytical-mode line on
        // 3707 Merrington (05/18/2026 iMessage / MLS notes export).
        id: "synthesis",
        label: "What I have been seeing",
        headline: "I have been reading your full list with one question in mind.",
        // Source: Sharon iMessage / MLS Matrix note on 3707 Merrington VIEW,
        // 2026-05-18 (per "Sharon Richardson Notes Properperties.pdf").
        anchorQuote:
          "This house checks a lot of boxes: cost, space, newer construction, location.",
        anchorAttribution: "Sharon, May 18 on 3707 Merrington",
        // 50-60 words. Second person. No em dashes, no emojis. Holds the reveal.
        frame:
          "Since you have been in Ghana I have been re-reading all 55 favorites, the noted ones and the ones you only hearted. There is a thread running through every home you and Yaw lit up on. It is sharper than I had it the last time we talked. One question before our next call, in your words.",
        questions: [
          {
            id: "thread",
            label:
              "When a home grabs both of you on the first walk through, what is the thing it is doing that the others miss? I want it in your words.",
            placeholder:
              "Not what you think I want to hear. What you actually feel when it clicks...",
          },
        ],
        submitLabel: "Send me your read",
      },
      {
        // Active-listings card added 2026-05-31 after PC verification follow-up
        // (shared/completed/2026-05-31-0542-sharon-active-listings-verify.md).
        // All 5 specs verified against cvrmls.mlsmatrix.com direct at ~6:00-6:15
        // AM EDT 2026-05-31, NOT realtor.com. Three of PC's first-brief Colonial
        // labels were wrong; corrected here from CVR MLS verbatim.
        // Lead with the two homes that hit suite + 3-car garage (Lynchell + Kimbolton).
        // Third card is Thistledew (5 full baths, Craftsman, 2-car friction).
        // Stretch card is Maple Hall (above ceiling, flagged explicitly).
        // Dropped from headline per PC's recommendation: Elmslie (only 4 baths)
        // and Braehead (only 3 baths despite new construction + 4-car + acreage).
        id: "active-listings",
        label: "Active and worth your eye",
        headline: "The market read I owe you ahead of our call.",
        frame:
          "Nothing on the open market today carries the full Cheverton blend. Two homes hit the suite count and the garage cleanly. One hits the suite and Craftsman feel but lands short on the garage. The stretch band has one near-miss above your ceiling. Tell me which you want me to send Kojo to walk first.",
        listings: [
          {
            // Source: CVR MLS Matrix detail for ML 2608275, pulled 2026-05-31 ~6:00 AM EDT.
            address: "401 Lynchell Pl",
            neighborhood: "Riverlake Colony, Henrico",
            mlsNumber: "2608275",
            price: "$1,475,000",
            specs: "5 BR / 5 full + 1 half BA / 5,682 sq ft / 2012 build / 0.45 ac",
            garage: "3-car attached",
            // PC first brief had this as "Colonial" - CVR MLS direct says
            // "Green Certified Home, Transitional". Style match improved.
            style: "Green Certified Home, Transitional",
            daysOnMarket: "16 days",
            why: "Hits the suite count and the 3-car garage cleanly, the closest functional twin to Cheverton on the open market today. Tuckahoe-side Henrico, which lines up with your Kingsdown note.",
            friction: "Built 2012, just under your 2014+ lean. Not the Hallsley belt, so Yaw may want the room-by-room story before the elevation.",
          },
          {
            // Source: CVR MLS Matrix detail for ML 2607447, pulled 2026-05-31 ~6:00 AM EDT.
            address: "11712 Kimbolton Pl",
            neighborhood: "Glen Allen",
            mlsNumber: "2607447",
            price: "$1,200,000",
            specs: "5 BR / 5 full + 1 half BA / 5,044 sq ft / 2007 build / 0.55 ac",
            garage: "3-car attached, side/rear load",
            // PC first brief had this as "Colonial" - CVR MLS direct says
            // "2-Story, Transitional". Style match improved.
            style: "2-Story, Transitional",
            daysOnMarket: "55 days",
            why: "Second of only two homes in the active set that pairs 5 full baths with a 3-car garage. Value side of your range, in greater RVA, Transitional.",
            friction: "2007 build, and 55 days on market suggests price has room to move, which works in your favor.",
          },
          {
            // Source: CVR MLS Matrix detail for ML 2609891, pulled 2026-05-31 ~6:00 AM EDT.
            address: "6306 Thistledew Mews",
            neighborhood: "Foxcreek, Moseley",
            mlsNumber: "2609891",
            price: "$1,190,000",
            specs: "5 BR / 5 full + 1 half BA / 6,569 sq ft / 2006 build / 0.72 ac",
            garage: "2-car attached",
            // PC first brief had this as "Colonial" - CVR MLS direct says
            // "Craftsman, Custom, Tri-Level/Quad Level". Style match strong.
            style: "Craftsman, Custom, Tri-Level/Quad Level",
            daysOnMarket: "47 days",
            why: "Best price-per-suite in the active set. Craftsman feel, 6,569 sq ft, and Foxcreek is the same belt as the Burnt Mills home you already favorited.",
            friction: "2-car garage is the real gap given how consistent 3+ car is across your favorites.",
          },
          {
            // Source: CVR MLS Matrix stretch-zone query 2026-05-31. The closest
            // active home to Cheverton DNA in the $1.6-2.1M band. Miss only on
            // style label ("Custom, Farm House" not Craftsman/Transitional).
            address: "16219 Maple Hall Dr",
            neighborhood: "Chesterfield (stretch zone)",
            mlsNumber: "2612573",
            price: "$1,725,000",
            specs: "6 BR / 5 full BA / 5,777 sq ft / 2021 build",
            garage: "3-car attached",
            style: "Custom, Farm House",
            daysOnMarket: "DOM not surfaced",
            why: "The closest the open market gets to a stretch-zone Cheverton today. 2021 build, 5 full baths, 3-car, in the suite-and-infrastructure zone.",
            friction: "$1.725M is above your $1.6M preapproval ceiling. Style reads Farm House, not Craftsman. Hold as exploratory unless you want to test the stretch.",
            isStretch: true,
          },
        ],
        questions: [
          {
            id: "kojo",
            label:
              "Which one do you want me to send Kojo to walk first, and which can stay on the list for now?",
            placeholder:
              "Lynchell first? Kimbolton? Skip the stretch? Tell me where to point him...",
          },
        ],
        submitLabel: "Send Kojo the call",
      },
      {
        id: "cheverton",
        label: "The one that fit",
        headline: "Cheverton was the rare blend - and we missed it.",
        // Sharon's verbatim line, iMessage 2026-05-08 21:02:31 IN.
        anchorQuote:
          "Why haven't Cheverton closed if it was cash ???? Do I smell a rat??",
        anchorAttribution: "Sharon, May 8",
        factBlock: {
          // Source: MLS Matrix PDF, listing #9, MLS 2607155. Close terms
          // pulled from CVR MLS Sold Information panel 2026-05-31 (Miles
          // direct lookup): Sold 05/14/2026 at $1,600,000 cash. Buyer
          // Lauren Garber / Providence Hill Real Estate. PC's first deep
          // read had this as "Closed off-market" - that was wrong. The
          // close was on-MLS at her ceiling for cash.
          address: "16506 Cheverton Court",
          neighborhood: "Hallsley",
          listPrice: "Listed $1,500,000 / Closed $1,600,000 cash",
          specs: "5 BR / 6.1 BA / 5,454 sq ft / 2019 build",
          status: "Closed 05/14/2026 cash",
        },
        // Frame updated 2026-05-31 with verified close data. The close
        // teaches the market: a Cheverton-grade home clears at her ceiling
        // in cash. That sets the bar for what readiness looks like next time
        // a comparable home lists. Honors her 5/8 frustration with hard data
        // (the cash buyers DID close) without re-litigating the loss.
        frame:
          "Cheverton was the home that worked for both of you. Newer construction Yaw could grow into, layout that broke the pattern of your current home, Hallsley quality. It closed at $1.6M cash on 5/14, at your ceiling, with decisive terms. That tells us the bar for the next one. It will clear at the top of your range and reward whoever moves first. Lock in what made Cheverton the right blend so the next one is recognizable on the first walk through.",
        questions: [
          {
            id: "blend",
            label: "What about Cheverton felt different from a repeat of your current home?",
            placeholder: "The thing that pulled you in...",
          },
          {
            id: "yaw",
            label: "What about Cheverton was the older-bigger-feeling home Yaw is after?",
            placeholder: "What he reacted to...",
          },
          {
            id: "trigger",
            label: "If a similar home hits the MLS tomorrow, what's the single trigger that says move within 24 hours?",
            placeholder: "The line that flips you from watching to writing...",
          },
        ],
        submitLabel: "Lock in my Cheverton read",
      },
      {
        id: "sodbury",
        label: "Still on the board",
        headline: "Sodbury - Yaw still wants it. The question is whether you do.",
        // Sharon's verbatim line, iMessage 2026-05-15 09:46:56 IN.
        // The full thread: 5/08 IN "Yaw is still liking Sodbury", then
        // 5/15 IN "No. Yaw says not better than Sodbury" (her response
        // to Miles asking if Founders Bridge was better). That's the
        // cleanest "Yaw is anchored, Sharon is the question" line.
        anchorQuote: "Yaw says not better than Sodbury.",
        anchorAttribution: "Sharon, May 15",
        factBlock: {
          // Source: MLS Matrix PDF, listing #16, MLS 2607185.
          address: "3100 Sodbury Court",
          neighborhood: "Tarrington",
          listPrice: "$1,495,000",
          specs: "7 BR / 6.3 BA / 8,254 sq ft / 2008 build / 3-car attached",
          status: "Active on MLS",
        },
        frame:
          "Sodbury is still on the board. Yaw is anchored to it. You were set to write before Ghana and didn't. No pressure here. This isn't where we make the decision. I just want to know honestly what changed for you, so we can either revive the path on our call tomorrow or close the door cleanly. Either move is a clean move.",
        questions: [
          {
            id: "pull",
            label: "What pulled you toward Sodbury in early April?",
            placeholder: "What was the version of the home you were buying...",
          },
          {
            id: "shift",
            label: "What's different now? What changed between April and Ghana?",
            placeholder: "The honest answer - the dashboard does not judge it...",
          },
          {
            id: "yaw-tilt",
            label: "If Yaw could push you off the fence one way or the other, what would he need to say?",
            placeholder: "The thing he could name that would settle it...",
          },
        ],
        submitLabel: "Send my Sodbury read",
      },
      {
        id: "ghana",
        label: "From Ghana",
        headline: "How we tighten the loop while you're overseas.",
        // No anchor quote on this card - the principle stands on its own.
        frame:
          "I don't write on properties you haven't been inside. That's the rule, not the apology. Two homes Kojo was set to walk this month went pending before tour day, and that's the market right now in your range and your neighborhoods. What I want us to do here is build a faster lane for the next one, on terms that still respect the rule. Pick the lane that fits how you and Yaw want to operate from Ghana.",
        questions: [
          {
            id: "lane",
            label: "Which lane fits you and Yaw best? (Pick one or write your own.)",
            placeholder:
              "1. Kojo's virtual walkthrough plus a same-day call with me is enough to greenlight an offer.\n2. Draft a pre-authorized offer envelope (price ceiling + terms) so I can move within hours when something fits.\n3. Same-day in-person walk only - flag homes, hold them in my queue until you are back stateside.\n4. Tighten Kojo's tour cadence - give him standing authority to walk anything that crosses your must-see threshold.\n5. Other - tell me how you want to operate from Ghana.",
          },
          {
            id: "yaw-ghana",
            label: "Anything else you want me to know about how to read this market for the two of you over the next 30 days?",
            placeholder: "Anything Yaw is feeling, anything you want me watching for...",
          },
        ],
        submitLabel: "Set our Ghana-window protocol",
      },
    ],
  },
};

export function getReflectionByToken(
  contactId: string,
  token: string,
): ReflectionData | null {
  const d = CONTACTS[contactId];
  if (!d) return null;
  if (d.shareToken !== token) return null;
  return d;
}
