import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import {
  getNeighborhood,
  neighborhoods,
  type NeighborhoodContent,
} from "../content";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) return {};
  const url = `https://mamsnow.com/neighborhoods/${n.slug}`;
  const title = `${n.name} Real Estate Guide | Buying, Selling & Living in ${n.name}`;
  const description = `${n.oneLineFit} Honest neighborhood read from Miles Agee, Realtor on the OneSouth Realty team at Samson Properties. Updated ${n.reviewedDate}.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "MAMS, Richmond Real Estate by Miles Agee",
      type: "article",
      images: [
        {
          url: "/images/miles-hero.jpg",
          width: 1200,
          height: 630,
          alt: `${n.name} neighborhood guide by Miles Agee, MAMS Richmond Real Estate`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/miles-hero.jpg"],
    },
  };
}

function buildJsonLd(n: NeighborhoodContent) {
  const url = `https://mamsnow.com/neighborhoods/${n.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Place",
      "@id": `${url}#place`,
      name: n.name,
      url,
      description: n.oneLineFit,
      address: {
        "@type": "PostalAddress",
        addressLocality: n.county.replace(/ County$/, ""),
        addressRegion: "VA",
        addressCountry: "US",
      },
      ...(n.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: n.geo.latitude,
              longitude: n.geo.longitude,
            },
          }
        : {}),
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: n.parent,
      },
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
          item: "https://mamsnow.com/neighborhoods",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: n.name,
          item: url,
        },
      ],
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: `${n.name} Real Estate Guide`,
      description: n.oneLineFit,
      datePublished: n.reviewedDate,
      dateModified: n.reviewedDate,
      author: { "@id": "https://mamsnow.com/#miles" },
      publisher: { "@id": "https://mamsnow.com/#brand" },
      mainEntityOfPage: url,
      about: { "@id": `${url}#place` },
    },
  ];
  if (n.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: n.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 md:py-16 px-6 border-b border-deep-teal/8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-3">
          {eyebrow}
        </p>
        <h2
          className="font-display text-2xl sm:text-3xl font-light text-deep-teal tracking-tight mb-6"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          {title}
        </h2>
        <div
          className="text-base text-deep-teal/80 leading-relaxed space-y-4"
          style={{ lineHeight: "1.75" }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) notFound();

  const jsonLd = buildJsonLd(n);

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
            {n.county} · Neighborhood Guide
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {n.name}
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            {n.oneLineFit}
          </p>
          <p className="text-xs text-ivory/40 mt-8 uppercase tracking-wider">
            Reviewed {n.reviewedDate} · By Miles Agee, Realtor®
          </p>
        </div>
      </header>

      {/* HOUSING STOCK */}
      {n.housingStock && (
        <Section eyebrow="The Real Estate" title="Housing stock">
          <p>{n.housingStock}</p>
        </Section>
      )}

      {/* BUYING REALITY */}
      {n.buyingReality && (
        <Section eyebrow="If You're Buying" title="The buying reality">
          <p>{n.buyingReality}</p>
        </Section>
      )}

      {/* SELLING REALITY */}
      {n.sellingReality && (
        <Section eyebrow="If You're Selling" title="The selling reality">
          <p>{n.sellingReality}</p>
        </Section>
      )}

      {/* LIFESTYLE */}
      {n.lifestyle && (
        <Section eyebrow="Day to Day" title={`Living in ${n.name}`}>
          <p>{n.lifestyle}</p>
        </Section>
      )}

      {/* FIT CHECKLIST */}
      {n.fitChecklist.length > 0 && (
        <Section eyebrow="Is It For You" title={`${n.name} may be a fit if`}>
          <ul className="space-y-3">
            {n.fitChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-3 h-3 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQ */}
      {n.faqs.length > 0 && (
        <Section eyebrow="Common Questions" title={`${n.name} FAQ`}>
          <div className="space-y-8">
            {n.faqs.map((f, i) => (
              <div key={i}>
                <h3 className="font-display text-lg font-medium text-deep-teal mb-2 tracking-tight">
                  {f.question}
                </h3>
                <p className="text-deep-teal/75">{f.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* MILES TAKE */}
      {n.milesTake && (
        <Section eyebrow="Miles's Take" title={`The honest read on ${n.name}`}>
          <p>{n.milesTake}</p>
        </Section>
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
            Want the real read on {n.name}?
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            Take the 7-question Richmond neighborhood quiz, or text Miles directly to talk through what {n.name} would look like for your specific situation.
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
              Text Miles about {n.name}
            </a>
          </div>
        </div>
      </section>

      {/* DATA DISCLOSURE */}
      <section className="bg-paper py-8 px-6 border-t border-deep-teal/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-deep-teal/50 leading-relaxed">
            Pricing and market data on this page is current as of {n.reviewedDate} and changes regularly. Verify with the most recent MLS data and a licensed Realtor before making purchase or sale decisions. School information should be verified through Niche, GreatSchools, or the official school district. MAMS does not steer clients by race, color, religion, sex, familial status, national origin, disability, or any other protected class.
          </p>
        </div>
      </section>
    </main>
  );
}
