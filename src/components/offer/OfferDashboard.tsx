"use client";

import { useMemo, useState, useEffect } from "react";
import type { OfferContactData, OfferRecord } from "@/lib/offer-data";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const fmtDateShort = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
  return `${date} at ${time} ET`;
};

function useCountdown(targetIso: string) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  const totalMin = Math.floor(diff / 60_000);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m from now`;
  }
  if (totalMin > 0) return `${totalMin}m from now`;
  return "Window closed";
}

export function OfferDashboard({
  data,
  shareToken,
}: {
  data: OfferContactData;
  shareToken: string;
}) {
  const [payoff, setPayoff] = useState<number>(0);
  const [activeOfferId, setActiveOfferId] = useState<string>(
    data.offers.find((o) => o.status === "leading")?.offerId ?? data.offers[0].offerId,
  );
  const [greenlightState, setGreenlightState] = useState<
    "idle" | "pending" | "done" | "error"
  >("idle");
  const [greenlightError, setGreenlightError] = useState<string | null>(null);

  const countdown = useCountdown(data.masterDeadline);
  const activeOffer = data.offers.find((o) => o.offerId === activeOfferId)!;
  const greenlightOffer = data.offers.find(
    (o) => o.offerId === data.greenlightOfferId,
  )!;

  const onGreenlight = async () => {
    setGreenlightState("pending");
    setGreenlightError(null);
    try {
      const res = await fetch(
        `/api/offer/${data.contactId}/approve?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: data.greenlightOfferId }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Greenlight failed");
      setGreenlightState("done");
    } catch (err) {
      setGreenlightState("error");
      setGreenlightError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Master review deadline banner */}
      <section className="bg-gold/15 border border-gold/40 rounded-lg px-5 py-4 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-gold-dark mt-2 flex-shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Formal offer review window
          </p>
          <p className="font-display text-xl sm:text-2xl text-deep-teal leading-tight mt-1">
            {fmtDateTime(data.masterDeadline)}
          </p>
          <p className="text-xs text-deep-teal/70 mt-1">
            {countdown}. This is the bar everyone is working against. Offers we choose to take seriously must be improved and ready by then.
          </p>
        </div>
      </section>

      {/* In-hand offer summary card -- one row per offer + the empty ghost slot */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What is in hand
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold">
            Tap an offer to drill in
          </p>
        </div>
        <div className="divide-y divide-deep-teal/10">
          {data.offers.map((o) => (
            <OfferRow
              key={o.offerId}
              offer={o}
              active={activeOfferId === o.offerId}
              onSelect={() => setActiveOfferId(o.offerId)}
            />
          ))}
          <GhostRow />
        </div>
      </section>

      {/* Active offer detail -- header */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            {activeOffer.buyer.name}&rsquo;s offer · drill-in
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {activeOffer.offerExpiresAt && (
            <div className="bg-deep-teal/[0.06] border border-deep-teal/15 rounded-md px-4 py-3 text-sm">
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold mr-2">
                Paper clock
              </span>
              <span className="text-deep-teal/85">
                This offer&rsquo;s own ratification deadline is {fmtDateTime(activeOffer.offerExpiresAt)}. It can be extended on request.
              </span>
            </div>
          )}
          {activeOffer.offerExpiresLabel && !activeOffer.offerExpiresAt && (
            <div className="bg-deep-teal/[0.06] border border-deep-teal/15 rounded-md px-4 py-3 text-sm text-deep-teal/85">
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold mr-2">
                Clock
              </span>
              {activeOffer.offerExpiresLabel}
            </div>
          )}
          {activeOffer.statusNote && (
            <div className="border-l-2 border-gold/40 pl-4 py-1 text-sm text-deep-teal/80 italic">
              {activeOffer.statusNote}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Stat
              label="Price"
              value={
                activeOffer.escalationCap > activeOffer.basePrice
                  ? `${fmtMoney(activeOffer.basePrice)} → ${fmtMoney(activeOffer.escalationCap)}`
                  : fmtMoney(activeOffer.basePrice)
              }
              accent
            />
            <Stat
              label={
                activeOffer.escalationCap > activeOffer.basePrice
                  ? "Escalation"
                  : "Firm price"
              }
              value={
                activeOffer.escalationCap > activeOffer.basePrice
                  ? `${fmtMoney(activeOffer.escalationStep)} steps up to cap`
                  : "No escalation"
              }
            />
            <Stat label="Buyer" value={activeOffer.buyer.name} />
            <Stat
              label="Plans to live in it"
              value={
                activeOffer.buyer.occupancy === "owner-occupant"
                  ? "Yes (owner-occupant)"
                  : "No (investor)"
              }
            />
            <Stat label="Financing" value={activeOffer.financingType} />
            <Stat
              label="Pre-approved by"
              value={`${activeOffer.preApprovalLender}, ${activeOffer.preApprovalInstitution}`}
            />
            <Stat
              label="Earnest money"
              value={`${fmtMoney(activeOffer.earnestMoney)} (${activeOffer.earnestMoneyHolder})`}
            />
            <Stat
              label="Closing costs you cover"
              value={
                activeOffer.sellerConcessionsCredit === 0
                  ? "None requested"
                  : fmtMoney(activeOffer.sellerConcessionsCredit)
              }
            />
            <Stat label="Settlement date" value={fmtDate(activeOffer.settlementDate)} />
            <Stat label="Settlement agent" value={activeOffer.settlementAgent} />
            <Stat label="Agent" value={activeOffer.buyer.agentName} />
            <Stat label="Brokerage" value={activeOffer.buyer.agentBrokerage} />
          </div>
          {activeOffer.preApprovalNote && (
            <div className="bg-gold/10 border border-gold/30 rounded-md px-4 py-3 text-sm text-deep-teal/85 mt-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold mr-2">
                Heads up on financing
              </span>
              {activeOffer.preApprovalNote}
            </div>
          )}
        </div>
      </section>

      {/* Net math (this offer, base + cap if escalating) */}
      <NetMathCard
        offer={activeOffer}
        listingBrokerCompPct={data.listingBrokerCompPct}
        closingFees={data.closingFees}
        payoff={payoff}
        onPayoffChange={setPayoff}
      />

      {/* Contingencies for active offer */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The strings attached
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
          <Contingency
            title="Home inspection"
            sub={`${activeOffer.inspectionDays} days from ratification`}
            body={
              activeOffer.inspectionFineprint
                ? `${activeOffer.inspectionFineprint} Standard inspection rules otherwise: buyer can request repairs or a credit; you can say no, counter, or agree; if you cannot land in the same place, either side can walk and earnest money returns to the buyer.`
                : "Buyer hires their own inspector. If something turns up they can ask for repairs or a credit. You can say no, counter, or agree. If you cannot land in the same place, either side can walk and they get their earnest money back."
            }
          />
          <Contingency
            title="Appraisal"
            sub={activeOffer.appraisalContingency ? "Standard" : "Waived"}
            body={
              activeOffer.appraisalContingency
                ? "Since this is a financed offer, the lender's appraiser has to value the house at or above the contract price. If it comes in low, the buyer can either eat the difference in cash, ask you to drop to the appraised number, or walk. You are not on the hook to drop."
                : "Buyer waived the appraisal contingency. If the appraisal comes in low, they cover the gap. The price holds either way."
            }
          />
          <Contingency
            title="Financing"
            sub={`${activeOffer.financingType}`}
            body={`Buyer is pre-approved by ${activeOffer.preApprovalLender} at ${activeOffer.preApprovalInstitution} as of ${fmtDate(activeOffer.preApprovalDate)}. They have 7 days from ratification to formally apply and need a loan commitment by settlement. If financing falls through despite a good-faith effort, the contract dies and earnest money returns to them.`}
          />
        </div>
      </section>

      {/* Fine print */}
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
              {activeOffer.personalPropertyIncluded.join(", ")} (plus all standard fixtures like blinds, light fixtures, garage remotes, smoke detectors).
            </p>
          </div>
          <div>
            <p className="font-semibold text-deep-teal mb-1">Going AS-IS</p>
            <p>{activeOffer.asIsItems.join(". ")}. Buyer takes those without warranty.</p>
          </div>
          <div>
            <p className="font-semibold text-deep-teal mb-1">Possession</p>
            <p>{activeOffer.possession}. You hand over keys at closing.</p>
          </div>
        </div>
      </section>

      {/* Miles's read + greenlight */}
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
            {greenlightState === "done" ? (
              <div className="bg-gold/15 border border-gold/40 rounded-md px-5 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gold font-semibold mb-1">
                  Got it
                </p>
                <p className="text-sm sm:text-base text-ivory leading-relaxed">
                  Miles has the draft to {greenlightOffer.buyer.agentName.split(" ")[0]} sitting in his Gmail. He will eyeball it, send it tonight, and call you in the morning with whatever lands by then.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.14em] text-gold-dark font-semibold mb-3">
                  If you are good with this plan
                </p>
                <button
                  type="button"
                  onClick={onGreenlight}
                  disabled={greenlightState === "pending"}
                  className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-base px-6 py-3.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {greenlightState === "pending"
                    ? "Sending..."
                    : `Yes, push ${greenlightOffer.buyer.agentName.split(" ")[0]}, Miles`}
                </button>
                <p className="text-[11px] text-ivory/65 mt-3 leading-relaxed max-w-xl">
                  This does not send anything to {greenlightOffer.buyer.agentName.split(" ")[0]} yet. It tells Miles you are good with the move. He drafts the ask in his Gmail and sends it himself tonight after a final eyeball. Nothing leaves the inbox until he hits send.
                </p>
                {greenlightError && (
                  <p className="text-xs text-red-300 mt-2">
                    Something snagged: {greenlightError}. Just call Miles directly.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What happens next
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>Read this tonight. Sit with it. Tap greenlight if the plan lands. If anything is unclear, call or text.</li>
            <li>
              First thing tomorrow morning, Miles works the {greenlightOffer.buyer.agentName.split(" ")[0]} side and stays in contact with {data.offers.find((o) => o.status === "leading")?.buyer.agentName.split(" ")[0]} so both sides know what is in motion.
            </li>
            <li>
              By the time the Tuesday {new Date(data.masterDeadline).toLocaleTimeString("en-US", { hour: "numeric", timeZone: "America/New_York" })} review window opens, you will have the best version of every offer that is willing to compete. We decide which one to take together.
            </li>
            <li>
              Whichever offer ratifies, the next 30 days are predictable. Inspection inside the contract window, appraisal ordered inside 15, settlement on time.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

function OfferRow({
  offer,
  active,
  onSelect,
}: {
  offer: OfferRecord;
  active: boolean;
  onSelect: () => void;
}) {
  const isLeading = offer.status === "leading";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-6 sm:px-8 py-5 transition-colors ${
        active ? "bg-paper" : "bg-white hover:bg-deep-teal/[0.02]"
      } focus:outline-none focus:bg-paper`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isLeading ? "bg-gold-dark" : "bg-deep-teal/40"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-display text-xl text-deep-teal leading-tight">
              {offer.buyer.name}
            </p>
            {isLeading && (
              <span className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
                Leading
              </span>
            )}
            {offer.status === "new" && (
              <span className="text-[10px] uppercase tracking-[0.16em] text-deep-teal/60 font-semibold">
                Just landed
              </span>
            )}
          </div>
          <p className="text-sm text-deep-teal/75 mt-0.5">
            {offer.buyer.agentName} · {offer.buyer.agentBrokerage}
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-deep-teal/55 font-semibold mt-2">
            Received {fmtDateShort(offer.receivedAt)} · {offer.inspectionDays}-day inspection · {offer.buyer.occupancy === "owner-occupant" ? "Owner-occupant" : "Investor"}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className={`font-display text-2xl leading-none ${
              isLeading ? "text-gold-dark" : "text-deep-teal"
            }`}
          >
            {fmtMoney(offer.basePrice)}
          </p>
          {offer.escalationCap > offer.basePrice && (
            <p className="text-[11px] text-deep-teal/60 mt-1">
              up to {fmtMoney(offer.escalationCap)}
            </p>
          )}
          <p
            className={`text-[10px] uppercase tracking-[0.14em] font-semibold mt-2 ${
              active ? "text-gold-dark" : "text-deep-teal/45"
            }`}
          >
            {active ? "Showing below" : "View"}
          </p>
        </div>
      </div>
    </button>
  );
}

function GhostRow() {
  return (
    <div className="px-6 sm:px-8 py-5 bg-deep-teal/[0.015]">
      <div className="flex items-start gap-4">
        <div className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 border border-dashed border-deep-teal/30" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg text-deep-teal/55 leading-tight">
            Slot held for a possible third
          </p>
          <p className="text-sm text-deep-teal/55 mt-0.5">
            Miles is still in contact with parties who showed real interest this week. If a third offer comes in before the review window, it lands here.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-deep-teal/40 font-semibold flex-shrink-0">
          Open
        </p>
      </div>
    </div>
  );
}

function NetMathCard({
  offer,
  listingBrokerCompPct,
  closingFees,
  payoff,
  onPayoffChange,
}: {
  offer: OfferRecord;
  listingBrokerCompPct: number;
  closingFees: {
    closingAttorney: number;
    transactionFee: number;
    releaseFeeIfLoan: number;
    termiteInspection: number;
  };
  payoff: number;
  onPayoffChange: (n: number) => void;
}) {
  const scenarios = useMemo(() => {
    const build = (salesPrice: number) => {
      const grantorsTax = Math.ceil(salesPrice / 1000);
      const buyerBrokerComm = Math.round(
        (salesPrice * offer.buyerBrokerCompPct) / 100,
      );
      const listingBrokerComm = Math.round(
        (salesPrice * listingBrokerCompPct) / 100,
      );
      const totalCommissionPct = offer.buyerBrokerCompPct + listingBrokerCompPct;
      const releaseFee = payoff > 0 ? closingFees.releaseFeeIfLoan : 0;
      const totalExpenses =
        grantorsTax +
        buyerBrokerComm +
        listingBrokerComm +
        closingFees.closingAttorney +
        closingFees.transactionFee +
        closingFees.termiteInspection +
        releaseFee +
        offer.sellerConcessionsCredit +
        payoff;
      const net = salesPrice - totalExpenses;
      return {
        salesPrice,
        grantorsTax,
        buyerBrokerComm,
        listingBrokerComm,
        totalCommissionPct,
        closingAttorney: closingFees.closingAttorney,
        transactionFee: closingFees.transactionFee,
        termite: closingFees.termiteInspection,
        releaseFee,
        concessionsCredit: offer.sellerConcessionsCredit,
        payoff,
        totalExpenses,
        net,
      };
    };
    return {
      base: build(offer.basePrice),
      cap: offer.escalationCap > offer.basePrice ? build(offer.escalationCap) : null,
    };
  }, [offer, listingBrokerCompPct, closingFees, payoff]);

  const hasEscalation = scenarios.cap !== null;

  return (
    <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
          The math on {offer.buyer.name.split(" ")[0]}&rsquo;s offer
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
              onChange={(e) =>
                onPayoffChange(Math.max(0, Number(e.target.value) || 0))
              }
              placeholder="0"
              className="flex-1 max-w-[200px] text-2xl font-semibold text-deep-teal border-b-2 border-deep-teal/20 focus:border-gold focus:outline-none py-1 bg-transparent"
            />
            <p className="text-xs text-deep-teal/50">Leave at 0 if free and clear</p>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 ${hasEscalation ? "sm:grid-cols-2" : ""} gap-4`}
        >
          <ScenarioCard
            label={hasEscalation ? "If no competing offer" : "At the contract price"}
            sub={`Sale at ${fmtMoney(scenarios.base.salesPrice)}`}
            s={scenarios.base}
            accent={!hasEscalation}
          />
          {hasEscalation && scenarios.cap && (
            <ScenarioCard
              label="If it escalates to the cap"
              sub={`Sale at ${fmtMoney(scenarios.cap.salesPrice)}`}
              s={scenarios.cap}
              accent
            />
          )}
        </div>

        <p className="text-xs text-deep-teal/55 leading-relaxed">
          Estimates only. Final numbers come from the settlement agent on closing day and can move a few hundred dollars in either direction (tax prorations, recording fees, payoff interest).
        </p>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
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
      <span
        className={`${accent ? "text-ivory/75" : "text-deep-teal/70"} ${bold ? "font-semibold" : ""}`}
      >
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
