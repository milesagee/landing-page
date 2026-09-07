import type { Metadata } from "next";
import Nav from "@/components/nav";
import { guides } from "./content";

const REVIEWED = "2026-09-06";

export const metadata: Metadata = {
  title: "Richmond VA Real Estate Guides | Relocating, Buying, and Selling",
  description:
    "Working guides to Greater Richmond real estate. Relocating to the metro, buying your first home, and selling with block-level pricing. Written by Miles Agee, Realtor on the OneSouth Realty team at Samson Properties.",
  keywords: [
    "Richmond VA real estate guide",
    "moving to Richmond Virginia",
    "first time home buyer Richmond VA",
    "selling a house in Richmond VA",
    "Richmond VA relocation",
    "Richmond Virginia housing market",
  ],
  alternates: { canonical: "/guides" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Richmond VA Real Estate Guides | MAMS by Miles Agee",
    description:
      "Relocating, buying your first home, and selling in Greater Richmond. Real numbers, named places, honest tradeoffs.",
    url: "https://mamsnow.com/guides",
    type: "website",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Richmond real estate guides by Miles Agee, MAMS Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richmond VA Real Estate Guides | MAMS by Miles Agee",
    description:
      "Relocating, buying your first home, and selling in Greater Richmond. Real numbers, named places, honest tradeoffs.",
    images: ["/images/miles-hero.jpg"],
  },
};

function buildJsonLd() {
  const url = "https://mamsnow.com/guides";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: "Richmond VA Real Estate Guides",
        description:
          "Working guides to relocating to, buying in, and selling in Greater Richmond, Virginia.",
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
          { "@type": "ListItem", position: 2, name: "Guides", item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        numberOfItems: guides.length,
        itemListElement: guides.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: g.title,
          url: `https://mamsnow.com/guides/${g.slug}`,
        })),
      },
    ],
  };
}

export default function GuidesIndex() {
  const jsonLd = buildJsonLd();

  return (
    <main className="bg-paper min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

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
            Greater Richmond · Guides
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            The parts other agents leave out.
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            Three working guides to Greater Richmond. Every claim carries a real number,
            a named place, or a specific tradeoff, and every one of them tells you where
            to verify it yourself.
          </p>
          <p className="text-xs text-ivory/40 mt-8 uppercase tracking-wider">
            Reviewed {REVIEWED} · By Miles Agee, Realtor®
          </p>
        </div>
      </header>

      <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <a
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
                transition: "border-color 0.2s ease, transform 0.2s ease",
              }}
            >
              <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-deep-teal/40 mb-3">
                {g.eyebrow}
              </p>
              <h2
                className="font-display text-2xl font-light text-deep-teal tracking-tight mb-2"
                style={{ fontVariationSettings: "'opsz' 48" }}
              >
                {g.title}
              </h2>
              <p className="text-sm text-deep-teal/70" style={{ lineHeight: "1.6" }}>
                {g.standfirst}
              </p>
              <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
                Read the guide →
              </span>
            </a>
          ))}
        </div>
      </section>

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
            Reading is the easy part.
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            Take the seven-question quiz to narrow eighteen Greater Richmond zones to
            three, or text Miles and start with your actual situation.
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
    </main>
  );
}
