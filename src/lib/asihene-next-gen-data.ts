/**
 * Asihene next-gen family-input portal data.
 *
 * Parallel surface to the reflection portal (asihene-reflection-data.ts).
 * Built FOR Stephen Asihene (MAMS GHL `JO1r0OVbQ84YXYnHP07Y`, past client,
 * commission $11,622.51 in GHL, closed April 2025) + his wife Tanisha
 * Bigirumwami (no own GHL contact; linked spouse field on Stephen's record).
 *
 * Strategic intent: include the next-gen unit (the kids who already went
 * through MAMS) as named voices in Sharon + Yaw's current $1.6M-ceiling
 * search. They were at Cheverton. Stephen walks properties on the ground
 * when Sharon is in Ghana. Including them fired-up converts Sharon + Yaw
 * at the $1.5M+ mark from "is this the right move" to "the whole family
 * is moving together."
 *
 * Token-gated at /family/<contactId>?t=<shareToken>. Submits write a GHL
 * note + card-specific tag to Stephen's contact and email Miles a mirror.
 *
 * Voice: warm-peer (NOT concierge-distant). They earned this voice. No
 * em dashes, no emojis, no corporate filler. Stephen signs as "Stephen"
 * in email, "Steven"/"bro" in iMessage. Tanisha is emoji-forward in her
 * own voice ("Yes love this miles, thank you!!"). We match warmth without
 * matching her emojis (brand chrome stays clean).
 */

import {
  SHARON_ACTIVE_LISTINGS,
  type ActiveListing,
} from "@/lib/asihene-reflection-data";

export type FamilyCardId =
  | "next-gen-opener"
  | "cheverton-onground"
  | "active-list-walk"
  | "honest-feedback";

export type FamilyCard = {
  id: FamilyCardId;
  // Card chrome
  label: string;
  headline: string;
  // Optional anchor block (verbatim quote with attribution, italicized in the page)
  anchorQuote?: string;
  anchorAttribution?: string;
  // Optional property facts block (used on the Cheverton retrospect card)
  factBlock?: {
    address: string;
    neighborhood: string;
    listPrice: string;
    specs: string;
    status: string;
  };
  // Optional active-listings array (used on the walk-priority card)
  listings?: ActiveListing[];
  // Frame paragraph (~50-65 words, second person, addressed to BOTH Stephen and Tanisha)
  frame: string;
  // Interactive questions
  questions: {
    id: string;
    label: string;
    placeholder?: string;
  }[];
  // Submit CTA label
  submitLabel: string;
};

export type FamilyData = {
  contactId: string;
  shareToken: string;
  // Primary recipient (anchor of the GHL writes). Stephen.
  primary: { firstName: string };
  // Co-recipient (named throughout the surface; no GHL contact of her own at v1).
  partner: { firstName: string };
  // Surname their parents go by. Used in copy.
  parentsLastName: string;
  // First name of Sharon's husband (used in card text). Yaw, not William.
  parentsHusbandFirstName: string;
  cards: FamilyCard[];
};

