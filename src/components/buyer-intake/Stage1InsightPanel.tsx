"use client";

import type { Stage1Insight, Stage1Response } from "@/lib/buyer-intake-data";

export function Stage1InsightPanel({
  firstName,
  stage1,
  eta,
  onReset,
}: {
  firstName: string;
  stage1: Stage1Response | null;
  eta: string;
  onReset: () => void;
}) {
  const nonEmptyInsights = (stage1?.insights ?? []).filter((i) => i.body && i.body.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Confirmation header */}
      <section className="bg-deep-teal text-ivory rounded-lg p-6 sm:p-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
          Locked in
        </p>
        <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
          {firstName}, your intake landed.
        </p>
        <p className="text-sm sm:text-base text-ivory/85 leading-relaxed">
          {stage1?.nextStepPromise ||
            `Your full curated dashboard lands ${eta}. Miles is on it.`}
        </p>
      </section>

      {/* Insight cards */}
      {nonEmptyInsights.length > 0 && (
        <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
              What we already see for you
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            {nonEmptyInsights.map((insight) => (
              <InsightCard key={insight.slot} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {/* What happens next */}
      <section className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
        <h3 className="font-display text-xl sm:text-2xl text-deep-teal mb-3">
          What happens next
        </h3>
        <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
          <li>
            Right now I&rsquo;m pulling the inventory the public sites aren&rsquo;t surfacing for your shape.
            Off-market signals, mispriced listings, the adjacent-neighborhood plays.
          </li>
          <li>
            Your curated dashboard lands {eta}. Each property comes with the reason MLS or Zillow buried it,
            three lifestyle anchor matches with addresses, and the honest trade-off line.
          </li>
          <li>
            Reply to that drop with the ones that caught your eye, and we line up tours. If something shifts
            on your end before then, just text Miles.
          </li>
        </ol>
      </section>

      {/* Footer note */}
      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-deep-teal/60 underline hover:text-gold-dark"
        >
          Update my answers
        </button>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Stage1Insight }) {
  return (
    <div className="border-l-2 border-gold/40 pl-5">
      {insight.eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1.5">
          {insight.eyebrow}
        </p>
      )}
      {insight.headline && (
        <p className="font-display text-lg sm:text-xl text-deep-teal leading-tight mb-2">
          {insight.headline}
        </p>
      )}
      <p className="text-sm sm:text-base text-deep-teal/80 leading-relaxed">{insight.body}</p>
    </div>
  );
}
