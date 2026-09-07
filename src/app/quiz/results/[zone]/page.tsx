import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import { getZone, zones, type Zone } from "../../neighborhoods";
import {
  HOUSING_STOCK_LABELS,
  LIFESTYLE_LABELS,
  WEEKNIGHT_LABELS,
  SETTING_LABELS,
  label,
} from "../../labels";

type Params = Promise<{ zone: string }>;

const REVIEWED = "2026-09-06";

export async function generateStaticParams() {
  return zones.map((z) => ({ zone: z.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { zone } = await params;
  const z = getZone(zone);
  if (!z) return {};
  const url = `https://mamsnow.com/quiz/results/${z.id}`;
  const title = `${z.name} | Richmond Neighborhood Zone Guide, Prices, Commute and Tradeoffs`;
  const description = `${z.oneLiner}. Median ${z.medianPrice}, walk score ${z.walkScore}, ${z.commuteMinutes} minute typical commute, $${z.taxRate.toFixed(2)} per $100 assessed. Honest read from Miles Agee, Realtor on the OneSouth Realty team at Samson Properties.`;
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
          alt: `${z.name} zone guide by Miles Agee, MAMS Richmond Real Estate`,
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

function buildJsonLd(z: Zone) {
  const url = `https://mamsnow.com/quiz/results/${z.id}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Place",
      "@id": `${url}#place`,
      name: z.name,
      url,
      description: z.oneLiner,
      address: {
        "@type": "PostalAddress",
        addressLocality: z.county.replace(/ County$/, ""),
        addressRegion: "VA",
        addressCountry: "US",
      },
      containedInPlace: {
        "@type": "AdministrativeArea",
        name:
          z.county === "Richmond City"
            ? "Richmond, Virginia"
            : `${z.county}, Virginia`,
      },
      containsPlace: z.notableCommunities.map((c) => ({
        "@type": "Place",
        name: c,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MAMS", item: "https://mamsnow.com" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Neighborhood Quiz",
          item: "https://mamsnow.com/quiz",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Zones",
          item: "https://mamsnow.com/quiz/results",
        },
        { "@type": "ListItem", position: 4, name: z.name, item: url },
      ],
    },
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: `${z.name}: what it costs, what it trades away`,
      description: z.oneLiner,
      datePublished: REVIEWED,
      dateModified: REVIEWED,
      author: { "@id": "https://mamsnow.com/#miles" },
      publisher: { "@id": "https://mamsnow.com/#brand" },
      mainEntityOfPage: url,
      about: { "@id": `${url}#place` },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: `What does a home cost in ${z.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Homes in ${z.name} typically trade in the ${z.medianPrice} range as of ${REVIEWED}. Pricing moves, so verify against current MLS data before making decisions.`,
          },
        },
        {
          "@type": "Question",
          name: `What is the property tax rate in ${z.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${z.county} assesses $${z.taxRate.toFixed(2)} per $100 of assessed value. Rates are set annually by the locality, so confirm the current year rate with the ${z.county} assessor.`,
          },
        },
        {
          "@type": "Question",
          name: `What is the tradeoff of living in ${z.name}?`,
          acceptedAnswer: { "@type": "Answer", text: z.tradeoff },
        },
        {
          "@type": "Question",
          name: `Which schools serve ${z.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${z.name} is served by ${z.schoolDistrict}. Zoning changes by address and by grade level. For ratings and reviews check Niche (https://www.niche.com/) and GreatSchools (https://www.greatschools.org/), and verify the assigned school through the district before making decisions.`,
          },
        },
      ],
    },
  ];
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

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-deep-teal/10 rounded-sm px-5 py-4 bg-white/40">
      <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-deep-teal/45 mb-2">
        {k}
      </p>
      <p
        className="font-display text-xl text-deep-teal font-light tracking-tight"
        style={{ fontVariationSettings: "'opsz' 48" }}
      >
        {v}
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-sm text-deep-teal/75 border border-gold/30 bg-gold/[0.06] rounded-full px-4 py-1.5">
      {children}
    </span>
  );
}

