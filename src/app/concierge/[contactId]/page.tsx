import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getConciergeContact, markShareViewed } from "@/lib/ghl-concierge";

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
  if (!contact.shortlistHtml) notFound();

  // Fire-and-forget; do not await — keeps page render fast.
  void markShareViewed(contactId, contact.shareViewedAt);

  const firstName = contact.firstName || "there";

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
          {firstName}, here's your shortlist.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Curated Richmond rentals matched to what you told us. Built from MAMS market intelligence
          you won't find on the public listing sites.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div
          className="rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: contact.shortlistHtml }}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl text-deep-teal mb-3">What happens next</h2>
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>
              Look through the shortlist. Note any you want to tour or rule out.
            </li>
            <li>
              Chosen on our team will reach out within a business day to schedule tours and answer
              questions on management companies, fees, and the things the listing sites don't tell you.
            </li>
            <li>
              When you're ready to write an application, MAMS handles the leasing legwork end-to-end —
              transparent fee, full representation, no surprises.
            </li>
          </ol>
        </div>
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            This shortlist was prepared privately for {firstName}. Please don't share this link
            publicly — it's tied to your account.
          </p>
          <p>
            Questions?{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>{" "}
            &middot; MAMS — Miles Agee, Realtor, Samson Properties / OneSouth Realty team.
          </p>
        </div>
      </footer>
    </main>
  );
}
