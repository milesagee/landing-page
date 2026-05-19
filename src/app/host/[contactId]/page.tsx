import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getHostByToken } from "@/lib/host-data";
import { HostIntake } from "@/components/host/HostIntake";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your hosting briefing | MAMS",
  robots: { index: false, follow: false },
};

export default async function HostSharePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const data = getHostByToken(contactId, t);
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
              Your Auto-Pilot Briefing
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Hand-prepared for {data.firstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          Hey {data.firstName}. Let&rsquo;s put both your spots on autopilot.
        </h1>
        <p className="mt-3 text-base text-deep-teal/75 leading-relaxed max-w-2xl">
          {data.closingTimeframeLabel} we closed {data.closingAddress}. Now we get both your properties running fully hands-off, generating income on their own, with MAMS coordinating every moving piece behind the scenes.
        </p>
        <p className="mt-3 text-base text-deep-teal/70 leading-relaxed max-w-2xl">
          Before I build your autopilot game plan, I want it shaped around how <em>you</em> want this run, not a generic template. Two property cards below, one per spot. Takes you under five minutes.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <HostIntake data={data} shareToken={t!} />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {data.firstName}. The link is tied to your account, so please keep it to yourself.
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