export default async function ZoneResultPage({ params }: { params: Params }) {
  const { zone } = await params;
  const z = getZone(zone);
  if (!z) notFound();

  const jsonLd = buildJsonLd(z);

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
            {z.county} · {label(SETTING_LABELS, z.settingType)}
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {z.name}
          </h1>
          <div className="w-12 h-px bg-gold mb-6" />
          <p
            className="text-lg sm:text-xl text-ivory/85 max-w-2xl"
            style={{ lineHeight: "1.65" }}
          >
            {z.whyFitsYou.default ?? z.oneLiner}
          </p>
          <p className="text-xs text-ivory/40 mt-8 uppercase tracking-wider">
            Reviewed {REVIEWED} · By Miles Agee, Realtor®
          </p>
        </div>
      </header>

      {/* NUMBERS */}
      <Section eyebrow="The Numbers" title={`What ${z.name} actually costs`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 not-prose">
          <Stat k="Median range" v={z.medianPrice} />
          <Stat k="Walk score" v={String(z.walkScore)} />
          <Stat k="Typical commute" v={`${z.commuteMinutes} min`} />
          <Stat k="Tax rate" v={`$${z.taxRate.toFixed(2)} / $100`} />
          <Stat k="School district" v={z.schoolDistrict} />
          <Stat k="County" v={z.county} />
        </div>
        <p className="text-sm text-deep-teal/60">
          Walk score and commute are representative averages for the zone, not for a
          single address. The tax rate is the locality rate per $100 of assessed value
          and is reset annually.
        </p>
      </Section>

      {/* TRADEOFF */}
      <Section eyebrow="The Honest Part" title={`What ${z.name} trades away`}>
        <p>{z.tradeoff}</p>
        <p className="text-sm text-deep-teal/60">
          Most zone pages skip this part. Every place in Greater Richmond gives
          something up, and knowing which thing before you tour is worth more than
          another photo gallery.
        </p>
      </Section>

      {/* COMMUNITIES */}
      {z.notableCommunities.length > 0 && (
        <Section
          eyebrow="On the Ground"
          title={`Communities inside ${z.name}`}
        >
          <div className="flex flex-wrap gap-2">
            {z.notableCommunities.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </Section>
      )}

      {/* HOUSING + LIFESTYLE */}
      <Section eyebrow="What You Get" title="Housing stock and daily life">
        <p className="font-medium text-deep-teal">What is on the market here</p>
        <ul className="space-y-2">
          {z.housingStock.map((h) => (
            <li key={h}>{label(HOUSING_STOCK_LABELS, h)}</li>
          ))}
        </ul>
        <p className="font-medium text-deep-teal pt-2">
          What this zone is built around
        </p>
        <ul className="space-y-2">
          {z.lifestyleTags.map((t) => (
            <li key={t}>{label(LIFESTYLE_LABELS, t)}</li>
          ))}
        </ul>
        <p className="font-medium text-deep-teal pt-2">
          What a Tuesday night looks like
        </p>
        <ul className="space-y-2">
          {z.weeknightTags.map((t) => (
            <li key={t}>{label(WEEKNIGHT_LABELS, t)}</li>
          ))}
        </ul>
      </Section>

      {/* WHO IT FITS */}
      <Section eyebrow="Is It For You" title={`Who ${z.name} tends to fit`}>
        <div className="space-y-6">
          {Object.entries(z.whyFitsYou)
            .filter(([k]) => k !== "default")
            .map(([k, v]) => (
              <div key={k}>
                <h3 className="font-display text-lg font-medium text-deep-teal mb-2 tracking-tight">
                  {label(
                    {
                      "single-pro": "Just you",
                      "couple-no-kids": "You and your partner",
                      "family-young": "Family with young kids",
                      "family-teens": "Family with teenagers",
                      "empty-nester": "Empty nester or downsizing",
                      "remote-relocator": "Relocating for work",
                    },
                    k
                  )}
                </h3>
                <p className="text-deep-teal/75">{v}</p>
              </div>
            ))}
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
            Not sure {z.name} is your zone?
          </h2>
          <p
            className="text-base text-ivory/70 max-w-xl mx-auto mb-8"
            style={{ lineHeight: "1.7" }}
          >
            The 7-question quiz scores all eighteen Greater Richmond zones against your
            budget, commute, and how you actually spend a Tuesday. Or text Miles and
            skip straight to the conversation.
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
              Text Miles about {z.name}
            </a>
          </div>
        </div>
      </section>

      {/* DATA DISCLOSURE */}
      <section className="bg-paper py-8 px-6 border-t border-deep-teal/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-deep-teal/50 leading-relaxed">
            Pricing, tax rates, walk scores, and commute figures on this page are
            representative for the zone as of {REVIEWED} and change regularly. Verify
            with current MLS data, the locality assessor, and a licensed Realtor before
            making purchase or sale decisions. School information should be verified
            through Niche, GreatSchools, or the official school district. MAMS does not
            steer clients by race, color, religion, sex, familial status, national
            origin, disability, or any other protected class.
          </p>
        </div>
      </section>
    </main>
  );
}
