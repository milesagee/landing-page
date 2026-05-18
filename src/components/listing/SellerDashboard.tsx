"use client";

import type { ListingProperty } from "@/lib/listing-activity-data";
import { AvailabilityPicker, type LockedWindow } from "./AvailabilityPicker";

export function SellerDashboard({
  data,
  shareToken,
  contactId,
}: {
  data: ListingProperty;
  shareToken: string;
  contactId: string;
}) {
  const dom = daysOnMarket(data.property.listingDate);

  const tomorrowDayKey = data.upcomingShowings[0]?.datetime
    ? new Date(data.upcomingShowings[0].datetime).toISOString().slice(0, 10)
    : undefined;
  const lockedWindows: LockedWindow[] = data.upcomingShowings
    .map((s) => {
      const dt = new Date(s.datetime);
      const hour = dt.getHours();
      const chip = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      return {
        dayKey: dt.toISOString().slice(0, 10),
        chip,
        label: s.agent,
      };
    });

  const startISO = (() => {
    const start = new Date();
    if (start.getHours() >= 17) {
      start.setDate(start.getDate() + 1);
    }
    start.setHours(12, 0, 0, 0);
    return start.toISOString();
  })();

  return (
    <div className="space-y-6">
      {/* Activity stats */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What&rsquo;s actually happening
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <BigStat label="Days on market" value={`${dom}`} sub={dom <= 7 ? "First week" : "Past first week"} />
            <BigStat label="Showing requests" value={`${data.activity.showingRequestsTotal}`} sub="in 5 days" accent />
            <BigStat label="Completed tours" value={`${data.activity.showingsCompleted}`} sub="Saturday 5/16" />
            <BigStat
              label="Scheduled"
              value={`${data.activity.showingsScheduled}`}
              sub={data.upcomingShowings[0] ? formatShowingDate(data.upcomingShowings[0].datetime) : "-"}
            />
            <BigStat
              label="Accepted"
              value={`${data.activity.showingRequestsAccepted}`}
              sub="of 6 requests"
            />
            <BigStat
              label="Turned down"
              value={`${data.activity.showingRequestsBlocked}`}
              sub="of 6 requests"
            />
          </div>
        </div>
      </section>

      {/* What this means */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What this means
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4 text-sm sm:text-base text-deep-teal/85 leading-relaxed">
          <Insight
            number={data.benchmarks.firstWeekShowingsPct}
            label="of all showings happen in the first 7 days"
            body={`Yorktown homes that sell quickly almost always do it from interest generated in the first week of listing. You're at Day ${dom}.`}
          />
          <Insight
            number="6 requests / 5 days"
            label="is well above average pace"
            body="Listings that field requests this fast typically sell within 2 weeks - when sellers say yes to the windows."
          />
          <Insight
            number={data.benchmarks.showingsToOfferAvg}
            label="for well-priced suburban homes"
            body="One tour in - one more locked. Repeat-visit buyers like the one Tuesday convert at a meaningfully higher rate."
          />
        </div>
      </section>

      {/* Upcoming showing */}
      {data.upcomingShowings.length > 0 && (
        <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
              Already on the calendar
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            {data.upcomingShowings.map((s, i) => (
              <div key={i} className="border-l-2 border-gold/40 pl-4">
                <p className="font-display text-lg text-deep-teal leading-tight">
                  {formatShowingDate(s.datetime)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold-dark font-semibold mb-2">
                  {s.agent}
                  {s.brokerage ? ` - ${s.brokerage}` : ""}
                </p>
                {s.buyerNotes && (
                  <p className="text-sm text-deep-teal/80 leading-relaxed">{s.buyerNotes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Miles's note */}
      <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
        <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
            Miles&rsquo;s read
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
            {data.milesNoteSeller.headline}
          </p>
          <div className="space-y-3 text-sm sm:text-base text-ivory/85 leading-relaxed">
            {data.milesNoteSeller.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Availability picker */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Your week
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="font-display text-xl text-deep-teal mb-2">
              Tap the windows that work for you.
            </p>
            <p className="text-sm text-deep-teal/70 leading-relaxed">
              Pick mornings, afternoons, or evenings for any day this week. Hit &ldquo;All day&rdquo; for a full open block. Once you submit, Wendy and I run with it.
            </p>
          </div>
          <AvailabilityPicker
            contactId={contactId}
            shareToken={shareToken}
            lockedWindows={lockedWindows}
            startISO={startISO}
            days={7}
          />
        </div>
      </section>

      {/* Property facts (small footer) */}
      <section className="bg-paper rounded-lg border border-deep-teal/10 p-6 sm:p-8 space-y-3 text-sm text-deep-teal/75">
        <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold">
          Listing on file
        </p>
        <p>
          {data.property.address}, {data.property.city} {data.property.state} {data.property.zip}{" "}
          &middot; MLS {data.property.mlsNumber} &middot; Listed{" "}
          {new Date(data.property.listingDate + "T12:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; ${data.property.listPrice.toLocaleString()}
        </p>
        <p className="text-xs text-deep-teal/55">
          {data.property.propertyNotes.join(" &middot; ")}
        </p>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold mb-1">
        {label}
      </p>
      <p
        className={`font-display text-3xl leading-none ${
          accent ? "text-gold-dark" : "text-deep-teal"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-deep-teal/60 mt-1">{sub}</p>}
    </div>
  );
}

function Insight({
  number,
  label,
  body,
}: {
  number: string;
  label: string;
  body: string;
}) {
  return (
    <div className="border-l-2 border-gold/40 pl-4">
      <p className="font-display text-lg text-deep-teal leading-tight">
        <span className="text-gold-dark font-semibold">{number}</span>{" "}
        <span className="text-deep-teal/80">{label}</span>
      </p>
      <p className="text-sm text-deep-teal/80 leading-relaxed mt-1">{body}</p>
    </div>
  );
}

function daysOnMarket(listingDate: string): number {
  const list = new Date(listingDate + "T12:00:00");
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - list.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatShowingDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) + " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
