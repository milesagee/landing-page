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
    closeDate: "2026-05-29",
    headline: "We're past inspection. Appraisal Thursday. Five days to close.",
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
        label: "Inspection complete + addendum ratified",
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
        // Source: iMessage from Miles to Walker 5/21 22:26: "HOA sent
        // Wednesday so EOD Saturday is when contingency falls off."
        // Wednesday was 5/20. Saturday EOD = 5/24 (today). The contingency
        // falls off today at end of day.
        label: "HOA docs delivered + contingency clock running",
        date: "Saturday, May 24",
        detail:
          "HOA disclosure docs went to the buyer last Wednesday. Their HOA contingency window closes at end of day today.",
        status: "done",
      },
    ],
    runway: [
      {
        label: "Thursday: Appraisal",
        detail:
          "Appraiser walks the home, comps the market, writes the report. We need it to land at or above the $188,500 contract price for the buyer's financing to close clean.",
      },
      {
        label: "Friday: Final clear to close",
        detail:
          "Buyer's lender issues clear-to-close after the appraisal report and final underwriter sign-off. Title finalizes the settlement statement.",
      },
      {
        label: "May 29: Closing day",
        detail:
          "Sign at Rocket Title, wire confirmation goes out, deed records. We will be in touch with timing and what you need to bring.",
      },
    ],
    checkIn: {
      label: "Anything on your mind ahead of Thursday's appraisal you want me to address before we get there?",
      placeholder:
        "Could be a question about the appraisal itself, the closing timeline, the wire process, anything. The dashboard pings me directly when you send.",
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
