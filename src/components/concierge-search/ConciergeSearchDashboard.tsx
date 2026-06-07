"use client";

import { useState } from "react";
import Script from "next/script";
import type {
  JosephusSearchData,
  Property,
  Viewer,
} from "@/lib/josephus-concierge-search-data";

const BOOKING_WIDGET_URL = "https://api.leadconnectorhq.com/widget/booking/OGeuwB3XL6klvQFHG5Bj";

type ActionState = "idle" | "pending" | "done" | "error";
type Rating = "love" | "maybe" | "hide";

type PropertyState = {
  rating?: Rating;
  note: string;
  tourRequested: boolean;
  submitState: ActionState;
  submitError?: string;
};

const TIER_LABEL: Record<Property["tier"], string> = {
  tier1: "Tier 1 · Tour first",
  tier2: "Tier 2 · Verify, then tour",
  watch: "Watch / Comp",
};

const STATUS_LABEL: Record<Property["status"], string> = {
  active: "Active",
  "coming-soon": "Coming soon",
  pending: "Pending",
  "status-conflict": "Status conflict",
  comp: "Comp",
};

const STATUS_TONE: Record<Property["status"], string> = {
  active: "bg-gold/20 text-deep-teal",
  "coming-soon": "bg-deep-teal/10 text-deep-teal",
  pending: "bg-deep-teal/[0.05] text-deep-teal/60",
  "status-conflict": "bg-gold/30 text-deep-teal",
  comp: "bg-deep-teal/[0.05] text-deep-teal/60",
};

