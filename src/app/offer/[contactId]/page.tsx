import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getOfferByToken } from "@/lib/offer-data";
import { OfferDashboard } from "@/components/offer/OfferDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your offers | MAMS",
  robots: { index: false, follow: false },
};

export default async function OfferSharePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const data = getOfferByToken(contactId, t);
  if (!data) notFound();

  const liveOffers = data.offers.filter((o) => o.status !== "ghost");
  const offerCount = liveOffers.length;
  const offerCountLabel =
    offerCount === 1 ? "an offer" : `${offerCount} offers`;
  const latestReceived = liveOffers
    .map((o) => o.receivedAt)
    .sort()
    .slice(-1)[0];
  const latestReceivedLabel = new Date(
    latestReceived + "T12:00:00",
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
              Listing Concierge
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-prepared for {data.sellerFirstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {data.sellerFirstName}, you have {offerCountLabel}.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Latest landed {latestReceivedLabel} on {data.property.address}. Here is the whole picture side by side: who they are, what they are asking, what each one puts in your pocket, and the move I am recommending before our Tuesday review window.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <OfferDashboard data={data} shareToken={t!} />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {data.sellerFirstName}. The link is tied to your account, so please keep it to yourself.
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
