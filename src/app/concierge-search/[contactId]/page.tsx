import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getJosephusByToken } from "@/lib/josephus-concierge-search-data";
import { ConciergeSearchDashboard } from "@/components/concierge-search/ConciergeSearchDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// HOLD GATE: listing data is being re-verified against live MLS status + photos.
// While true, the page shows a clean refresh notice instead of any stale listings,
// so the link cannot embarrass anyone if opened or shared. Flip to false only after
// the refreshed data lands with per-listing live-status confirmation and photos.
const HOLD_FOR_REFRESH = true;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your curated search | MAMS",
  robots: { index: false, follow: false },
};

export default async function ConciergeSearchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const result = getJosephusByToken(contactId, t);
  if (!result) notFound();

  const { viewer, data } = result;
  const firstName = viewer.firstName;

  if (HOLD_FOR_REFRESH) {
    return (
      <main className="min-h-screen bg-paper text-deep-teal flex flex-col">
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
                Curated for you
              </div>
            </div>
          </div>
        </header>
        <section className="max-w-2xl mx-auto px-6 py-20 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
            Refreshing your search
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
            {firstName}, I&rsquo;m re-verifying every home right now.
          </h1>
          <p className="mt-4 text-base text-deep-teal/75 leading-relaxed">
            I pulled this page down for a live check so nothing on it is stale. Every property is
            being confirmed active against the MLS today, with current photos, before it goes back
            up. You&rsquo;ll have the clean version shortly.
          </p>
          <p className="mt-4 text-sm text-deep-teal/60 leading-relaxed">
            Anything you need in the meantime, I&rsquo;m at{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>
            .
          </p>
        </section>
      </main>
    );
  }

  const tagline = viewer.viewerType === "primary" ? "Curated for you" : "Shared with you";
  const heroEyebrow =
    viewer.viewerType === "primary"
      ? `Hand-prepared for ${firstName}`
      : `${data.primaryFirstName} shared this with you, ${firstName}`;

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
              {tagline}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          {heroEyebrow}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {firstName}, here&rsquo;s the real Richmond pool.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Most agents send a Zillow saved search and call it curation. This is what hand-built looks
          like. Ten active candidates, five recent sold comps for pricing truth, and this round a
          real energy read on every home: how it heats, whether it is all-electric, and the monthly
          bill to expect.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <ConciergeSearchDashboard
          data={data}
          viewer={viewer}
          shareToken={t!}
          contactId={contactId}
        />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {firstName}. The link is tied to your account, so please keep it to yourself.
          </p>
          <p>
            Miles direct:{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>{" "}
            &middot; Miles Agee, Realtor, Samson Properties.
          </p>
        </div>
      </footer>
    </main>
  );
}
