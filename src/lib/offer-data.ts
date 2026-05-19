/**
 * offer-data.ts
 *
 * Multi-offer data for the seller-facing offer dashboard at /offer/[contactId].
 *
 * Hard rules (per offer-breakdown-dashboard SKILL.md):
 *  - Every numeric field must carry an inline source comment naming the
 *    contract paragraph or system of record it was pulled from.
 *  - Buyer broker comp comes from Paragraph 5 of THIS offer's CVR 335.
 *  - Listing broker comp comes from the executed listing agreement (CVR 345).
 *  - Acceptance deadlines come from Paragraph 27.
 *  - Closing fees come from the active MAMS Seller Net Sheet template.
 *  - No invented numbers. If unknown, leave empty + surface the gap.
 */

export type OfferRecord = {
  offerId: string;
  buyerLastName: string;
  receivedAt: string;
  basePrice: number;
  escalationStep: number;
  escalationCap: number;
  earnestMoney: number;
  earnestMoneyHolder: string;
  sellerConcessionsCredit: number;
  buyerBrokerCompPct: number;
  settlementDate: string;
  settlementAgent: string;
  possession: string;
  offerExpiresAt: string | null;
  offerExpiresLabel?: string;
  inspectionDays: number;
  inspectionFineprint?: string;
  appraisalContingency: boolean;
  financingContingency: boolean;
  financingType: string;
  preApprovalLender: string;
  preApprovalInstitution: string;
  preApprovalDate: string;
  preApprovalNote?: string;
  personalPropertyIncluded: string[];
  asIsItems: string[];
  buyer: {
    name: string;
    occupancy: "owner-occupant" | "investor";
    agentName: string;
    agentBrokerage: string;
    agentEmail: string;
  };
  status: "leading" | "new" | "ghost";
  statusNote?: string;
};

export type OfferContactData = {
  contactId: string;
  shareToken: string;
  sellerFirstName: string;
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    taxParcel: string;
  };
  // Listing-side commission applies to whichever offer ratifies.
  // Source: MAMS listing agreement (CVR 345) executed 2026-05-09.
  listingBrokerCompPct: number;
  closingFees: {
    closingAttorney: number;
    transactionFee: number;
    releaseFeeIfLoan: number;
    termiteInspection: number;
  };
  // Tuesday 6 PM ET formal offer review window.
  // Source: Miles's outbound to Ronnie Burnett 2026-05-18 08:47 ET
  // ("formal offer review is set for Tuesday at 6 PM"). Extension granted
  // verbally to give the seller a clean window to compare offers in hand.
  masterDeadline: string;
  offers: OfferRecord[];
  // Which offer the seller-greenlight button on the dashboard targets.
  // Tonight = Donnell, the new (lower) offer that needs a "do better" push.
  greenlightOfferId: string;
  milesNote: {
    headline: string;
    body: string[];
  };
};

