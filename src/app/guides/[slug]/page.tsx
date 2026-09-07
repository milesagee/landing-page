import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import { getGuide, guides, TAX_RATES, type Guide } from "../content";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const url = `https://mamsnow.com/guides/${g.slug}`;
  return {
    title: g.metaTitle,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: g.metaTitle,
      description: g.description,
      url,
      siteName: "MAMS, Richmond Real Estate by Miles Agee",
      type: "article",
      images: [
        {
          url: "/images/miles-hero.jpg",
          width: 1200,
          height: 630,
          alt: `${g.title}, by Miles Agee, MAMS Richmond Real Estate`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: g.metaTitle,
      description: g.description,
      images: ["/images/miles-hero.jpg"],
    },
  };
}

function buildJsonLd(g: Guide) {
  const url = `https://mamsnow.com/guides/${g.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: g.headline,
      alternativeHeadline: g.title,
      description: g.description,
      datePublished: g.reviewedDate,
      dateModified: g.reviewedDate,
      author: { "@id": "https://mamsnow.com/#miles" },
      publisher: { "@id": "https://mamsnow.com/#brand" },
      mainEntityOfPage: url,
      inLanguage: "en-US",
      about: {
        "@type": "Place",
        name: "Richmond, Virginia",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Richmond",
          addressRegion: "VA",
          addressCountry: "US",
        },
      },
      keywords: g.keywords.join(", "),
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
          name: "Guides",
          item: "https://mamsnow.com/guides",
        },
        { "@type": "ListItem", position: 3, name: g.title, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: g.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];

  if (g.steps) {
    graph.push({
      "@type": "HowTo",
      "@id": `${url}#howto`,
      name: g.steps.name,
      description: g.steps.intro,
      totalTime: "P45D",
      step: g.steps.items.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
        url: `${url}#step-${i + 1}`,
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

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
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
  );
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const jsonLd = buildJsonLd(g);

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
            {g.eyebrow}
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {g.headline}
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            {g.standfirst}
          </p>
          <p className="text-xs text-ivory/40 mt-8 uppercase tracking-wider">
            Reviewed {g.reviewedDate} · By Miles Agee, Realtor®
          </p>
        </div>
      </header>

      {/* SECTIONS */}
      {g.sections.map((s, i) => (
        <Section key={i} eyebrow={s.eyebrow} title={s.title}>
          {s.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {s.bullets && <Bullets items={s.bullets} />}
          {g.slug === "richmond-relocation" && i === 1 && (
            <div className="not-prose pt-2">
              <table className="w-full text-sm border border-deep-teal/10">
                <thead>
                  <tr className="bg-deep-teal/[0.04]">
                    <th className="text-left py-2.5 px-4 font-semibold text-deep-teal">
                      Locality
                    </th>
                    <th className="text-left py-2.5 px-4 font-semibold text-deep-teal">
                      Rate per $100 assessed
                    </th>
                    <th className="text-left py-2.5 px-4 font-semibold text-deep-teal">
                      On a $450,000 assessment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_RATES.map((t) => (
                    <tr key={t.locality} className="border-t border-deep-teal/8">
                      <td className="py-2.5 px-4 text-deep-teal/80">
                        {t.locality}
                      </td>
                      <td className="py-2.5 px-4 text-deep-teal/80">
                        ${t.rate}
                      </td>
                      <td className="py-2.5 px-4 text-deep-teal/80">
                        $
                        {Math.round(
                          (450000 / 100) * parseFloat(t.rate)
                        ).toLocaleString()}{" "}
                        / yr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      ))}

      {/* STEPS */}
      {g.steps && (
        <Section eyebrow="The Sequence" title={g.steps.name}>
          <p>{g.steps.intro}</p>
          <ol className="space-y-6 pt-2">
            {g.steps.items.map((s, i) => (
              <li key={i} id={`step-${i + 1}`} className="flex items-start gap-4">
                <span
                  className="font-display text-xl text-gold font-light flex-shrink-0 w-8 tabular-nums"
                  style={{ fontVariationSettings: "'opsz' 48" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium text-deep-teal mb-1.5 tracking-tight">
                    {s.name}
                  </h3>
                  <p className="text-deep-teal/75">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* FAQ */}
      <Section eyebrow="Common Questions" title="Questions people actually ask">
        <div className="space-y-8">
          {g.faqs.map((f, i) => (
            <div key={i}>
              <h3 className="font-display text-lg font-medium text-deep-teal mb-2 tracking-tight">
                {f.question}
              </h3>
              <p className="text-deep-teal/75">{f.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* RELATED */}
      <Section eyebrow="Keep Reading" title="The rest of the shelf">
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          {guides
            .filter((o) => o.slug !== g.slug)
            .map((o) => (
              <a
                key={o.slug}
                href={`/guides/${o.slug}`}
                className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                }}
              >
                <h3
                  className="font-display text-xl font-light text-deep-teal tracking-tight mb-2"
                  style={{ fontVariationSettings: "'opsz' 48" }}
                >
                  {o.title}
                </h3>
                <p className="text-sm text-deep-teal/70" style={{ lineHeight: "1.6" }}>
                  {o.standfirst.split(". ")[0]}.
                </p>
                <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
                  Read it →
                </span>
              </a>
            ))}
          <a
            href="/quiz/results"
            className="group block bg-ivory border border-deep-teal/8 rounded-sm p-6 hover:border-deep-teal/25 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
            style={{
              boxShadow:
                "0 1px 3px rgba(0,63,63,0.04), 0 12px 32px rgba(0,63,63,0.05)",
              transition: "border-color 0.2s ease, transform 0.2s ease",
            }}
          >
            <h3
              className="font-display text-xl font-light text-deep-teal tracking-tight mb-2"
              style={{ fontVariationSettings: "'opsz' 48" }}
            >
              All 18 Greater Richmond zones
            </h3>
            <p className="text-sm text-deep-teal/70" style={{ lineHeight: "1.6" }}>
              Median price, walk score, commute, tax rate, and the tradeoff for each.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold tracking-[0.12em] uppercase text-gold">
              Read it →
            </span>
          </a>
        </div>
      </Section>

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
            {g.ctaHeading}
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            {g.ctaBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={g.primaryCta.href}
              className="cta-primary px-8 py-4 rounded-sm text-base font-semibold tracking-wide inline-block"
            >
              {g.primaryCta.label}
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

      {/* DISCLOSURE */}
      <section className="bg-paper py-8 px-6 border-t border-deep-teal/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-deep-teal/50 leading-relaxed">
            This guide is general information, not legal, tax, or lending advice. Tax
            rates, loan program terms, and market figures are current as of{" "}
            {g.reviewedDate} and change regularly. Verify locality tax rates with the
            assessor, loan terms with your lender and virginiahousing.com, and market
            data with current MLS records before making decisions. School information
            should be verified through Niche, GreatSchools, or the official school
            district. Real estate commissions are negotiable and are not set by law.
            Miles Agee is a licensed Virginia Realtor, license 0225249973, on the
            OneSouth Realty team at Samson Properties. MAMS does not steer clients by
            race, color, religion, sex, familial status, national origin, disability, or
            any other protected class.
          </p>
        </div>
      </section>
    </main>
  );
}
