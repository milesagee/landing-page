import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getConciergeContact, markShareViewed } from "@/lib/ghl-concierge";
import { PropertyCardV2, parseV2 } from "@/components/concierge/PropertyCardV2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your Curated Shortlist | MAMS Move-In Concierge",
  robots: { index: false, follow: false },
};

export default async function ConciergeSharePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();

  const contact = await getConciergeContact(contactId);
  if (!contact) notFound();
  if (!contact.shareToken || contact.shareToken !== t) notFound();
  if (!contact.shortlistHtml && !contact.shortlistV2Json) notFound();

  // Fire-and-forget; do not await — keeps page render fast.
  void markShareViewed(contactId, contact.shareViewedAt);

  const firstName = contact.firstName || "there";
  const v2 = parseV2(contact.shortlistV2Json);

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
              Move-In Concierge
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-picked for you
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {firstName}, here&rsquo;s your shortlist.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Curated Richmond rentals matched to what you told us. Built from MAMS market intelligence
          you won&rsquo;t find on the public listing sites.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-12">
        {v2 && v2.properties.length > 0 ? (
          v2.properties.map((p, i) => <PropertyCardV2 key={p.slug || i} property={p} />)
        ) : contact.shortlistHtml ? (
          <div
            className="rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: contact.shortlistHtml }}
          />
        ) : null}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl text-deep-teal mb-3">What happens next</h2>
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>
              Look through the shortlist. Note any you want to tour and any you want to rule out.
            </li>
            <li>
              Reply to {firstName === "there" ? "the email" : `the email Miles just sent ${firstName}`} with the ones that caught your eye, and Chosen
              will line up tours and answer the management-company questions the listing sites
              won&rsquo;t.
            </li>
            <li>
              If you want us all the way through the lease, that&rsquo;s the move-in concierge: tours,
              application, lease read, keys. If you want to take it from here, the intel above is
              yours either way.
            </li>
          </ol>
        </div>
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {firstName}. The link is tied to your account, so please keep it to yourself.
          </p>
          <p>
            Reach Miles directly:{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>{" "}
            &middot; Miles Agee, Realtor, Samson Properties / OneSouth Realty team.
          </p>
        </div>
      </footer>
    </main>
  );
}
