import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getStatusByToken } from "@/lib/walker-status-data";
import { WalkerStatus } from "@/components/status/WalkerStatus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your closing | MAMS",
  robots: { index: false, follow: false },
};

function daysUntil(iso: string): number {
  const target = new Date(iso + "T12:00:00");
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const data = getStatusByToken(contactId, t);
  if (!data) notFound();

  const days = daysUntil(data.closeDate);

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
              Closing Concierge
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-prepared for {data.firstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {data.firstName}, here&rsquo;s where {data.property.address} stands.
        </h1>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          {data.headline} {days > 0 && `Close is in ${days} day${days === 1 ? "" : "s"}.`}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <WalkerStatus data={data} shareToken={t!} contactId={contactId} />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {data.firstName}. The link is tied to you, so please keep it to
            yourself.
          </p>
          <p>
            Miles direct:{" "}
            <a
              href="mailto:miles@mamsnow.com"
              className="underline hover:text-gold-dark"
            >
              miles@mamsnow.com
            </a>{" "}
            &middot; Miles Agee, Realtor, Samson Properties.
          </p>
        </div>
      </footer>
    </main>
  );
}
