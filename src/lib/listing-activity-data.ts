export type ViewerType = "seller" | "dispo";

export type ListingViewer = {
  contactId: string;
  shareToken: string;
  viewerType: ViewerType;
  propertyId: string;
};

export type ShowingRequest = {
  date: string;
  outcome: "accepted" | "blocked";
  context: string;
};

export type UpcomingShowing = {
  agent: string;
  brokerage?: string;
  datetime: string;
  buyerNotes?: string;
};

export type ListingProperty = {
  id: string;
  sellerFirstName: string;
  dispoContactName: string;
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    mlsNumber: string;
    listingDate: string;
    listPrice: number;
    beds?: number;
    baths?: number;
    sqft?: number;
    hoa: { name: string; fee: number; paidThrough: string };
    propertyNotes: string[];
  };
  activity: {
    showingRequestsTotal: number;
    showingRequestsAccepted: number;
    showingRequestsBlocked: number;
    showingsCompleted: number;
    showingsScheduled: number;
    showingRequestLog: ShowingRequest[];
    zillowSaves?: number;
    zillowViews?: number;
    redfinSaves?: number;
    redfinViews?: number;
  };
  benchmarks: {
    firstWeekShowingsPct: string;
    blockedAccessImpact: string;
    showingsToOfferAvg: string;
  };
  upcomingShowings: UpcomingShowing[];
  sellerAvailability?: { submittedAt: string; windows: string[] };
  milesNoteSeller: { headline: string; body: string[] };
  milesNoteDispo: { headline: string; body: string[] };
};

export const VIEWERS: Record<string, ListingViewer> = {
  lGUzoI0uErPvbaDEk2S3: {
    contactId: "lGUzoI0uErPvbaDEk2S3",
    shareToken: "1IEE1pDMUvh6",
    viewerType: "seller",
    propertyId: "quest-209",
  },
  XKmigGeQQMwsRkmg6zod: {
    contactId: "XKmigGeQQMwsRkmg6zod",
    shareToken: "IO1cQk_A-BM5",
    viewerType: "dispo",
    propertyId: "quest-209",
  },
};

export const PROPERTIES: Record<string, ListingProperty> = {
  "quest-209": {
    id: "quest-209",
    sellerFirstName: "Madeline",
    dispoContactName: "Luis",
    property: {
      address: "209 Quest Court",
      city: "Yorktown",
      state: "VA",
      zip: "23692",
      mlsNumber: "2612464",
      listingDate: "2026-05-12",
      listPrice: 525000,
      sqft: 2731,
      baths: 2.5,
      hoa: { name: "Prospect Park", fee: 335, paidThrough: "January 2027" },
      propertyNotes: [
        "Roof + windows replaced 2023",
        "Vinyl siding",
        "Dog on premises - notice required before showings",
      ],
    },
    activity: {
      showingRequestsTotal: 6,
      showingRequestsAccepted: 2,
      showingRequestsBlocked: 4,
      showingsCompleted: 1,
      showingsScheduled: 1,
      showingRequestLog: [
        { date: "2026-05-14", outcome: "accepted", context: "Sat 5/16 9 AM (Wendy thread)" },
        { date: "2026-05-15", outcome: "blocked", context: "Today 4:30 PM" },
        { date: "2026-05-15", outcome: "blocked", context: "Today 5:30 PM" },
        { date: "2026-05-16", outcome: "accepted", context: "Sat 5/16 1 PM - Ashley Cross's buyer toured" },
        { date: "2026-05-17", outcome: "blocked", context: "Sunday 12-12:45" },
        { date: "2026-05-17", outcome: "blocked", context: "Sunday 1:30-2:15" },
      ],
    },
    benchmarks: {
      firstWeekShowingsPct: "40-60%",
      blockedAccessImpact: "25-50% longer DOM and 0.5-1.5 percentage points lower sale-to-list",
      showingsToOfferAvg: "1 offer per 8-12 showings",
    },
    upcomingShowings: [
      {
        agent: "Ashley Cross",
        brokerage: "Keller Williams Richmond West",
        datetime: "2026-05-19T13:30:00-04:00",
        buyerNotes:
          "Returning buyer (toured Saturday). Bringing her mom and a fence contractor for a quote. Ashley will text Wendy before arrival.",
      },
    ],
    milesNoteSeller: {
      headline: "Madeline, here's the full picture on Quest Court.",
      body: [
        "Six days in and we've already fielded six separate showing requests for your house. That's real buyer demand, and it puts you in the top tier of pace for this market. The data backs it up: 40 to 60 percent of all showings on a fresh listing happen in the first seven days. The window we're in right now is the window that lands the offer.",
        "I know the requests have come at you fast and the dog logistics are real. That's exactly why this dashboard exists. Below, you set the windows that work for you this week. Once you submit, Wendy and I take it from there. Buyer agents only get the windows you said yes to. No more same-day asks. Predictable instead of reactive.",
        "Ashley's bringing her client back Tuesday at 1:30 with her mom and a fence contractor. That's the kind of repeat visit that turns into an offer. The next 7 to 10 days are where this listing either lands clean or stretches longer than it needs to. The windows you give us is the move.",
      ],
    },
    milesNoteDispo: {
      headline: "Luis, Quest Court update through Day 7.",
      body: [
        "Six showing requests fielded in five days, one tour completed Saturday by an ERA buyer who's returning Tuesday at 1:30 with her mom and a fence contractor. Repeat visit before week one closes is a strong signal - that's the kind of interest that turns into a contract.",
        "Friction we're working on: the seller has been declining same-day requests because of dog logistics (four of the six requests turned down). We're shipping her a self-service availability picker today to lock in clean weekly windows, which gives us cleaner broadcast windows for the buyer agents in play.",
        "Pace is tracking well above market average. If the second tour generates the offer thread, we should be looking at ratification inside 14 days from listing date. I'll update you Tuesday evening after the second showing.",
      ],
    },
  },
};

export function getListingByToken(
  contactId: string,
  token: string,
): { viewer: ListingViewer; property: ListingProperty } | null {
  const viewer = VIEWERS[contactId];
  if (!viewer) return null;
  if (viewer.shareToken !== token) return null;
  const property = PROPERTIES[viewer.propertyId];
  if (!property) return null;
  return { viewer, property };
}
