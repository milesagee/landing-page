import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBuyerMatchByToken } from "@/lib/buyer-match-data";
import { MarketCommentary } from "@/components/buyer-match/MarketCommentary";
import { BuyerMatchCard } from "@/components/buyer-match/BuyerMatchCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your curated shortlist | MAMS Buyer Match",
  robots: { index: false, follow: false },
};

export default async function BuyerMatchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const data = getBuyerMatchByToken(contactId, t);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-paper text-deep-teal">
      <header className="bg-deep-teal text-ivory">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <Image
            src="/images/mams-logo.png"
            alt="MAMS"
            width={48}
            height={48}
            className="h-10 w-10 rounded-full border border-gold/30 object-cover"
            priority
          />
          <div>
            <div className="font-display text-ivory text-lg leading-none">MAMS</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gold-dark mt-0.5">
              Buyer Match
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-curated for {data.firstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {data.firstName}, here&rsquo;s your shortlist.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          {data.schoolMethod && data.schoolMethod.length > 0
            ? "Ranked by the Elementary School Read for the exact school each home is zoned to. Every number below comes with the source it came from, so you can check it yourself. The drive to base and the honest trade-off ride on each card."
            : "Start with the homes. Each one fits what you told me, with the drive to base, the highway access, and the honest trade-off. The market read is underneath if you want it."}
        </p>
      </section>

      {data.schoolMethod && data.schoolMethod.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-4">
          <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
            <div className="px-6 sm:px-8 py-4 bg-deep-teal/[0.04] border-b border-deep-teal/10">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
                How your Elementary School Read is built
              </p>
            </div>
            <div className="px-6 sm:px-8 py-6 space-y-5">
              {data.schoolLensIntro && (
                <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
                  {data.schoolLensIntro}
                </p>
              )}
              <ul className="space-y-3">
                {data.schoolMethod.map((factor) => (
                  <li key={factor.name} className="border-l-2 border-gold/40 pl-4">
                    <p className="font-display text-base text-deep-teal leading-tight">{factor.name}</p>
                    <p className="text-xs text-deep-teal/65 mt-0.5 leading-relaxed">{factor.sourceNote}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 pb-10 space-y-6">
        {data.properties.length === 0 ? (
          <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
            <div className="px-6 sm:px-8 py-4 bg-gold/10 border-b border-gold/20">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
                Your shortlist is being built right now
              </p>
            </div>
            <div className="px-6 sm:px-8 py-6 space-y-3">
              <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
                Every home that makes your list gets confirmed against live listings first, so nothing
                you see is already under contract or priced wrong. Each one lands with a photo, a
                one-tap link to the full gallery, the reason it earned a spot, and the trade-off you
                deserve to see before you fall for it.
              </p>
              <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
                That is the part the public sites skip. It is worth getting right.
                {data.shortlistEta ? ` Watch for it ${data.shortlistEta}.` : ""}
              </p>
            </div>
          </div>
        ) : (
          data.properties.map((p) => (
            <BuyerMatchCard
              key={p.slug}
              property={p}
              contactId={contactId}
              shareToken={t!}
            />
          ))
        )}
      </section>

      {(data.marketCommentary ||
        data.strategy ||
        (data.neighborhoodReads && data.neighborhoodReads.length > 0)) && (
        <section className="max-w-3xl mx-auto px-6 pb-10">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 bg-white rounded-lg border border-deep-teal/10 px-6 sm:px-8 py-4 hover:border-gold/40 transition-colors">
              <span className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
                The market read on your search
              </span>
              <svg
                className="w-4 h-4 text-deep-teal/50 group-open:rotate-180 transition-transform"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </summary>

            <div className="mt-4 space-y-6">
              {data.marketCommentary && <MarketCommentary text={data.marketCommentary} />}

              {data.strategy && (
                <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-2">
                    {data.strategyHeading ?? "The read on your must-haves"}
                  </p>
                  <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed whitespace-pre-line">
                    {data.strategy}
                  </p>
                </div>
              )}

              {data.neighborhoodReads && data.neighborhoodReads.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
                    Your neighborhoods, the honest version
                  </p>
                  {data.neighborhoodReads.map((n) => (
                    <div
                      key={n.name}
                      className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden"
                    >
                      <div className="flex items-baseline justify-between gap-4 px-6 sm:px-8 py-4 bg-deep-teal/[0.04] border-b border-deep-teal/10">
                        <h3 className="font-display text-xl text-deep-teal leading-tight">{n.name}</h3>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold whitespace-nowrap">
                          {n.rankLabel}
                        </span>
                      </div>
                      <div className="px-6 sm:px-8 py-5 space-y-3">
                        <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">{n.body}</p>
                        <div className="border-l-2 border-gold/40 pl-4">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
                            What your budget gets here
                          </p>
                          <p className="text-sm text-deep-teal/75 leading-relaxed">{n.budgetReality}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl text-deep-teal mb-3">What happens next</h2>
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>
              Tap &ldquo;Tell Miles more&rdquo; on any card that caught your eye. We&rsquo;ll line up the tour
              and pull the deeper detail nobody else is going to surface for you.
            </li>
            <li>
              Reply to the email this shortlist came in on if you want the trade-off conversation on
              any of these. Miles holds the honest read.
            </li>
            <li>
              The shortlist is yours -- whether we end up running the search together or not. That&rsquo;s
              the standard.
            </li>
          </ol>
        </div>
      </section>

      {data.sources.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <details className="bg-white rounded-lg border border-deep-teal/10 p-4">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-deep-teal/60 font-semibold hover:text-deep-teal">
              Sources ({data.sources.length})
            </summary>
            <ul className="mt-3 space-y-2 text-xs text-deep-teal/70 leading-relaxed">
              {data.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-dark">
                    {s.description}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {data.firstName}. The link is tied to you, so please keep it to yourself.
          </p>
          <p>
            Miles direct:{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>{" "}
            &middot; Miles Agee, Realtor, OneSouth Realty Team powered by Samson Properties.
          </p>
        </div>
      </footer>
    </main>
  );
}
