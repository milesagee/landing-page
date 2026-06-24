import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Richmond Area Homes for Sale | MAMS Active Listings",
  description:
    "Active listings represented by Miles Agee. Every home comes with a full breakdown: the numbers, the neighborhood, and why it is worth your move. Buyer and seller representation across Greater Richmond and Northern Virginia.",
  keywords: [
    "Richmond VA homes for sale",
    "Richmond active listings",
    "Northern Virginia homes for sale",
    "Woodbridge VA condo for sale",
    "Miles Agee listings",
    "MAMS listings",
    "homes for sale near me Virginia",
    "real estate listings Richmond Virginia",
  ],
  alternates: {
    canonical: "/listings",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Active Listings | MAMS Real Estate by Miles Agee",
    description:
      "Browse active listings. Every home gets its own full breakdown: the numbers, the neighborhood, and the upside. Buyer and seller representation across Virginia.",
    url: "https://mamsnow.com/listings",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "MAMS Active Listings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Listings | MAMS Real Estate by Miles Agee",
    description:
      "Every home gets its own full breakdown. Browse active listings across Greater Richmond and Northern Virginia.",
    images: ["/images/miles-hero.jpg"],
  },
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
