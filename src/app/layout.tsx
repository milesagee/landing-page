import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MAMS — Richmond Real Estate | Miles Agee",
    template: "%s | MAMS — Richmond Real Estate",
  },
  description:
    "Richmond's neighborhood-level real estate expert. Buyer and seller representation across 40+ neighborhoods in Greater Richmond. Free Relocation Guide and Neighborhood Quiz to find your perfect fit.",
  keywords: [
    "Richmond real estate",
    "Richmond VA realtor",
    "Miles Agee",
    "MAMS",
    "relocating to Richmond VA",
    "Richmond neighborhoods",
    "best neighborhoods in Richmond",
    "Richmond relocation guide",
    "Richmond neighborhood quiz",
    "Richmond VA homes for sale",
    "Richmond buyer agent",
    "Richmond listing agent",
    "move to Richmond Virginia",
  ],
  metadataBase: new URL("https://mamsnow.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MAMS — Richmond Real Estate | Miles Agee",
    description:
      "Richmond's neighborhood-level real estate expert. Free Relocation Guide and Neighborhood Quiz to find your perfect fit across 40+ Greater Richmond neighborhoods.",
    url: "https://mamsnow.com",
    siteName: "MAMS — Miles Agee Real Estate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Miles Agee — Richmond Real Estate Expert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAMS — Richmond Real Estate | Miles Agee",
    description:
      "Richmond's neighborhood-level real estate expert. Free Relocation Guide and Neighborhood Quiz.",
    images: ["/images/miles-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} antialiased`}
    >
      <body className="font-body text-deep-teal bg-paper">{children}</body>
    </html>
  );
}