export const CONTACTS: Record<string, FamilyData> = {
  // Stephen Asihene + Tanisha Bigirumwami. Built 2026-05-31 after Miles
  // confirmed the family stack (Tanisha is Stephen's wife, NOT Sharon's
  // daughter). Stephen IS Kojo (same person; the on-ground walker for
  // Sharon + Yaw while they are in Ghana).
  JO1r0OVbQ84YXYnHP07Y: {
    contactId: "JO1r0OVbQ84YXYnHP07Y",
    shareToken: "OXXfmP5_Y535",
    primary: { firstName: "Stephen" },
    partner: { firstName: "Tanisha" },
    parentsLastName: "Asihene",
    parentsHusbandFirstName: "Yaw",
    cards: [
      {
        // Opens the surface. Frames their role as MAMS alums who earned the
        // voice (not as kids being looped in). Names both. One question on
        // what their parents actually need but have not said out loud.
        id: "next-gen-opener",
        label: "Asihene next-gen",
        headline: "Stephen and Tanisha, you have already done this once.",
        // 50-65 words. Warm-peer. No em dashes, no emojis.
        frame:
          "You both went through this with me a year ago, so you know what good looks like. Mom and Yaw are now where you were, except they are in Ghana and you are the family eyes on the ground. Stephen walks the rooms, Tanisha reads the layout, both of you carry what you saw at Cheverton. I want your voice in the next call.",
        questions: [
          {
            id: "unspoken",
            label:
              "Before we get into the homes, what do you both think Mom and Yaw are actually looking for that they have not said out loud?",
            placeholder:
              "The thing only you two would know about how they live, host, and decide...",
          },
        ],
        submitLabel: "Send your read",
      },
      {
        // Cheverton retrospect. Stephen + Tanisha were there. They saw Sharon
        // and Yaw react in real time. The factBlock carries the verified close
        // data (independent verification 2026-05-31, NOT the off-market read
        // from PC's first brief). Two questions because the retrospect is rich.
        id: "cheverton-onground",
        label: "What you saw at Cheverton",
        headline: "You walked it with them. You saw it land for them.",
        factBlock: {
          // Source: CVR MLS Sold Information panel, direct lookup 2026-05-31.
          // Same data as Sharon's reflection portal Cheverton card.
          address: "16506 Cheverton Court",
          neighborhood: "Hallsley",
          listPrice: "Listed $1,500,000 / Closed $1,600,000 cash",
          specs: "5 BR / 6.1 BA / 5,454 sq ft / 2019 build",
          status: "Closed 05/14/2026 cash",
        },
        // 50-65 words. Honors that they were physically in the rooms.
        frame:
          "Cheverton closed at 1.6M cash on 5/14, at the top of your parents' ceiling, decisive terms. You were in the rooms with them when they fell for it. You saw what they reacted to in real time, the thing they will not put in words on a call from Ghana. That is the read I cannot get from anyone else.",
        questions: [
          {
            id: "reactions",
            label:
              "What did you see Mom and Yaw react to when you walked Cheverton with them?",
            placeholder:
              "A specific room, a moment, a thing one of them said to the other...",
          },
          {
            id: "flag-next-time",
            label:
              "What is the thing you would want me to know next time you walk one for them?",
            placeholder:
              "The detail you wish I had asked about before, the question you would want me to surface...",
          },
        ],
        submitLabel: "Send the Cheverton read",
      },
      {
        // Active listings — same 4 as Sharon's dashboard, imported from
        // SHARON_ACTIVE_LISTINGS so there is one source of truth. Framed
        // for the next-gen on-ground vantage. Stephen sets walk order,
        // Tanisha reads the family-fit.
        id: "active-list-walk",
        label: "Active and on the table",
        headline: "Three under their ceiling. One stretch. You walk them.",
        listings: SHARON_ACTIVE_LISTINGS,
        // 50-65 words.
        frame:
          "These are the homes worth your eyes right now. Three sit under their ceiling, one is a stretch above it. The exact Cheverton is not on the market today, so the play is your on-ground read on which of these gets close enough to matter. Stephen, you set the walk order. Tanisha, you call the family fit.",
        questions: [
          {
            id: "walk-priority",
            label:
              "Which one do you walk first, and what is the read you want me to bring into the call with your parents?",
            placeholder:
              "Lynchell first? Kimbolton? Skip the stretch? Tell me where to point you and what I should ask Mom and Yaw...",
          },
        ],
        submitLabel: "Send the walk priority",
      },
      {
        // Honest-feedback channel. The dashboard's whole point is partnership,
        // not pressure. This card invites them to push back on Miles + MAMS
        // explicitly. Real channel, not theater.
        id: "honest-feedback",
        label: "What we owe them",
        headline: "The thing we are not saying clearly enough yet.",
        // 50-65 words.
        frame:
          "You have seen us work two deals now, one of them yours. You know where we are sharp and where we could push harder. Mom and Yaw are at the part of the search where the difference between good and great is a 1.5 plus million dollar difference. If we are missing something, this is where to say it.",
        questions: [
          {
            id: "push",
            label:
              "If you were sitting in our chair, what would you push us to do better for Mom and Yaw?",
            placeholder:
              "What we miss, what we soften too much, what you would do differently...",
          },
        ],
        submitLabel: "Send the push",
      },
    ],
  },
};

export function getNextGenByToken(
  contactId: string,
  token: string,
): FamilyData | null {
  const d = CONTACTS[contactId];
  if (!d) return null;
  if (d.shareToken !== token) return null;
  return d;
}
