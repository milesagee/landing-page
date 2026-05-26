/**
 * Walker Griffea / 817 Pleasant St deal-status dashboard.
 *
 * Seller-side update ahead of Thursday's appraisal and Friday's close. Every
 * fact is sourced inline against a verified signal - Gmail thread, iMessage
 * with Walker, or SkySlope closing notification - per the zero-accuracy-lapses
 * rule (feedback_offer_dashboard_zero_accuracy_lapses).
 *
 * Walker has SMS+Email DND active in MAMS GHL ("opted out" tag) - GHL
 * Conversations cannot fire to him. Cover delivery has to go iMessage from
 * Miles's personal phone, not through GHL. Backend writeback (notes + tags +
 * miles@mamsnow.com email) is unaffected.
 */

export type DealMilestone = {
  label: string;
  date: string; // ISO or human-readable
  detail: string;
  status: "done" | "scheduled" | "pending";
};

export type RunwayStep = {
  label: string;
  detail: string;
};

export type StatusData = {
  contactId: string;
  shareToken: string;
  firstName: string;
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  contractPrice: number;
  closeDate: string; // ISO yyyy-mm-dd
  // One-line state of the deal, rendered prominently at the top
  headline: string;
  // What got cleared - timeline of executed work
  cleared: DealMilestone[];
  // What's next - runway to close
  runway: RunwayStep[];
  // Interactive single-question textarea
  checkIn: {
    label: string;
    placeholder?: string;
  };
};

export const CONTACTS: Record<string, StatusData> = {
  // Walker Griffea. GHL contactId fetched via MAMS Open Dispo search 2026-05-24.
  // Surname spelled "Griffea" canonically (confirmed via GHL contact record +
  // Gmail "817 Pleasant St Sales Contract / Seller: Griffea, 5/9").
  "96dBQrFQGdGzMb601Iq5": {
    contactId: "96dBQrFQGdGzMb601Iq5",
    shareToken: "Y2D0WgQlKq8k",
    firstName: "Walker",
    property: {
      // Source: SkySlope "Transaction Closing Notification" 5/24, plus
      // multiple Gmail threads. Note Henrico, NOT Richmond.
      address: "817 Pleasant Street",
      city: "Henrico",
      state: "VA",
      zip: "23075",
    },
    // Source: "817 Pleasant St Time Line" email from office@mamsnow.com to
    // Walker dated 2026-05-18. Final contract price $188,500 (offer $177,500,
    // counter $192,000, settled at $188,500 signed 5/8).
    contractPrice: 188500,
    // Source: SkySlope notification 5/24 ("scheduled to close on 05/29/2026").
    // Original contract date was 5/30 (Saturday). Buyer's side working toward
    // 5/29; Wendy <-> Ovell thread 5/26 confirms 5/29 target.
    closeDate: "2026-05-29",
    headline:
      "WDI inspection Thursday, notary Friday in DC. One open thread: the buyer's appraisal timing.",
    cleared: [
      {
        // Source: Gmail "817 Pleasant St Sales Contract / Seller: Griffea, 5/9"
        // and "Contract for 817 Pleasant St, 5/8" - executed 5/8.
        label: "Contract executed",
        date: "May 8",
        detail: "$188,500 final price after counter from $177,500 offer.",
        status: "done",
      },
      {
        // Source: iMessage thread with Walker 5/19-5/22 negotiating inspection
        // addendum + Gmail "817 Pleasant St Ratified Addendum, 5/22".
        label: "Inspection + addendum ratified",
        date: "May 22",
        detail:
          "Buyer accepted your counter of $3,000 additional closing-cost credit and no further repairs. Walked away from the open repair list cleanly.",
        status: "done",
      },
      {
        // Source: Gmail "Re: 817 Pleasant St Ratified CC Addendum, 5/22"
        // from Kathia Rodriguez at Rocket Title confirming receipt.
        label: "Closing-cost addendum at title",
        date: "May 22",
        detail: "Rocket Title received both the inspection and CC addendums same day.",
        status: "done",
      },
      {
        // Source: iMessage from Miles to Walker 5/21 22:26 + that window
        // (EOD Saturday 5/24) has now passed without contingency action.
        label: "HOA contingency cleared",
        date: "May 24",
        detail:
          "HOA disclosure docs went to the buyer Wednesday 5/20. The contingency window closed clean on Saturday.",
        status: "done",
      },
      {
        // Source: Gmail "817 Pleasant St Wiring Instructions, 5/26" from
        // office@mamsnow.com.
        label: "Your wiring instructions sent",
        date: "May 26",
        detail:
          "Wendy delivered the seller wire-instruction packet today. Your proceeds will route to the account you specified once the deed records.",
        status: "done",
      },
    ],
    runway: [
      {
        // Source: Gmail calendar invite "817 Pleasant St WDI Inspection-Pest
        // Now/ Time: TBD @ Thu May 28, 2026 9am (EDT)" sent 5/26 15:01 UTC.
        label: "Thursday 9 AM: WDI inspection",
        detail:
          "Pest Now does the wood-destroying-insect inspection - a standard Virginia closing requirement (termite check). Quick walkthrough, no action needed on your end.",
      },
      {
        // Source: Gmail thread "817 Pleasant St Closing Date Addendum-
        // Please Reply, 5/28" - Ovell Robinson (buyer's agent) replied 5/26
        // 9:51 ET: "We are working to close on 5/29 however the appraisal
        // may not be back in time. I will check with the lender." Wendy
        // 9:58: "I'll await your update."
        label: "Open thread: buyer's appraisal timing",
        detail:
          "Buyer's agent flagged this morning that the appraisal may run tight on Friday's close. They are checking with the lender on the actual return date. If it pushes, we adjust the notary appointment and reset the close date together. Either way, you do not lift a finger - we handle it on our end.",
      },
      {
        // Source: Gmail calendar invite "817 Pleasant St Seller Mobile
        // Notary Appointment-Rocket Title Confirmed @ Fri May 29, 2026 12pm
        // - 1pm (EDT)" sent 5/26 15:03 UTC. Location 626 Burns St SE DC 20019.
        label: "Friday 12 PM: Mobile notary at you",
        detail:
          "Rocket Title's mobile notary comes to you at 626 Burns St SE, Washington DC 20019. You sign there - no trip to Richmond required. Plan on 30 to 60 minutes.",
      },
      {
        label: "Friday afternoon: Wire + deed records",
        detail:
          "Once the notary package is back at title and the buyer's clear-to-close is in hand, your wire goes out and the deed records. You will see the wire confirmation the same day or first thing the following business day.",
      },
    ],
    checkIn: {
      label: "Anything you want me to address ahead of Friday - the appraisal timing, the notary appointment, the wire, anything else?",
      placeholder:
        "Goes straight to me. I'll have an answer ready before we sign Friday.",
    },
  },
};

export function getStatusByToken(
  contactId: string,
  token: string,
): StatusData | null {
  const d = CONTACTS[contactId];
  if (!d) return null;
  if (d.shareToken !== token) return null;
  return d;
}
