import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBuyerIntakeByToken } from "@/lib/buyer-intake-data";
import { BuyerIntakeWizard } from "@/components/buyer-intake/BuyerIntakeWizard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your search reset | MAMS Buyer Concierge",
  robots: { index: false, follow: false },
};

export default async function BuyerIntakePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const contact = getBuyerIntakeByToken(contactId, t);
  if (!contact) notFound();

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
              Buyer Concierge
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-prepared for {contact.firstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {contact.firstName}, reset your search the way it should have been built.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Five quick steps. By the time you finish I&rsquo;ll already be working on a curated list of
          Richmond inventory the public sites aren&rsquo;t surfacing for you. Your full breakdown lands
          tonight.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <BuyerIntakeWizard contactId={contactId} shareToken={t!} contact={contact} />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {contact.firstName}. The link is tied to you, so please keep it to yourself.
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
