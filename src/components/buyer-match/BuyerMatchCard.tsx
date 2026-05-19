"use client";

import { useState } from "react";
import type { BuyerMatchProperty } from "@/lib/buyer-match-data";

export function BuyerMatchCard({
  property,
  contactId,
  shareToken,
}: {
  property: BuyerMatchProperty;
  contactId: string;
  shareToken: string;
}) {
  const [interest, setInterest] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tellMore = async () => {
    setInterest("pending");
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/buyer-match/${contactId}/interest?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: property.slug, address: property.address }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not record interest");
      setInterest("done");
    } catch (e) {
      setInterest("error");
      setErrorMsg((e as Error).message);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      {/* Header */}
      <header className="bg-deep-teal/[0.04] px-6 sm:px-8 py-5 border-b border-deep-teal/10">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold mb-1">
              {property.daysOnMarket !== null ? `${property.daysOnMarket} days on market` : "Off-market"}
              {property.mlsNumber ? ` &middot; MLS ${property.mlsNumber}` : ""}
            </p>
            <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-tight">
              {property.address}
            </h3>
            <p className="text-sm text-deep-teal/70 mt-0.5">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-deep-teal leading-none">{property.priceLabel}</p>
            <p className="text-[11px] text-deep-teal/55 mt-1">
              {property.beds} bed &middot; {property.baths} bath
              {property.sqft ? ` &middot; ${property.sqft.toLocaleString()} sqft` : ""}
            </p>
          </div>
        </div>
      </header>

      {/* Gap-fill reason (the differentiator) */}
      <div className="px-6 sm:px-8 py-4 bg-gold/10 border-b border-gold/20">
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
          Why the public sites buried this for you
        </p>
        <p className="text-sm text-deep-teal/85 leading-relaxed">{property.gapFillReason}</p>
      </div>

      {/* Vibes */}
      {property.vibes && (
        <section className="px-6 sm:px-8 py-6 border-b border-deep-teal/10">
          <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">{property.vibes}</p>
        </section>
      )}

      {/* Anchors */}
      {property.anchors.length > 0 && (
        <section className="px-6 sm:px-8 py-6 border-b border-deep-teal/10 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
            What lines up
          </p>
          <ul className="space-y-3">
            {property.anchors.map((a, i) => (
              <li key={i} className="border-l-2 border-gold/40 pl-4">
                <p className="font-display text-base text-deep-teal leading-tight">{a.name}</p>
                <p className="text-xs text-deep-teal/65 mt-0.5">
                  {a.address} &middot; {a.distance}
                </p>
                <p className="text-[11px] text-deep-teal/60 mt-1 uppercase tracking-[0.12em]">
                  Matches: {a.matches}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Why this one + trade-off */}
      <section className="px-6 sm:px-8 py-6 space-y-4 border-b border-deep-teal/10">
        {property.whyThisOne && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
              Why this one for you
            </p>
            <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
              {property.whyThisOne}
            </p>
          </div>
        )}
        {property.tradeOff && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-deep-teal/55 font-semibold mb-1">
              Trade-off
            </p>
            <p className="text-sm sm:text-base text-deep-teal/75 leading-relaxed">
              {property.tradeOff}
            </p>
          </div>
        )}
      </section>

      {/* CTAs */}
      <footer className="px-6 sm:px-8 py-5 flex flex-wrap items-center gap-3">
        {property.sourceUrl && (
          <a
            href={property.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-deep-teal/80 underline hover:text-gold-dark"
          >
            See the listing
          </a>
        )}
        <button
          type="button"
          onClick={tellMore}
          disabled={interest === "pending" || interest === "done"}
          className={`ml-auto text-sm font-semibold px-5 py-2.5 rounded-md transition-colors ${
            interest === "done"
              ? "bg-gold/20 text-deep-teal cursor-default"
              : "bg-gold hover:bg-gold-dark text-deep-teal disabled:opacity-50"
          }`}
        >
          {interest === "done"
            ? "Miles will be in touch"
            : interest === "pending"
            ? "Sending..."
            : "Tell Miles more"}
        </button>
      </footer>
      {interest === "error" && errorMsg && (
        <p className="px-6 sm:px-8 pb-4 text-xs text-red-700">
          Something snagged: {errorMsg}. Text Miles directly and he&rsquo;ll catch it.
        </p>
      )}
    </article>
  );
}