export function ConciergeSearchDashboard({
  data,
  viewer,
  shareToken,
  contactId,
}: {
  data: JosephusSearchData;
  viewer: Viewer;
  shareToken: string;
  contactId: string;
}) {
  const [propertyState, setPropertyState] = useState<Record<string, PropertyState>>(() => {
    const init: Record<string, PropertyState> = {};
    for (const p of data.properties) {
      init[p.slug] = { note: "", tourRequested: false, submitState: "idle" };
    }
    return init;
  });

  const [generalNote, setGeneralNote] = useState("");
  const [generalState, setGeneralState] = useState<ActionState>("idle");

  const [shareEmail, setShareEmail] = useState("");
  const [shareState, setShareState] = useState<ActionState>("idle");
  const [shareError, setShareError] = useState<string | undefined>();

  const tier1 = data.properties.filter((p) => p.tier === "tier1");
  const tier2 = data.properties.filter((p) => p.tier === "tier2");
  const watch = data.properties.filter((p) => p.tier === "watch");

  async function submitProperty(slug: string, action: "rate" | "tour-request") {
    const state = propertyState[slug];
    setPropertyState((s) => ({
      ...s,
      [slug]: { ...s[slug], submitState: "pending", submitError: undefined },
    }));
    try {
      const res = await fetch(`/api/concierge-search/${contactId}/submit?t=${shareToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          propertySlug: slug,
          viewerType: viewer.viewerType,
          payload: {
            rating: state.rating,
            note: state.note,
            tourRequested: action === "tour-request" ? true : state.tourRequested,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "submit failed");
      setPropertyState((s) => ({
        ...s,
        [slug]: {
          ...s[slug],
          submitState: "done",
          tourRequested: action === "tour-request" ? true : s[slug].tourRequested,
        },
      }));
    } catch (err) {
      setPropertyState((s) => ({
        ...s,
        [slug]: {
          ...s[slug],
          submitState: "error",
          submitError: (err as Error).message,
        },
      }));
    }
  }

  async function submitGeneralNote() {
    if (!generalNote.trim()) return;
    setGeneralState("pending");
    try {
      const res = await fetch(`/api/concierge-search/${contactId}/submit?t=${shareToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "general-note",
          viewerType: viewer.viewerType,
          payload: { note: generalNote },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "submit failed");
      setGeneralState("done");
    } catch {
      setGeneralState("error");
    }
  }

  async function shareWithDominique() {
    if (!shareEmail.trim() || !shareEmail.includes("@")) {
      setShareError("Need a valid email");
      setShareState("error");
      return;
    }
    setShareState("pending");
    setShareError(undefined);
    try {
      const res = await fetch(
        `/api/concierge-search/${contactId}/share-with-dominique?t=${shareToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerEmail: shareEmail }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "send failed");
      setShareState("done");
    } catch (err) {
      setShareState("error");
      setShareError((err as Error).message);
    }
  }

  function updateRating(slug: string, rating: Rating) {
    setPropertyState((s) => ({ ...s, [slug]: { ...s[slug], rating } }));
  }

  function updateNote(slug: string, note: string) {
    setPropertyState((s) => ({ ...s, [slug]: { ...s[slug], note } }));
  }

  return (
    <div className="space-y-6">
      {/* Miles's note */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            From Miles
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl text-deep-teal leading-tight mb-4">
            {data.milesNote.headline}
          </h2>
          {data.milesNote.body.map((p, i) => (
            <p key={i} className="text-base text-deep-teal/80 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Equity Snapshot — the implicit-seller move */}
      <section className="bg-white rounded-lg border border-gold/40 overflow-hidden">
        <div className="bg-gold/10 px-6 sm:px-8 py-4 border-b border-gold/30">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Equity Snapshot
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-3">
          <p className="text-sm text-deep-teal/60">{data.equitySnapshot.currentAddress}</p>
          <p className="text-base text-deep-teal/85 leading-relaxed">
            {data.equitySnapshot.solarAddedNote}
          </p>
          <p className="text-base text-deep-teal/85 leading-relaxed font-medium">
            {data.equitySnapshot.bandTopLine}
          </p>
          <p className="text-sm text-deep-teal/65 leading-relaxed italic">
            {data.equitySnapshot.bridgeLine}
          </p>
        </div>
      </section>

      {/* Criteria card */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What we&rsquo;re solving for
          </p>
        </div>
        <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <Stat
            label="Target"
            value={`$${(data.criteria.budgetTarget / 1000).toFixed(0)}K`}
            sub={`Ceiling $${(data.criteria.budgetCeiling / 1000).toFixed(0)}K`}
          />
          <Stat label="Main house" value={`${data.criteria.bedsMain}+ BR / ${data.criteria.bathsMain} BA`} sub={`${data.criteria.mainFloorSqftFloor}+ sqft main`} />
          <Stat label="Move-in" value={data.moveInDeadline} sub="On the clock" />
          <div className="col-span-2 sm:col-span-3 text-sm text-deep-teal/75 leading-relaxed">
            <span className="font-semibold text-deep-teal">Geo:</span> {data.criteria.geoLine}
          </div>
          <div className="col-span-2 sm:col-span-3 text-sm text-deep-teal/75 leading-relaxed">
            <span className="font-semibold text-deep-teal">Suite:</span> {data.criteria.suiteLine}
          </div>
        </div>
      </section>

      {/* Tier 1 */}
      <PropertyTier
        label={TIER_LABEL.tier1}
        properties={tier1}
        propertyState={propertyState}
        updateRating={updateRating}
        updateNote={updateNote}
        submitProperty={submitProperty}
        accent
      />

      {/* Tier 2 */}
      <PropertyTier
        label={TIER_LABEL.tier2}
        properties={tier2}
        propertyState={propertyState}
        updateRating={updateRating}
        updateNote={updateNote}
        submitProperty={submitProperty}
      />

      {/* Watch / Comp — compact */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            {TIER_LABEL.watch}
          </p>
          <p className="text-xs text-deep-teal/55 mt-1">
            What we ruled out, why, and the one comp that sets the Henrico price pressure.
          </p>
        </div>
        <div className="divide-y divide-deep-teal/10">
          {watch.map((p) => (
            <div key={p.slug} className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-deep-teal text-sm">
                    {p.address}, {p.city}
                  </p>
                  <p className="text-xs text-deep-teal/60 mt-0.5">
                    {p.zip} &middot; {STATUS_LABEL[p.status]}
                    {p.price > 0 ? ` · $${p.price.toLocaleString()}` : ""}
                  </p>
                </div>
                <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded ${STATUS_TONE[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-sm text-deep-teal/80 leading-relaxed mt-2">{p.whyItMatters}</p>
              {p.caveat && (
                <p className="text-xs text-deep-teal/65 leading-relaxed mt-1.5 italic">
                  {p.caveat}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Honest gap report */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What the listings don&rsquo;t tell us
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-sm text-deep-teal/80 leading-relaxed mb-4">
            The listing platforms do not surface the energy-readiness data you asked for. That is a
            platform gap, not a research gap. We verify these on tour day at the panel, the roof,
            and the meter:
          </p>
          <ul className="space-y-2 text-sm text-deep-teal/75 leading-relaxed list-disc pl-5">
            {data.fieldsNotDisclosed.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* General note */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Anything else
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-3">
          <p className="text-sm text-deep-teal/75 leading-relaxed">
            Questions, calibration on the criteria, a neighborhood we should add, drop it here. Goes
            straight to Miles.
          </p>
          <textarea
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-deep-teal/20 bg-paper px-3 py-2 text-sm text-deep-teal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            placeholder="Tell us what we&rsquo;re missing."
          />
          <button
            onClick={submitGeneralNote}
            disabled={generalState === "pending" || generalState === "done" || !generalNote.trim()}
            className="rounded-md bg-deep-teal text-ivory px-4 py-2 text-sm font-medium hover:bg-deep-teal/90 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {generalState === "pending"
              ? "Sending..."
              : generalState === "done"
                ? "Sent to Miles"
                : generalState === "error"
                  ? "Try again"
                  : "Send to Miles"}
          </button>
        </div>
      </section>

      {/* Share with partner — primary viewer only */}
      {viewer.viewerType === "primary" && (
        <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
              Share with {data.partnerFirstName}
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-3">
            <p className="text-sm text-deep-teal/75 leading-relaxed">
              Send {data.partnerFirstName} her own view of this page. Her ratings and notes route
              into the same record as yours, so we see both sides.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder={`${data.partnerFirstName.toLowerCase()}@example.com`}
                className="flex-1 rounded-md border border-deep-teal/20 bg-paper px-3 py-2 text-sm text-deep-teal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              />
              <button
                onClick={shareWithDominique}
                disabled={shareState === "pending" || shareState === "done"}
                className="rounded-md bg-gold text-deep-teal px-4 py-2 text-sm font-semibold hover:bg-gold/85 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {shareState === "pending"
                  ? "Sending..."
                  : shareState === "done"
                    ? `Sent to ${data.partnerFirstName}`
                    : "Send her link"}
              </button>
            </div>
            {shareError && (
              <p className="text-xs text-deep-teal/70 leading-relaxed">{shareError}</p>
            )}
          </div>
        </section>
      )}

      {/* What happens next */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What happens next
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>
              Rate the Tier 1 and Tier 2 candidates. Hide what doesn&rsquo;t fit. Request a tour on
              anything you want eyes on.
            </li>
            <li>
              When the timing&rsquo;s right, grab a slot on the calendar below. We talk through the
              survivors and answer anything that came up on the page.
            </li>
            <li>
              If a property earns a tour, we go in person. Energy verification happens at the panel
              and the meter when we&rsquo;re there.
            </li>
            <li>
              Troy listing prep is a separate conversation. When you&rsquo;re ready, we run the
              Equity Snapshot in full.
            </li>
          </ol>
        </div>
      </section>

      {/* Book a call — inline slot picker, self-serve */}
      <section className="rounded-lg overflow-hidden border border-deep-teal/15">
        <div className="bg-deep-teal text-ivory p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold mb-2">
            Book a call
          </p>
          <h3 className="font-display text-xl sm:text-2xl text-ivory leading-tight">
            {viewer.viewerType === "primary"
              ? `When the timing's right for you and ${data.partnerFirstName}.`
              : "When the timing works for you."}
          </h3>
          <p className="text-sm text-ivory/75 mt-2 leading-relaxed">
            Grab whatever window works. The slot picker is right here. No pressure to do it today.
          </p>
        </div>
        <div className="bg-white">
          <iframe
            src={BOOKING_WIDGET_URL}
            id="OGeuwB3XL6klvQFHG5Bj_concierge-search"
            title="Book a call with Miles"
            style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "640px" }}
            scrolling="no"
          />
          <Script
            src="https://link.msgsndr.com/js/form_embed.js"
            strategy="afterInteractive"
          />
        </div>
        <div className="bg-paper px-6 py-3 text-xs text-deep-teal/60 leading-relaxed border-t border-deep-teal/10">
          Slot picker not loading?{" "}
          <a
            href={BOOKING_WIDGET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gold-dark"
          >
            Open the calendar in a new tab
          </a>
          .
        </div>
      </section>
    </div>
  );
}

function PropertyTier({
  label,
  properties,
  propertyState,
  updateRating,
  updateNote,
  submitProperty,
  accent = false,
}: {
  label: string;
  properties: Property[];
  propertyState: Record<string, PropertyState>;
  updateRating: (slug: string, rating: Rating) => void;
  updateNote: (slug: string, note: string) => void;
  submitProperty: (slug: string, action: "rate" | "tour-request") => void;
  accent?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <p
          className={`text-xs uppercase tracking-[0.18em] font-semibold ${accent ? "text-gold-dark" : "text-deep-teal/60"}`}
        >
          {label}
        </p>
        <div className={`flex-1 h-px ${accent ? "bg-gold/30" : "bg-deep-teal/10"}`} />
      </div>
      <div className="space-y-4">
        {properties.map((p) => (
          <PropertyCard
            key={p.slug}
            property={p}
            state={propertyState[p.slug]}
            onRate={(r) => updateRating(p.slug, r)}
            onNote={(n) => updateNote(p.slug, n)}
            onSubmit={(action) => submitProperty(p.slug, action)}
          />
        ))}
      </div>
    </section>
  );
}

function PropertyCard({
  property,
  state,
  onRate,
  onNote,
  onSubmit,
}: {
  property: Property;
  state: PropertyState;
  onRate: (r: Rating) => void;
  onNote: (n: string) => void;
  onSubmit: (action: "rate" | "tour-request") => void;
}) {
  const isHidden = state.rating === "hide";

  return (
    <article
      className={`bg-white rounded-lg border overflow-hidden transition-opacity duration-150 ${
        isHidden ? "opacity-50 border-deep-teal/10" : "border-deep-teal/15"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.15em] text-gold-dark font-semibold">
                #{property.rank}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded ${STATUS_TONE[property.status]}`}
              >
                {STATUS_LABEL[property.status]}
              </span>
            </div>
            <h3 className="font-display text-xl text-deep-teal leading-tight">
              {property.address}
            </h3>
            <p className="text-sm text-deep-teal/65 mt-0.5">
              {property.city}, VA {property.zip}
              {property.price > 0 ? ` · $${property.price.toLocaleString()}` : ""}
            </p>
          </div>
          {property.zillowUrl && (
            <a
              href={property.zillowUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-deep-teal/65 hover:text-gold-dark underline shrink-0"
            >
              Zillow &rarr;
            </a>
          )}
        </div>

        <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
          {property.whyItMatters}
        </p>

        {property.caveat && (
          <div className="mt-3 bg-paper border-l-2 border-gold px-4 py-2 rounded-r">
            <p className="text-xs uppercase tracking-[0.12em] text-gold-dark font-semibold mb-1">
              Tour-day verify
            </p>
            <p className="text-sm text-deep-teal/80 leading-relaxed">{property.caveat}</p>
          </div>
        )}

        <details className="mt-4">
          <summary className="text-xs uppercase tracking-[0.15em] text-deep-teal/60 font-semibold cursor-pointer hover:text-gold-dark">
            Energy intel
          </summary>
          <dl className="mt-3 space-y-1.5 text-xs">
            <EnergyRow label="Existing solar" value={property.energy.existingSolar} />
            <EnergyRow label="EV charger" value={property.energy.evCharger} />
            <EnergyRow label="Panel amperage" value={property.energy.panelAmperage} />
            <EnergyRow label="Electrification" value={property.energy.electrificationStatus} />
            <EnergyRow label="Est. monthly utility" value={property.energy.estMonthlyUtilityCost} />
          </dl>
          {property.energy.energyNotes && (
            <p className="text-xs text-deep-teal/70 leading-relaxed mt-3 italic">
              {property.energy.energyNotes}
            </p>
          )}
        </details>

        <div className="mt-5 pt-4 border-t border-deep-teal/10 space-y-3">
          <div className="flex flex-wrap gap-2">
            <RatingButton
              active={state.rating === "love"}
              onClick={() => onRate("love")}
              label="Love it"
              tone="love"
            />
            <RatingButton
              active={state.rating === "maybe"}
              onClick={() => onRate("maybe")}
              label="Maybe"
              tone="maybe"
            />
            <RatingButton
              active={state.rating === "hide"}
              onClick={() => onRate("hide")}
              label="Hide"
              tone="hide"
            />
          </div>
          <textarea
            value={state.note}
            onChange={(e) => onNote(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-deep-teal/15 bg-paper px-3 py-2 text-sm text-deep-teal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            placeholder="Any notes on this one?"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSubmit("rate")}
              disabled={state.submitState === "pending" || (!state.rating && !state.note.trim())}
              className="rounded-md bg-deep-teal text-ivory px-4 py-2 text-sm font-medium hover:bg-deep-teal/90 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {state.submitState === "pending"
                ? "Saving..."
                : state.submitState === "done"
                  ? "Saved"
                  : "Save"}
            </button>
            <button
              onClick={() => onSubmit("tour-request")}
              disabled={state.submitState === "pending" || state.tourRequested}
              className="rounded-md bg-gold text-deep-teal px-4 py-2 text-sm font-semibold hover:bg-gold/85 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {state.tourRequested ? "Tour requested" : "Request a tour"}
            </button>
          </div>
          {state.submitError && (
            <p className="text-xs text-deep-teal/70 leading-relaxed">{state.submitError}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function EnergyRow({ label, value }: { label: string; value: string }) {
  const isMissing = value === "not disclosed";
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-deep-teal/60 min-w-[110px]">{label}</dt>
      <dd className={isMissing ? "text-deep-teal/45 italic" : "text-deep-teal/85 font-medium"}>
        {value}
      </dd>
    </div>
  );
}

function RatingButton({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "love" | "maybe" | "hide";
}) {
  const baseTone = {
    love: active ? "bg-gold text-deep-teal" : "bg-paper text-deep-teal hover:bg-gold/15",
    maybe: active ? "bg-deep-teal text-ivory" : "bg-paper text-deep-teal hover:bg-deep-teal/10",
    hide: active ? "bg-deep-teal/30 text-deep-teal" : "bg-paper text-deep-teal/70 hover:bg-deep-teal/10",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold border border-deep-teal/15 transition-colors duration-150 ${baseTone[tone]}`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-deep-teal/55 font-semibold">
        {label}
      </div>
      <div className="font-display text-2xl text-deep-teal leading-tight mt-1">{value}</div>
      {sub && <div className="text-xs text-deep-teal/55 mt-0.5">{sub}</div>}
    </div>
  );
}