export const CONTACTS: Record<string, OfferContactData> = {
  IiCKMQNv2xHGLCqOBrYA: {
    contactId: "IiCKMQNv2xHGLCqOBrYA",
    shareToken: "oVJeZvqlARvv",
    sellerFirstName: "Natalie",
    property: {
      address: "2401 Warwick Avenue",
      city: "Richmond",
      state: "VA",
      zip: "23224",
      taxParcel: "S007-1628-020",
    },
    listingBrokerCompPct: 3,
    closingFees: {
      closingAttorney: 499,
      transactionFee: 399,
      releaseFeeIfLoan: 125,
      termiteInspection: 80,
    },
    masterDeadline: "2026-05-19T18:00:00",
    greenlightOfferId: "donnell",
    offers: [
      {
        offerId: "laura",
        buyerLastName: "Fullmer",
        receivedAt: "2026-05-17",
        // Source: Laura CVR 335 (Authentisign ID 159587CD), Paragraph 4
        // "Three Hundred Twenty Thousand Dollars ($320,000.00)".
        // Ronnie's verification email said "325k" verbally; the executed
        // contract says $320,000. PDF wins.
        basePrice: 320000,
        // Source: Escalation Addendum checkbox in Para 3, $1,000 steps,
        // verified against existing data file 2026-05-17.
        escalationStep: 1000,
        escalationCap: 330000,
        // Source: Laura CVR 335 Para 8 DEPOSIT "$1,000.00 to be held by
        // ERA WOODY HOGG ... has paid the Deposit".
        earnestMoney: 1000,
        earnestMoneyHolder: "ERA Woody Hogg (received)",
        sellerConcessionsCredit: 0,
        // Source: Laura CVR 335 Para 5 SELLER CONCESSIONS,
        // checkbox marked "3% of the Purchase Price".
        buyerBrokerCompPct: 3,
        // Source: Laura CVR 335 Para 9 "Settlement shall be made at the
        // offices of Dankos and Gordan on or before June 19, 2026".
        settlementDate: "2026-06-19",
        settlementAgent: "Dankos and Gordan",
        possession: "At settlement",
        // Original Para 27 deadline was 10 AM Tuesday 5/18; extended to the
        // master Tuesday 6 PM ET review window per Miles's email to Ronnie
        // 2026-05-18 08:47 ET. Surfacing the master window in the UI instead
        // of a per-offer banner since this offer's clock now rides with it.
        offerExpiresAt: null,
        offerExpiresLabel:
          "Original 10 AM Mon deadline extended; tracking the Tuesday 6 PM review.",
        inspectionDays: 12,
        appraisalContingency: true,
        financingContingency: true,
        financingType: "Conventional, 30-year fixed",
        preApprovalLender: "Ed Lamb",
        preApprovalInstitution: "New American Funding",
        preApprovalDate: "2026-05-17",
        personalPropertyIncluded: ["Refrigerator", "Washer", "Dryer"],
        asIsItems: [
          "Fireplace, chimney, flue, liner, chimney cap",
          "Exterior storage areas",
        ],
        buyer: {
          name: "Laura Fullmer",
          occupancy: "owner-occupant",
          agentName: "Ronnie Burnett",
          agentBrokerage: "ERA Woody Hogg & Assoc",
          agentEmail: "rzzl25@aol.com",
        },
        status: "leading",
        statusNote:
          "Miles already pushed Ronnie for $330,000 flat and an inspection cap with no item under $1,500. Awaiting their revised addenda.",
      },
      {
        offerId: "donnell",
        buyerLastName: "Virnelson",
        receivedAt: "2026-05-18",
        // Source: Donnell CVR 335 (Docusign 21E7A536), Paragraph 4
        // "Three Hundred Seven Thousand Five Hundred Dollars ($307,500.00)".
        basePrice: 307500,
        escalationStep: 0,
        escalationCap: 307500,
        // Source: Donnell CVR 335 Para 8 DEPOSIT "$3,000.00 to be held by
        // Rocket Close ... Earnnest ... will pay the Deposit ... within 3 bus
        // days".
        earnestMoney: 3000,
        earnestMoneyHolder: "Rocket Close (via Earnnest, paid within 3 days)",
        sellerConcessionsCredit: 0,
        // Source: Donnell CVR 335 Para 5 SELLER CONCESSIONS,
        // checkbox marked "3% of the Purchase Price".
        buyerBrokerCompPct: 3,
        // Source: Donnell CVR 335 Para 9 "Settlement shall be made at the
        // offices of Rocket Close on or before June 18, 2026".
        settlementDate: "2026-06-18",
        settlementAgent: "Rocket Close",
        possession: "At settlement",
        // Source: Donnell CVR 335 Para 27 ACCEPTANCE
        // "by 8:00 a.m. on May 19, 2026".
        offerExpiresAt: "2026-05-19T08:00:00",
        inspectionDays: 10,
        // Source: Donnell CVR 335 Para 23 ADDITIONAL TERMS
        // "Purchaser waives any single item defects under $500 found as a
        // result of a home inspection ... Should the aggregate total of
        // said defects exceed $5,000 purchaser retains the right to
        // negotiate on said repairs over the aggregate total of $5,000."
        inspectionFineprint:
          "Buyer waives single-item defects under $500. If total defects exceed $5,000 they can still negotiate over that aggregate.",
        appraisalContingency: true,
        financingContingency: true,
        financingType: "Conventional, 30-year fixed",
        preApprovalLender: "Cheryl Dye",
        preApprovalInstitution: "Langley Federal Credit Union",
        preApprovalDate: "2026-05-18",
        // Source: Donnell pre-approval letter dated 5/18/2026 (page 14 of
        // offer pkg) -- Max sales price $300,000, Max loan $300,000.
        // The $307,500 contract price is $7,500 over the lender's approved
        // cap. Either the buyer covers the gap in cash, or they need a
        // re-issued letter at the contract price.
        preApprovalNote:
          "Pre-approved at max sales price $300,000. The $307,500 contract price is $7,500 over the lender's approved cap, so an updated letter is needed.",
        personalPropertyIncluded: [
          "Refrigerator",
          "Washer",
          "Dryer",
          "Security system",
        ],
        asIsItems: [
          "Fireplace, chimney, flue, liner, chimney cap",
          "Exterior storage areas",
        ],
        buyer: {
          name: "Alexander Virnelson",
          occupancy: "owner-occupant",
          agentName: "Donnell Cobb",
          agentBrokerage: "Redfin",
          agentEmail: "donnell.cobb@redfin.com",
        },
        status: "new",
        statusNote:
          "Lower than the leading offer by $12,500. Tightest inspection terms of any offer in hand (waives sub-$500 single items).",
      },
    ],
    milesNote: {
      headline:
        "Two offers in hand. We push the new one to do better before tomorrow's review window.",
      body: [
        "Quick recap so you have the whole picture. Laura's offer from this weekend is still leading at $320,000 base with an escalation up to $330,000, owner-occupant, financing approved, deadline extended to our Tuesday 6 PM review. A second offer just landed tonight from a Redfin buyer named Alexander at $307,500 firm, owner-occupant, with the cleanest inspection terms we've seen (he waives any single-item defect under $500). The new offer is $12,500 light on price but materially better on inspection posture.",
        "My recommendation for the morning: I reach out to Donnell, share that there's a stronger price already on the table, and ask whether his buyer can come up and keep those tight inspection terms. We don't tell them Laura's exact number. We tell them the bar to clear is $320,000 right now, and we'd want to see them above it with at least the same inspection posture. If they can stretch, we have two real offers competing for you. If they can't, we still have Laura's escalation working in your favor.",
        "Two pressure points worth knowing without panicking. First, Donnell's offer on its own face expires at 8:00 AM tomorrow, but that is a paper clock. We can request an extension as part of asking them to do better, and it would be strange for them not to grant it once they hear we have other paper. Second, their pre-approval letter from Langley FCU tops out at $300,000, which is $7,500 below their own offer price. If they want to actually win this, they need to come up on price AND get a re-issued pre-approval that matches the new number. That is a fair thing to ask for and it filters out a buyer who cannot actually close.",
        "The button below is just a green light from you on this plan. Tap it and I'll have the email to Donnell drafted in my inbox tonight, ready for me to eyeball and send before bed. Nothing goes to him until I hit send myself. Call me first thing in the morning either way and we'll walk through whatever lands by then.",
      ],
    },
  },
};

export function getOfferByToken(
  contactId: string,
  token: string,
): OfferContactData | null {
  const data = CONTACTS[contactId];
  if (!data) return null;
  if (data.shareToken !== token) return null;
  return data;
}
