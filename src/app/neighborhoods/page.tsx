import type { Metadata } from "next";
import Nav from "@/components/nav";
import { neighborhoods } from "./content";

export const metadata: Metadata = {
  title:
    "Richmond Neighborhood Guides | Buying, Selling & Living, by Miles Agee",
  description:
    "Honest, block-level reads on Greater Richmond neighborhoods. What it costs, what you give up, and who each one actually fits. From Miles Agee, Realtor on the OneSouth Realty team at Samson Properties.",
  keywords: [
    "Richmond VA neighborhoods",
    "best neighborhoods in Richmond Virginia",
    "The Fan Richmond",
    "Church Hill Richmond",
    "Scott's Addition Richmond",
    "Museum District Richmond",
    "where to live in Richmond VA",
    "Richmond neighborhood guide",
  ],
  alternates: { canonical: "/neighborhoods" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Richmond Neighborhood Guides | MAMS Real Estate by Miles Agee",
    description:
      "Block-level reads on Greater Richmond neighborhoods. What it costs, what you give up, and who each one fits.",
    url: "https://mamsnow.com/neighborhoods",
    type: "website",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Richmond Neighborhood Guides by Miles Agee, MAMS Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richmond Neighborhood Guides | MAMS Real Estate by Miles Agee",
    description:
      "Block-level reads on Greater Richmond neighborhoods. What it costs, what you give up, and who each one fits.",
    images: ["/images/miles-hero.jpg"],
  },
};

function buildJsonLd() {
  const url = "https://mamsnow.com/neighborhoods";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: "Richmond Neighborhood Guides",
        description:
          "Block-level reads on Greater Richmond neighborhoods from Miles Agee.",
        about: { "@id": "https://mamsnow.com/#brand" },
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
            name: "Neighborhoods",
            item: url,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        itemListElement: neighborhoods.map((n, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: n.name,
          url: `https://mamsnow.com/neighborhoods/${n.slug}`,
        })),
      },
    ],
  };
}

export default function NeighborhoodsIndex() {
  const jsonLd = buildJsonLd();
  const city = neighborhoods.filter((n) => n.county === "Richmond City");
  const county = neighborhoods.filter((n) => n.county !== "Richmond City");

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
            Greater Richmond · Neighborhood Guides
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Find your neighborhood. Not just a house.
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            Most agents send you listings in neighborhoods that do not fit your life. Start the other way. These are honest, block-level reads on Greater Richmond: what each one costs, what you give up, and who it actually fits.
          </p>
        </div>
      </header>

      {/* CITY */}
      <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-6">
            Richmond City
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {city.map((n) => (
              <a
                key={n.slug}
                href={`/neighborhoods/${n.slug}`}
                className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
                style={{
                  boxShadow: "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                }}
              >
                <h2
                  className="font-display text-2xl font-light text-deep-teal tracking-tight mb-2 group-hover:text-deep-teal"
                  style={{ fontVariationSettings: "'opsz' 48" }}
                >
                  {n.name}
                </h2>
                <p
                  className="text-sm text-deep-teal/70"
                  style={{ lineHeight: "1.6" }}
                >
                  {n.oneLineFit}
                </p>
                <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
                  Read the guide →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTY / SUBURBAN */}
      {county.length > 0 && (
        <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-6">
              Suburban &amp; County
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {county.map((n) => (
                <a
                  key={n.slug}
                  href={`/neighborhoods/${n.slug}`}
                  className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
                    transition: "border-color 0.2s ease, transform 0.2s ease",
                  }}
                >
                  <h2
                    className="font-display text-2xl font-light text-deep-teal tracking-tight mb-2"
                    style={{ fontVariationSettings: "'opsz' 48" }}
                  >
                    {n.name}
                  </h2>
                  <p
                    className="text-sm text-deep-teal/70"
                    style={{ lineHeight: "1.6" }}
                  >
                    {n.oneLineFit}
                  </p>
                  <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
                    Read the guide →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

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
            Not sure which one fits?
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            Take the 7-question Richmond neighborhood quiz and get matched to the pockets that actually fit how you live, or text Miles directly to talk it through.
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
              style={{
                borderColor: "rgba(255,255,255,0.25)",
                color: "#FFFFFF",
              }}
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
            Neighborhood reads reflect Miles Agee's market experience and change as the market does. Pricing and inventory move regularly. Verify with the most recent MLS data and a licensed Realtor before making purchase or sale decisions. MAMS does not steer clients by race, color, religion, sex, familial status, national origin, disability, or any other protected class.
          </p>
        </div>
      </section>
    </main>
  );
}
