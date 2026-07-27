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
  const [imgError, setImgError] = useState(false);

  // The buyer needs a face to the address. A photo plus a one-tap link to the
  // full gallery beats a wall of details they can't picture. Falls back to a
  // branded panel if the photo URL is missing or fails to load.
  const galleryUrl = property.sourceUrl || property.photoUrl || null;
  const showPhoto = Boolean(property.photoUrl) && !imgError;

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
      {/* Photo (gives the address a face + a one-tap link to the full gallery) */}
      {galleryUrl && (
        <a
          href={galleryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[16/9] bg-deep-teal/[0.06] group focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          aria-label={`See all photos for ${property.address}`}
        >
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- external listing CDN, arbitrary domains; next/image remotePatterns can't enumerate them
            <img
              src={property.photoUrl as string}
              alt={`${property.address}, ${property.city}`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-deep-teal/40 text-sm tracking-wide">
                Photo on the listing
              </span>
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-deep-teal/70 to-transparent" />
          <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-ivory bg-deep-teal/70 group-hover:bg-deep-teal px-3 py-1.5 rounded-md transition-colors">
            See all photos
          </span>
        </a>
      )}

      {/* Header */}
      <header className="bg-deep-teal/[0.04] px-6 sm:px-8 py-5 border-b border-deep-teal/10">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold mb-1">
              {[
                property.daysOnMarket !== null ? `${property.daysOnMarket} days on market` : null,
                property.mlsNumber ? `MLS ${property.mlsNumber}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
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
              {[
                `${property.beds} bed`,
                `${property.baths} bath`,
                property.sqft ? `${property.sqft.toLocaleString()} sqft` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
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

      {/* Elementary School Read (buyer-stated priority). The sourced research
          makes the claim; MAMS never does. Renders only when the assigned
          school was resolved and a Read exists. Every datapoint carries a
          source link. */}
      {property.assignedElementary && typeof property.schoolRead === "number" && (
        <section className="px-6 sm:px-8 py-6 border-b border-deep-teal/10 bg-deep-teal/[0.04] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
                Elementary School Read
              </p>
              <p className="font-display text-lg text-deep-teal leading-tight">
                {property.assignedElementary.name}
              </p>
              <a
                href={property.assignedElementary.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-deep-teal/60 underline hover:text-gold-dark"
              >
                Zoned by {property.assignedElementary.source.label}
              </a>
            </div>
            <div className="shrink-0 text-center rounded-md border border-gold/40 bg-gold/10 px-3 py-2">
              <span className="font-display text-2xl text-deep-teal leading-none">
                {property.schoolRead}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-deep-teal/55 mt-0.5">
                out of 10
              </span>
            </div>
          </div>

          {property.schoolReadSummary && (
            <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
              {property.schoolReadSummary}
            </p>
          )}

          {property.schoolEvidence && property.schoolEvidence.length > 0 && (
            <ul className="space-y-2 pt-1">
              {property.schoolEvidence.map((e, i) => (
                <li key={i} className="border-l-2 border-gold/40 pl-4">
                  <p className="text-sm text-deep-teal/80 leading-relaxed">{e.point}</p>
                  <a
                    href={e.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-deep-teal/55 underline hover:text-gold-dark"
                  >
                    {e.source.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Lot Read (buyer-stated priority: terrain flatness + distance to
          neighboring structures). Same contract as the school lens above. The
          sourced parcel and elevation data makes the claim; MAMS never does.
          Renders only when a Read was actually computed for this address. */}
      {typeof property.lotRead === "number" && (
        <section className="px-6 sm:px-8 py-6 border-b border-deep-teal/10 bg-deep-teal/[0.04] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
                Lot Read
              </p>
              <p className="font-display text-lg text-deep-teal leading-tight">
                {property.lotSizeLabel ?? "Flatness and spacing"}
              </p>
            </div>
            <div className="shrink-0 text-center rounded-md border border-gold/40 bg-gold/10 px-3 py-2">
              <span className="font-display text-2xl text-deep-teal leading-none">
                {property.lotRead}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-deep-teal/55 mt-0.5">
                out of 10
              </span>
            </div>
          </div>

          {property.lotReadSummary && (
            <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
              {property.lotReadSummary}
            </p>
          )}

          {property.lotEvidence && property.lotEvidence.length > 0 && (
            <ul className="space-y-2 pt-1">
              {property.lotEvidence.map((e, i) => (
                <li key={i} className="border-l-2 border-gold/40 pl-4">
                  <p className="text-sm text-deep-teal/80 leading-relaxed">{e.point}</p>
                  <a
                    href={e.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-deep-teal/55 underline hover:text-gold-dark"
                  >
                    {e.source.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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
