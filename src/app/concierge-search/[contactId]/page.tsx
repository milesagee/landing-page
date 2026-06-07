import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getJosephusByToken } from "@/lib/josephus-concierge-search-data";
import { ConciergeSearchDashboard } from "@/components/concierge-search/ConciergeSearchDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          like. Eight active candidates, three watches, one comp, and the honest gap report on the
          energy fields the listing data did not disclose.
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
