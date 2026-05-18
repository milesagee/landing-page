"use client";

import { useMemo, useState } from "react";
import type { OfferData } from "@/lib/offer-data";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  return `${date} at ${time}`;
};

export function OfferDashboard({ data, shareToken }: { data: OfferData; shareToken: string }) {
  const [payoff, setPayoff] = useState<number>(0);
  const [approveState, setApproveState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [approveError, setApproveError] = useState<string | null>(null);

  const onApprove = async () => {
    setApproveState("pending");
    setApproveError(null);
    try {
      const res = await fetch(
        `/api/offer/${data.contactId}/approve?t=${encodeURIComponent(shareToken)}`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Approval failed");
      }
      setApproveState("done");
    } catch (err) {
      setApproveState("error");
      setApproveError((err as Error).message);
    }
  };

  const scenarios = useMemo(() => {
    const build = (salesPrice: number) => {
      const grantorsTax = Math.ceil(salesPrice / 1000);
      const buyerBrokerComm = Math.round((salesPrice * data.offer.buyerBrokerCompPct) / 100);
      const listingBrokerComm = Math.round((salesPrice * data.offer.listingBrokerCompPct) / 100);
      const totalCommissionPct =
        data.offer.buyerBrokerCompPct + data.offer.listingBrokerCompPct;
      const closingAttorney = data.closingFees.closingAttorney;
      const transactionFee = data.closingFees.transactionFee;
      const termite = data.closingFees.termiteInspection;
      const releaseFee = payoff > 0 ? data.closingFees.releaseFeeIfLoan : 0;
      const concessionsCredit = data.offer.sellerConcessionsCredit;

      const totalExpenses =
        grantorsTax +
        buyerBrokerComm +
        listingBrokerComm +
        closingAttorney +
        transactionFee +
        termite +
        releaseFee +
        concessionsCredit +
        payoff;

      const net = salesPrice - totalExpenses;

      return {
        salesPrice,
        grantorsTax,
        buyerBrokerComm,
        listingBrokerComm,
        totalCommissionPct,
        closingAttorney,
        transactionFee,
        termite,
        releaseFee,
        concessionsCredit,
        payoff,
        totalExpenses,
        net,
      };
    };
    return {
      base: build(data.offer.basePrice),
      cap: build(data.offer.escalationCap),
    };
  }, [data, payoff]);

  return (
    <div className="space-y-6">
      {data.offer.offerExpiresAt && (
        <section className="bg-gold/15 border border-gold/40 rounded-lg px-5 py-4 flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-gold-dark mt-2 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark font-semibold">
              Acceptance deadline
            </p>
            <p className="font-display text-xl sm:text-2xl text-deep-teal leading-tight mt-1">
              {fmtDateTime(data.offer.offerExpiresAt)}
            </p>
            <p className="text-xs text-deep-teal/70 mt-1">
              Per Paragraph 27 of the contract, the offer expires if not ratified by this time.
            </p>
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The offer
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Stat label="Base price" value={fmtMoney(data.offer.basePrice)} />
            <Stat
              label="Escalation cap"
              value={fmtMoney(data.offer.escalationCap)}
              accent
            />
            <Stat label="Buyer" value={data.buyer.name} />
            <Stat
              label="Plans to live in it"
              value={data.buyer.occupancy === "owner-occupant" ? "Yes (owner-occupant)" : "No (investor)"}
            />
            <Stat label="Financing" value={data.offer.financingType} />
            <Stat
              label="Pre-approved by"
              value={`${data.buyer.lenderName}, ${data.buyer.lenderInstitution}`}
            />
            <Stat label="Earnest money" value={fmtMoney(data.offer.earnestMoney)} />
            <Stat
              label="Closing costs you cover"
              value={data.offer.sellerConcessionsCredit === 0 ? "None requested" : fmtMoney(data.offer.sellerConcessionsCredit)}
            />
            <Stat label="Settlement date" value={fmtDate(data.offer.settlementDate)} />
            <Stat label="Settlement agent" value={data.offer.settlementAgent} />
          </div>

          <div className="pt-2 text-sm text-deep-teal/70 leading-relaxed border-t border-deep-teal/10 space-y-2">
            <p>
              <span className="font-semibold text-deep-teal">How the escalation works:</span>{" "}
              If a competing offer comes in, this offer automatically rises{" "}
              {fmtMoney(data.offer.escalationStep)} above the highest one, capped at{" "}
              {fmtMoney(data.offer.escalationCap)}. No competitor, no escalation, and the price stays at {fmtMoney(data.offer.basePrice)}.
            </p>
            {!data.offer.offerExpiresAt && (
              <p>
                <span className="font-semibold text-deep-teal">No expiration:</span>{" "}
                They didn&rsquo;t set a deadline on the offer. That means we&rsquo;re not on their clock — we can take the time we need to respond on our terms.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The math
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label
              htmlFor="payoff"
              className="block text-xs uppercase tracking-[0.14em] text-deep-teal/60 font-semibold mb-2"
            >
              Your mortgage payoff
            </label>
            <div className="flex items-center gap-3">
              <span className="text-deep-teal/60 text-lg">$</span>
              <input
                id="payoff"
                type="number"
                inputMode="numeric"
                value={payoff || ""}
                onChange={(e) => setPayoff(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="flex-1 max-w-[200px] text-2xl font-semibold text-deep-teal border-b-2 border-deep-teal/20 focus:border-gold focus:outline-none py-1 bg-transparent"
              />
              <p className="text-xs text-deep-teal/50">Leave at 0 if free and clear</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScenarioCard
              label="If no competing offer"
              sub={`Sale at ${fmtMoney(scenarios.base.salesPrice)}`}
              s={scenarios.base}
            />
            <ScenarioCard
              label="If it escalates to the cap"
              sub={`Sale at ${fmtMoney(scenarios.cap.salesPrice)}`}
              s={scenarios.cap}
              accent
            />
          </div>

          <p className="text-xs text-deep-teal/55 leading-relaxed">
            Estimates only. Final numbers come from the settlement agent on closing day and can move a few hundred dollars in either direction (tax prorations, recording fees, payoff interest).
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The strings attached
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
          <Contingency
            title="Home inspection"
            sub={`${data.offer.inspectionDays} days from ratification`}
            body="Buyer hires their own inspector. If something turns up they can ask for repairs or a credit. You can say no, counter, or agree. If you can't land in the same place, either side can walk and they get their earnest money back."
          />
          <Contingency
            title="Appraisal"
            sub="Standard"
            body={`Since this is a financed offer, the lender's appraiser has to value the house at or above the contract price. If it comes in low, the buyer can either eat the difference in cash, ask you to drop to the appraised number, or walk. You're not on the hook to drop.`}
          />
          <Contingency
            title="Financing"
            sub={`${data.offer.financingType} • 15% down`}
            body={`Buyer is pre-approved by ${data.buyer.lenderName} at ${data.buyer.lenderInstitution} as of ${fmtDate(data.buyer.preApprovalDate)}. They have 7 days from ratification to formally apply and need a loan commitment by settlement. If financing falls through despite a good-faith effort, the contract dies and earnest money returns to them.`}
          />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The fine print
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4 text-sm text-deep-teal/80 leading-relaxed">
          <div>
            <p className="font-semibold text-deep-teal mb-1">Conveying with the house</p>
            <p>
              {data.offer.personalPropertyIncluded.join(", ")} (plus all standard fixtures like blinds, light fixtures, garage remotes, smoke detectors).
            </p>
          </div>
          <div>
            <p className="font-semibold text-deep-teal mb-1">Going AS-IS</p>
            <p>{data.offer.asIsItems.join(". ")}. Buyer takes those without warranty.</p>
          </div>
          <div>
            <p className="font-semibold text-deep-teal mb-1">Possession</p>
            <p>{data.offer.possession}. You hand over keys at closing.</p>
          </div>
        </div>
      </section>

      {data.milesNote && (
        <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
          <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
              Miles&rsquo;s read
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
              {data.milesNote.headline}
            </p>
            <div className="space-y-3 text-sm sm:text-base text-ivory/85 leading-relaxed">
              {data.milesNote.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-ivory/15">
              {approveState === "done" ? (
                <div className="bg-gold/15 border border-gold/40 rounded-md px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-gold font-semibold mb-1">
                    Got it
                  </p>
                  <p className="text-sm sm:text-base text-ivory leading-relaxed">
                    Miles is on it. He&rsquo;ll have the counter in front of Ronnie first thing in the morning and will call you before the 10 AM clock with where it lands.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-[0.14em] text-gold-dark font-semibold mb-3">
                    If you&rsquo;re in
                  </p>
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={approveState === "pending"}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-base px-6 py-3.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {approveState === "pending"
                      ? "Sending..."
                      : "Yes, run with this plan, Miles"}
                  </button>
                  <p className="text-[11px] text-ivory/60 mt-3 leading-relaxed">
                    Clicking this tells Miles you&rsquo;re good with the early-accept play. He drafts the counter to Ronnie immediately - nothing goes out until he hits send.
                  </p>
                  {approveError && (
                    <p className="text-xs text-red-300 mt-2">
                      Something snagged: {approveError}. Just call Miles directly.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What happens next
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>Read this tonight. Sit with it. Reach out when you have questions, not before.</li>
            <li>
              Call me early in the morning. My formal counter will be in Ronnie&rsquo;s inbox by 9:30 AM at the latest &mdash; well ahead of the 10 AM clock. By the time we talk, the ball&rsquo;s already in their court, and we decide together how to handle whatever comes back.
            </li>
            <li>
              Once it&rsquo;s ratified, the next 30 days run on rails: inspection within {data.offer.inspectionDays} days, appraisal ordered inside 15, settlement at Dankos and Gordan on {fmtDate(data.offer.settlementDate)}. I&rsquo;ll be in your ear the whole way.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold mb-1">
        {label}
      </p>
      <p
        className={`text-sm sm:text-base leading-snug ${
          accent ? "text-gold-dark font-semibold" : "text-deep-teal font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ScenarioCard({
  label,
  sub,
  s,
  accent,
}: {
  label: string;
  sub: string;
  accent?: boolean;
  s: {
    salesPrice: number;
    grantorsTax: number;
    buyerBrokerComm: number;
    listingBrokerComm: number;
    totalCommissionPct: number;
    closingAttorney: number;
    transactionFee: number;
    termite: number;
    releaseFee: number;
    concessionsCredit: number;
    payoff: number;
    totalExpenses: number;
    net: number;
  };
}) {
  const fmt = (n: number) => fmtMoney(n);
  return (
    <div
      className={`rounded-lg p-5 border ${
        accent
          ? "bg-deep-teal text-ivory border-deep-teal"
          : "bg-paper text-deep-teal border-deep-teal/10"
      }`}
    >
      <p
        className={`text-[10px] uppercase tracking-[0.14em] font-semibold mb-1 ${
          accent ? "text-gold" : "text-gold-dark"
        }`}
      >
        {label}
      </p>
      <p className={`text-xs ${accent ? "text-ivory/65" : "text-deep-teal/60"} mb-4`}>
        {sub}
      </p>
      <p
        className={`text-3xl font-display font-semibold mb-4 ${
          accent ? "text-ivory" : "text-deep-teal"
        }`}
      >
        {fmt(s.net)}
      </p>
      <p
        className={`text-[10px] uppercase tracking-[0.14em] font-semibold mb-2 ${
          accent ? "text-ivory/55" : "text-deep-teal/55"
        }`}
      >
        Net to you
      </p>

      <div
        className={`mt-4 pt-4 border-t space-y-1.5 text-xs ${
          accent ? "border-ivory/15" : "border-deep-teal/10"
        }`}
      >
        <Row k="Sale price" v={fmt(s.salesPrice)} accent={accent} bold />
        <Row
          k={`Real estate commissions (${s.totalCommissionPct}%)`}
          v={`- ${fmt(s.buyerBrokerComm + s.listingBrokerComm)}`}
          accent={accent}
        />
        <Row k="Closing attorney" v={`- ${fmt(s.closingAttorney)}`} accent={accent} />
        <Row k="VA grantor's tax" v={`- ${fmt(s.grantorsTax)}`} accent={accent} />
        <Row k="Transaction fee" v={`- ${fmt(s.transactionFee)}`} accent={accent} />
        <Row k="Termite inspection" v={`- ${fmt(s.termite)}`} accent={accent} />
        {s.releaseFee > 0 && (
          <Row k="Release fee" v={`- ${fmt(s.releaseFee)}`} accent={accent} />
        )}
        {s.concessionsCredit > 0 && (
          <Row
            k="Closing cost credit to buyer"
            v={`- ${fmt(s.concessionsCredit)}`}
            accent={accent}
          />
        )}
        {s.payoff > 0 && (
          <Row k="Mortgage payoff" v={`- ${fmt(s.payoff)}`} accent={accent} />
        )}
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  accent,
  bold,
}: {
  k: string;
  v: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`${accent ? "text-ivory/75" : "text-deep-teal/70"} ${bold ? "font-semibold" : ""}`}>
        {k}
      </span>
      <span
        className={`tabular-nums ${
          accent ? "text-ivory" : "text-deep-teal"
        } ${bold ? "font-semibold" : ""}`}
      >
        {v}
      </span>
    </div>
  );
}

function Contingency({
  title,
  sub,
  body,
}: {
  title: string;
  sub: string;
  body: string;
}) {
  return (
    <div className="border-l-2 border-gold/40 pl-4">
      <p className="font-display text-lg text-deep-teal leading-tight">{title}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-gold-dark font-semibold mb-2">
        {sub}
      </p>
      <p className="text-sm text-deep-teal/80 leading-relaxed">{body}</p>
    </div>
  );
}
