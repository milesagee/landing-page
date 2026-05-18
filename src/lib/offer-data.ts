export type OfferData = {
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
  offer: {
    receivedAt: string;
    basePrice: number;
    escalationStep: number;
    escalationCap: number;
    earnestMoney: number;
    sellerConcessionsCredit: number;
    buyerBrokerCompPct: number;
    listingBrokerCompPct: number;
    settlementDate: string;
    settlementAgent: string;
    possession: string;
    offerExpiresAt: string | null;
    inspectionDays: number;
    appraisalContingency: boolean;
    financingContingency: boolean;
    financingType: string;
    downPayment: number;
    loanAmount: number;
    personalPropertyIncluded: string[];
    asIsItems: string[];
  };
  milesNote: {
    headline: string;
    body: string[];
  } | null;
  buyer: {
    name: string;
    occupancy: "owner-occupant" | "investor";
    agentName: string;
    agentBrokerage: string;
    lenderName: string;
    lenderInstitution: string;
    preApprovalDate: string;
  };
  closingFees: {
    closingAttorney: number;
    transactionFee: number;
    releaseFeeIfLoan: number;
    termiteInspection: number;
  };
};

export const CONTACTS: Record<string, OfferData> = {
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
    offer: {
      receivedAt: "2026-05-17",
      basePrice: 320000,
      escalationStep: 1000,
      escalationCap: 330000,
      earnestMoney: 1000,
      sellerConcessionsCredit: 0,
      // Source: CVR 335 Purchase Agreement, Paragraph 5 "SELLER CONCESSIONS",
      // checkbox marked at 3% of Purchase Price. Verified against the executed
      // PDF on 2026-05-17. Buy-side % varies per contract - always re-read
      // Paragraph 5 of THIS offer before populating. Never assume.
      buyerBrokerCompPct: 3,
      // Source: MAMS listing agreement (CVR 345) executed 2026-05-09.
      // Miles's standard listing commission is 3%. Verify against the actual
      // listing agreement each time - this is the source of truth, not GHL.
      listingBrokerCompPct: 3,
      settlementDate: "2026-06-19",
      settlementAgent: "Dankos and Gordan",
      possession: "At settlement",
      offerExpiresAt: "2026-05-18T10:00:00",
      inspectionDays: 12,
      appraisalContingency: true,
      financingContingency: true,
      financingType: "Conventional, 30-year fixed",
      downPayment: 48750,
      loanAmount: 276250,
      personalPropertyIncluded: ["Refrigerator", "Washer", "Dryer"],
      asIsItems: [
        "Fireplace, chimney, flue, liner, chimney cap",
        "Exterior storage areas",
      ],
    },
    milesNote: {
      headline: "Here's where I land — we accept early, on our terms.",
      body: [
        "First, read this calmly. The 10 AM clock on their side is real, but it isn't the boss of this room. This is a real first offer from a real buyer with real financing — that's a good thing, not a panic moment.",
        "My recommendation: we go ahead and accept — early, before their 10:00 AM deadline — but on terms that actually make sense for you. The frame is simple. Sooner security is worth something to them, and it's worth something to you. They get a yes ahead of schedule; you get adjustments that make this deal hold together.",
        "What I'm pushing for in the counter:",
        "(1) Drop the escalation. Commit to $330,000 flat. The escalation only triggers if a second offer comes in — without one, you'd be at $320,000. Locking them in at the cap puts $330,000 on the table no matter what.",
        "(2) Inspection cap with teeth: no individual repair request under $1,000. That kills the death-by-a-thousand-cuts nickel-and-dime list two weeks from now. They can bring real issues; they can't bring a junk drawer.",
        "How I'm framing it to Ronnie: I'll have my formal counter in his inbox by 9:30 AM at the latest — well ahead of their 10 AM clock. I'll mention in passing that we can extend the deadline if they need a beat to work through it on their end. That's not us flinching. It's confidence. We're not afraid of the clock running out.",
        "Same posture for you: we move with urgency because we're choosing to, not because anyone is pushing us. If 10 AM passes without a yes, that doesn't end the deal. It ends the version of the deal that didn't work for us, and we keep going.",
        "What we keep on our side: the rest of the day. With this accepted early on cleaner terms, I'll still text the temperature of every other party who's shown real interest this week — without an open offer hanging over us. If something materially stronger shows up, we know exactly where we stand. If nothing does, we already have $330,000 in hand with cleaner inspection terms.",
        "Call me early in the morning. By the time we talk I'll already be working it with Ronnie.",
      ],
    },
    buyer: {
      name: "Laura Fullmer",
      occupancy: "owner-occupant",
      agentName: "Ronnie Burnett",
      agentBrokerage: "ERA Woody Hogg & Assoc",
      lenderName: "Ed Lamb",
      lenderInstitution: "New American Funding",
      preApprovalDate: "2026-05-17",
    },
    closingFees: {
      closingAttorney: 499,
      transactionFee: 399,
      releaseFeeIfLoan: 125,
      termiteInspection: 80,
    },
  },
};

export function getOfferByToken(
  contactId: string,
  token: string,
): OfferData | null {
  const data = CONTACTS[contactId];
  if (!data) return null;
  if (data.shareToken !== token) return null;
  return data;
}
