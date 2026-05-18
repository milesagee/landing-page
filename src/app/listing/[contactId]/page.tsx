import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getListingByToken } from "@/lib/listing-activity-data";
import { SellerDashboard } from "@/components/listing/SellerDashboard";
import { DispoSummary } from "@/components/listing/DispoSummary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your listing | MAMS",
  robots: { index: false, follow: false },
};

export default async function ListingSharePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const result = getListingByToken(contactId, t);
  if (!result) notFound();

  const { viewer, property } = result;
  const firstName =
    viewer.viewerType === "seller" ? property.sellerFirstName : property.dispoContactName;

  const tagline =
    viewer.viewerType === "seller" ? "Listing Concierge" : "Listing Update";

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
          {viewer.viewerType === "seller" ? `Hand-prepared for ${firstName}` : `Update for ${firstName}`}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {viewer.viewerType === "seller"
            ? `${firstName}, here's everything on Quest Court.`
            : `${property.property.address} - through Day ${daysOnMarket(property.property.listingDate)}.`}
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          {viewer.viewerType === "seller"
            ? "Your listing in one place: what's happening, what the market is telling us, and what we do next. The week ahead is yours to shape."
            : `Listing activity, current buyer pipeline, and where we go from here on ${property.property.address}, ${property.property.city} ${property.property.state}.`}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        {viewer.viewerType === "seller" ? (
          <SellerDashboard data={property} shareToken={t!} contactId={contactId} />
        ) : (
          <DispoSummary data={property} />
        )}
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

function daysOnMarket(listingDate: string): number {
  const list = new Date(listingDate + "T12:00:00");
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - list.getTime()) / (1000 * 60 * 60 * 24)));
}
