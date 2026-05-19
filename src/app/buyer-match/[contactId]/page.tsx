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
          The inventory the public sites aren&rsquo;t surfacing for your shape -- with the reason each
          one is here, the anchors that line up with what you told us, and the trade-off line you
          deserve to see before you fall in love.
        </p>
      </section>

      {data.marketCommentary && (
        <section className="max-w-3xl mx-auto px-6 pb-6">
          <MarketCommentary text={data.marketCommentary} />
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 pb-12 space-y-6">
        {data.properties.length === 0 ? (
          <div className="bg-white rounded-lg border border-deep-teal/10 p-8 text-center">
            <p className="text-sm text-deep-teal/70">
              Curation in progress. Refresh this page once you hear from Miles.
            </p>
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
