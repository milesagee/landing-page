"use client";

import type { ListingProperty } from "@/lib/listing-activity-data";

export function DispoSummary({ data }: { data: ListingProperty }) {
  const dom = daysOnMarket(data.property.listingDate);

  return (
    <div className="space-y-6">
      {/* Pace snapshot */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Pace
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <Stat label="Days on market" value={`${dom}`} sub={`Listed ${formatDate(data.property.listingDate)}`} />
            <Stat label="List price" value={`$${data.property.listPrice.toLocaleString()}`} sub={`MLS ${data.property.mlsNumber}`} />
            <Stat label="Showing requests" value={`${data.activity.showingRequestsTotal}`} sub="in 5 days" accent />
            <Stat label="Tours completed" value={`${data.activity.showingsCompleted}`} sub="ERA buyer, Saturday 5/16" />
            <Stat label="Tours scheduled" value={`${data.activity.showingsScheduled}`} sub="Same buyer returning 5/19 1:30 PM" />
            <Stat label="Accept ratio" value={`${data.activity.showingRequestsAccepted}/${data.activity.showingRequestsTotal}`} sub="Seller logistics in play" />
          </div>
        </div>
      </section>

      {/* Request log */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Request log
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-2 text-sm">
          {data.activity.showingRequestLog.map((r, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-3 py-2 border-b border-deep-teal/5 last:border-b-0"
            >
              <div className="flex-1">
                <span className="text-deep-teal/55 text-xs tabular-nums mr-3">
                  {formatDate(r.date)}
                </span>
                <span className="text-deep-teal/85">{r.context}</span>
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.12em] font-semibold px-2 py-1 rounded ${
                  r.outcome === "accepted"
                    ? "bg-gold/15 text-gold-dark"
                    : "bg-deep-teal/8 text-deep-teal/60"
                }`}
              >
                {r.outcome === "accepted" ? "Accepted" : "Blocked"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      {data.upcomingShowings.length > 0 && (
        <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
              On the calendar
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

      {/* Seller availability status */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Seller availability
          </p>
        </div>
        <div className="p-6 sm:p-8">
          {data.sellerAvailability ? (
            <>
              <p className="text-sm text-deep-teal/85 mb-3">
                Madeline submitted her windows on{" "}
                {new Date(data.sellerAvailability.submittedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                . Buyer agents now get the windows below:
              </p>
              <ul className="text-sm text-deep-teal/85 space-y-1">
                {data.sellerAvailability.windows.map((w, i) => (
                  <li key={i}>&middot; {w}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-deep-teal/85">
              Self-service availability picker shipped to the seller today. We&rsquo;ll have her windows
              locked in shortly - giving us clean broadcast slots for the buyer agents in play.
            </p>
          )}
        </div>
      </section>

      {/* Miles to Luis note */}
      <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
        <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
            Miles&rsquo;s read
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
            {data.milesNoteDispo.headline}
          </p>
          <div className="space-y-3 text-sm sm:text-base text-ivory/85 leading-relaxed">
            {data.milesNoteDispo.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Property facts */}
      <section className="bg-paper rounded-lg border border-deep-teal/10 p-6 sm:p-8 space-y-3 text-sm text-deep-teal/75">
        <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold">
          Listing on file
        </p>
        <p>
          {data.property.address}, {data.property.city} {data.property.state} {data.property.zip}{" "}
          &middot; MLS {data.property.mlsNumber} &middot; Listed {formatDate(data.property.listingDate)} &middot; $
          {data.property.listPrice.toLocaleString()}
        </p>
        <p className="text-xs text-deep-teal/55">
          {data.property.propertyNotes.join(" &middot; ")}
        </p>
        <p className="text-xs text-deep-teal/55">
          HOA: {data.property.hoa.name} - ${data.property.hoa.fee} paid through{" "}
          {data.property.hoa.paidThrough}
        </p>
      </section>
    </div>
  );
}

function Stat({
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
        className={`font-display text-2xl leading-none ${
          accent ? "text-gold-dark" : "text-deep-teal"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-deep-teal/60 mt-1">{sub}</p>}
    </div>
  );
}

function daysOnMarket(listingDate: string): number {
  const list = new Date(listingDate + "T12:00:00");
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - list.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatShowingDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) + " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
