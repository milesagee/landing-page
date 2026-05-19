export type HostContact = {
  contactId: string;
  shareToken: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  closingAddress: string;
  closingTimeframeLabel: string;
  propertyCount: number;
};

export const CONTACTS: Record<string, HostContact> = {
  E7nUPnZSGJJ38Bsgj9U4: {
    contactId: "E7nUPnZSGJJ38Bsgj9U4",
    shareToken: "oWZuHV1VAROv",
    firstName: "Eddie",
    lastName: "Echeverry",
    email: "edwardnjit@gmail.com",
    phone: "+19733497602",
    closingAddress: "3021 Grayland Ave",
    closingTimeframeLabel: "A few weeks back",
    propertyCount: 2,
  },
};

export function getHostByToken(
  contactId: string,
  token: string,
): HostContact | null {
  const data = CONTACTS[contactId];
  if (!data) return null;
  if (data.shareToken !== token) return null;
  return data;
}

export type PropertyIntakePayload = {
  nickname: string;
  currentState: "Vacant" | "Tenant-occupied" | "Living in it" | "Mid-rehab" | "";
  furnishingStatus:
    | "Fully furnished"
    | "Partially furnished"
    | "Empty"
    | "Help me decide"
    | "";
  targetMarket: string[];
  restrictions: string[];
  capitalBucket: "Under $5k" | "$5–15k" | "$15–30k" | "$30k+" | "";
  handsOn:
    | "I want to self-manage"
    | "I want it 100% outsourced"
    | "Hybrid (I'll handle some, MAMS coordinates the rest)"
    | "";
  targetMonth: string;
};

export type HostIntakePayload = {
  properties: PropertyIntakePayload[];
  whyNow: string;
  anythingElse: string;
};
