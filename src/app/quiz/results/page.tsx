import type { Metadata } from "next";
import Nav from "@/components/nav";
import { zones, type Zone } from "../neighborhoods";

const REVIEWED = "2026-09-06";

export const metadata: Metadata = {
  title:
    "All 18 Greater Richmond Zones | Prices, Commutes, and Tradeoffs, by Miles Agee",
  description:
    "Every zone the Richmond neighborhood quiz scores against, with median price, walk score, typical commute, tax rate, and the tradeoff each one asks you to accept. From Miles Agee, Realtor on the OneSouth Realty team at Samson Properties.",
  keywords: [
    "Richmond VA zones",
    "where to live in Richmond Virginia",
    "Richmond VA cost of living by area",
    "Henrico vs Chesterfield",
    "Richmond VA property tax rates by county",
    "Richmond relocation neighborhoods",
    "Short Pump vs Midlothian",
  ],
  alternates: { canonical: "/quiz/results" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "All 18 Greater Richmond Zones | MAMS Real Estate by Miles Agee",
    description:
      "Median price, walk score, commute, tax rate, and the honest tradeoff for every zone in Greater Richmond.",
    url: "https://mamsnow.com/quiz/results",
    type: "website",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Greater Richmond zone guides by Miles Agee, MAMS Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All 18 Greater Richmond Zones | MAMS Real Estate by Miles Agee",
    description:
      "Median price, walk score, commute, tax rate, and the honest tradeoff for every zone in Greater Richmond.",
    images: ["/images/miles-hero.jpg"],
  },
};

function buildJsonLd() {
  const url = "https://mamsnow.com/quiz/results";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: "Greater Richmond Zone Guides",
        description:
          "Every zone the Richmond neighborhood quiz scores, with price, commute, tax rate, and tradeoff.",
        about: { "@id": "https://mamsnow.com/#brand" },
        dateModified: REVIEWED,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "MAMS",
            item: "https://mamsnow.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Neighborhood Quiz",
            item: "https://mamsnow.com/quiz",
          },
          { "@type": "ListItem", position: 3, name: "Zones", item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        numberOfItems: zones.length,
        itemListElement: zones.map((z, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: z.name,
          url: `https://mamsnow.com/quiz/results/${z.id}`,
        })),
      },
    ],
  };
}

function ZoneGrid({ list }: { list: Zone[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {list.map((z) => (
        <a
          key={z.id}
          href={`/quiz/results/${z.id}`}
          className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
            transition: "border-color 0.2s ease, transform 0.2s ease",
          }}
        >
          <h2
            className="font-display text-2xl font-light text-deep-teal tracking-tight mb-2"
            style={{ fontVariationSettings: "'opsz' 48" }}
          >
            {z.name}
          </h2>
          <p
            className="text-sm text-deep-teal/70"
            style={{ lineHeight: "1.6" }}
          >
            {z.oneLiner}
          </p>
          <p className="text-xs text-deep-teal/55 mt-3 tracking-wide">
            {z.medianPrice} · walk {z.walkScore} · {z.commuteMinutes} min ·{" "}
            ${z.taxRate.toFixed(2)}/$100
          </p>
          <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
            Read the zone →
          </span>
        </a>
      ))}
    </div>
  );
}

export default function ZoneIndex() {
  const jsonLd = buildJsonLd();
  const city = zones.filter((z) => z.region === "city");
  const suburb = zones.filter((z) => z.region === "suburb");
  const outer = zones.filter((z) => z.region === "outer");

  return (
    <main className="bg-paper min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      {/* HERO */}
      <header className="bg-deep-teal text-ivory pt-32 pb-20 md:pt-40 md:pb-24 px-6 grain relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              top: "-30%",
              right: "-15%",
              width: "600px",
              height: "600px",
              background:
                "radial-gradient(circle, rgba(0,95,95,0.4) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-20%",
              left: "-10%",
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-4">
            Greater Richmond · All 18 Zones
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Every zone, and what each one costs you.
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            Most relocation pages list the places that photograph well. These are all
            eighteen the quiz actually scores, city and county, with the price, the
            commute, the tax rate, and the thing each one asks you to give up.
          </p>
          <p className="text-xs text-ivory/40 mt-8 uppercase tracking-wider">
            Reviewed {REVIEWED} · By Miles Agee, Realtor®
          </p>
        </div>
      </header>

      <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-6">
            Richmond City
          </p>
          <ZoneGrid list={city} />
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-6">
            Suburban Ring
          </p>
          <ZoneGrid list={suburb} />
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-6">
            Outer Counties
          </p>
          <ZoneGrid list={outer} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep-teal text-ivory py-16 md:py-20 px-6 grain relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-30%",
              right: "-10%",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(0,95,95,0.35) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2
            className="font-display text-2xl sm:text-3xl font-light tracking-tight mb-4"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Eighteen is a lot. The quiz narrows it to three.
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            Seven questions about budget, commute, and how you spend a Tuesday. You get
            your top three scored against real market data, not a mood board.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/quiz"
              className="cta-primary px-8 py-4 rounded-sm text-base font-semibold tracking-wide inline-block"
            >
              Take the Quiz
            </a>
            <a
              href="sms:+18048098340"
              className="cta-secondary px-8 py-4 rounded-sm text-base font-medium tracking-wide inline-block"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "#FFFFFF" }}
            >
              Text Miles
            </a>
          </div>
        </div>
      </section>

      {/* DATA DISCLOSURE */}
      <section className="bg-paper py-8 px-6 border-t border-deep-teal/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-deep-teal/50 leading-relaxed">
            Pricing, tax rates, walk scores, and commute figures are representative for
            each zone as of {REVIEWED} and change regularly. Verify with current MLS
            data, the locality assessor, and a licensed Realtor before making purchase
            or sale decisions. School information should be verified through Niche,
            GreatSchools, or the official school district. MAMS does not steer clients
            by race, color, religion, sex, familial status, national origin, disability,
            or any other protected class.
          </p>
        </div>
      </section>
    </main>
  );
}
