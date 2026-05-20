import type { Metadata } from "next";
import Image from "next/image";
import { PlanReview } from "@/components/anika/PlanReview";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "For Anika",
  robots: { index: false, follow: false },
};

export default function AnikaPlanPage() {
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
            <div className="font-display text-ivory text-lg leading-none">
              For Anika
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gold-dark mt-0.5">
              From Monique
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Built for you tonight
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          Anika, this is the plan we built tonight, side by side.
        </h1>
        <p className="mt-4 text-base text-deep-teal/75 leading-relaxed max-w-2xl">
          Read it on your time. Tell me where I missed you. The voice capture caught your words in fragments, and I want what the words could not carry. Push back on anything that does not feel right. Add anything you would have said if there were no buttons in the way.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pt-6 pb-10">
        <div className="border-l-2 border-gold/50 pl-5 py-2">
          <p className="text-sm text-deep-teal/85 leading-relaxed">
            The thesis is simple. Nursing compresses because the parts that already work get sharper. AG Home Buyers becomes easy mode because you got time back from nursing, not because you added a second job. The August deal is the system's forcing function. Not your daily pressure.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <PlanReview />
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            This page was built for you, Anika. It is not on the menu of mamsnow.com. Only people you share the link with can find it.
          </p>
          <p>
            Monique reads what you write. The plan v2 lands tomorrow, in your dashboard with your own algorithm, scoreboard, trap library, and system map already loaded.
          </p>
        </div>
      </footer>
    </main>
  );
}
