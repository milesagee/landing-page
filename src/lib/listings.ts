// Active + pipeline listings shown on /listings.
// Single source of truth. To add a listing: append one object here and drop its
// breakdown HTML in public/scaffold/ (built by the mams-listing-engine skill).
// Active entries also feed the sitemap (src/app/sitemap.ts).

export type Listing = {
  slug: string; // "14772-malloy-ct"
  status: "active" | "coming-soon";
  address: string; // "14772 Malloy Ct"
  city: string; // "Woodbridge"
  state: string; // "VA"
  price: number; // 339945 (0 = not yet priced, for coming-soon)
  beds: number;
  baths: number;
  sqft: number;
  year: number;
  hero: string; // public path, e.g. "/scaffold/listing-14772-malloy-pics/malloy-01.jpg"
  badge: string; // "Just Listed", "Coming Soon", "Under Contract"
  hook: string; // one you-frame line, no em dash
  angles: string[]; // 2-3 provable chips, e.g. ["50 min to DC", "Walk to the VRE"]
  breakdownUrl: string; // "/scaffold/listing-14772-malloy-ct.html" ("" if no page yet)
};

export const listings: Listing[] = [
  {
    slug: "14772-malloy-ct",
    status: "active",
    address: "14772 Malloy Ct",
    city: "Woodbridge",
    state: "VA",
    price: 339945,
    beds: 2,
    baths: 2.5,
    sqft: 1416,
    year: 2016,
    hero: "/scaffold/listing-14772-malloy-pics/malloy-01.jpg",
    badge: "Just Listed",
    hook: "Walk to the train, skip the chores, buy the upside.",
    angles: ["50 min to DC", "Walk to the VRE", "$166M county tax base"],
    breakdownUrl: "/scaffold/listing-14772-malloy-ct.html",
  },
];

export const activeListings = () => listings.filter((l) => l.status === "active");
export const comingSoonListings = () =>
  listings.filter((l) => l.status === "coming-soon");

export function formatPrice(n: number): string {
  if (!n) return "Price coming soon";
  return "$" + n.toLocaleString("en-US");
}

export function bathLabel(n: number): string {
  // 2.5 -> "2.5", 2 -> "2"
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
