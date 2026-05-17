import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getConciergeContact } from "@/lib/ghl-concierge";
import {
  CONCIERGE_STAGES,
  getContactConciergeOpportunity,
  getOpenConciergeOpportunities,
  computeConciergePulse,
  stageById,
  formatUsd,
  CONCIERGE_DEFAULT_VALUE_USD,
} from "@/lib/ghl-concierge-agent";
import {
  buildFirstCallHooks,
  callByDeadline,
  buildTcDashboardUrl,
  isTcActiveStage,
  TC_ACTIVATION_STAGE_POSITIONS,
} from "@/lib/concierge-tc";
import { PropertyCardV2, parseV2 } from "@/components/concierge/PropertyCardV2";
import { StageSelector } from "./StageSelector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Agent Dashboard | MAMS Move-In Concierge",
  robots: { index: false, follow: false },
};

function relTime(iso?: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!t) return "—";
  const diffMs = Date.now() - t;
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function ConciergeAgentDashboard({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();

  const contact = await getConciergeContact(contactId);
  if (!contact) notFound();
  if (!contact.shareToken || contact.shareToken !== t) notFound();

  const [opp, allOpenOpps] = await Promise.all([
    getContactConciergeOpportunity(contactId),
    getOpenConciergeOpportunities(),
  ]);
  const pulse = computeConciergePulse(allOpenOpps);

  const currentStage = stageById(opp?.pipelineStageId);
  const thisDealValue = Math.max(opp?.monetaryValue || 0, CONCIERGE_DEFAULT_VALUE_USD);
  const thisDealWeighted = currentStage ? Math.round(thisDealValue * currentStage.probability) : 0;

  const firstName = contact.firstName || "this lead";
  const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "this lead";
  const v2 = parseV2(contact.shortlistV2Json);
  const clientShareUrl = `https://mamsnow.com/concierge/${contactId}?t=${t}`;
  const tcDashboardUrl = buildTcDashboardUrl(contactId, t);
  const firstCallHooks = buildFirstCallHooks({
    criteria: contact.criteria,
    lifestylePriorities: contact.lifestylePriorities,
    dailyAnchors: contact.dailyAnchors,
    anchorAddress: contact.anchorAddress,
  });
  const callBy = callByDeadline(opp, 10);
  const tcActivationStage = CONCIERGE_STAGES.find(
    (s) => s.position === TC_ACTIVATION_STAGE_POSITIONS.application
  );
  const wendyAlreadyOwning = isTcActiveStage(opp?.pipelineStageId);
  const stagesBetweenWendy = currentStage && tcActivationStage
    ? Math.max(0, tcActivationStage.position - currentStage.position)
    : null;

  return (
    <main className="min-h-screen bg-paper text-deep-teal">
      <header className="bg-deep-teal text-ivory">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
                Agent Dashboard
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-gold-dark/80 hidden sm:inline">
            Internal · do not share with lead
          </span>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          Your concierge pipeline
        </p>
        <div className="bg-deep-teal text-ivory rounded-lg p-6 sm:p-8">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <div className="font-display text-4xl sm:text-5xl text-gold font-bold leading-none">
                {formatUsd(pulse.totalWeightedUsd)}
              </div>
              <div className="text-xs uppercase tracking-[0.12em] text-ivory/70 mt-2">
                Potential commission · stage-weighted across {pulse.totalDeals} open {pulse.totalDeals === 1 ? "deal" : "deals"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.15em] text-gold-dark">This deal</div>
              <div className="font-display text-xl text-ivory mt-1">{formatUsd(thisDealWeighted)}</div>
              <div className="text-[10px] text-ivory/55 mt-0.5">
                {formatUsd(thisDealValue)} × {currentStage ? Math.round(currentStage.probability * 100) : 0}%
              </div>
            </div>
          </div>
          {pulse.byStage.length > 0 ? (
            <div className="mt-5 pt-5 border-t border-ivory/15 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
              {pulse.byStage.map((b) => (
                <div key={b.stage.id} className="flex justify-between gap-2">
                  <span className="text-ivory/70 truncate">{b.stage.name}</span>
                  <span className="text-gold whitespace-nowrap">
                    {b.count} · {formatUsd(b.weightedUsd)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          {fullName}
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-deep-teal leading-tight">
                {firstName}&rsquo;s lead snapshot
              </h1>
              <p className="text-xs text-deep-teal/60 mt-1">
                Status: <span className="text-deep-teal font-medium">{contact.status || "—"}</span>
                {contact.shareViewedAt ? <> · Lead opened share page {relTime(contact.shareViewedAt)}</> : <> · Lead hasn&rsquo;t opened share page yet</>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={clientShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-deep-teal text-ivory px-4 py-2 rounded-md text-sm font-medium hover:bg-deep-teal/90"
              >
                Open client share page →
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-deep-teal/10">
            <IntakeBlock label="Criteria" value={contact.criteria} />
            <IntakeBlock label="Lifestyle priorities" value={contact.lifestylePriorities} />
            <IntakeBlock label="Daily anchors" value={contact.dailyAnchors} />
            <IntakeBlock label="Anchor address" value={contact.anchorAddress} />
            {contact.email ? <IntakeBlock label="Email" value={contact.email} /> : null}
          </div>
        </div>
      </section>

      {/* First-call prep — only shows pre-Application, where Chosen owns the call */}
      {!wendyAlreadyOwning ? (
        <section className="max-w-4xl mx-auto px-6 pt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
            First-call prep
          </p>
          <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
            {callBy ? (
              <div className={[
                "flex items-baseline justify-between flex-wrap gap-3 mb-5 p-4 rounded-md",
                callBy.minutesRemaining <= 0
                  ? "bg-gold/15 border border-gold-dark/40"
                  : callBy.minutesRemaining <= 5
                  ? "bg-gold/10 border border-gold-dark/30"
                  : "bg-paper border border-deep-teal/10",
              ].join(" ")}>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-deep-teal/60 font-semibold">
                    10-minute response target
                  </div>
                  <div className="font-display text-2xl text-deep-teal mt-1">
                    {callBy.minutesRemaining > 0
                      ? `Call by ${new Date(callBy.iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                      : `Past target — call now (${Math.abs(callBy.minutesRemaining)} min over)`}
                  </div>
                </div>
                <div className={[
                  "text-xs px-3 py-1 rounded-full font-medium",
                  callBy.minutesRemaining <= 0
                    ? "bg-gold-dark text-ivory"
                    : callBy.minutesRemaining <= 5
                    ? "bg-gold text-deep-teal"
                    : "bg-deep-teal text-ivory",
                ].join(" ")}>
                  {callBy.minutesRemaining > 0 ? `${callBy.minutesRemaining}m to go` : "overdue"}
                </div>
              </div>
            ) : null}

            <p className="text-xs text-deep-teal/65 mb-4">
              These came directly from the lead. Use them to start the conversation, not to lead it. The goal is genuine understanding — even your voicemail can leave value when you reflect their own words back.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {firstCallHooks.map((h) => (
                <div key={h.label} className="border-l-2 border-gold-dark/40 pl-4">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-deep-teal/55 font-semibold mb-1">
                    {h.label}
                  </div>
                  <div className="text-sm text-deep-teal/90 leading-relaxed">{h.text}</div>
                </div>
              ))}
              {firstCallHooks.length === 0 ? (
                <p className="text-sm text-deep-teal/60 italic col-span-full">
                  Lead intake fields are empty. Pull whatever Chosen captured in the contact notes before dialing.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="max-w-4xl mx-auto px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          Pipeline stage
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          {opp ? (
            <>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
                <div>
                  <div className="text-xs text-deep-teal/60">Currently at</div>
                  <div className="font-display text-xl text-deep-teal mt-0.5">
                    {currentStage?.name || "Unknown stage"}
                  </div>
                </div>
                <div className="text-right text-xs text-deep-teal/55">
                  Last moved {relTime(opp.lastStageChangeAt)}
                </div>
              </div>
              <p className="text-xs text-deep-teal/60 mb-3">
                Tap any stage to advance. Writes back to Open Dispo immediately.
              </p>
              <StageSelector
                contactId={contactId}
                token={t}
                opportunityId={opp.id}
                currentStageId={opp.pipelineStageId}
                stages={CONCIERGE_STAGES}
              />
            </>
          ) : (
            <p className="text-sm text-deep-teal/70">
              No concierge opportunity found on this contact yet. Create one in Open Dispo to enable stage tracking.
            </p>
          )}
        </div>
      </section>

      {/* What's next — relay handoff to Wendy */}
      <section className="max-w-4xl mx-auto px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          What&rsquo;s next · the relay
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          {wendyAlreadyOwning ? (
            <>
              <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
                <div>
                  <div className="text-xs text-deep-teal/60">Wendy is active on this file</div>
                  <div className="font-display text-xl text-deep-teal mt-0.5">
                    She&rsquo;s already in {currentStage?.name}
                  </div>
                </div>
              </div>
              <p className="text-sm text-deep-teal/75 leading-relaxed mb-4">
                Compliance checklist, lifecycle timeline, and your handoff context are live on her view. Keep logging notes — she sees them in real time.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
                <div>
                  <div className="text-xs text-deep-teal/60">Wendy gets pulled in at</div>
                  <div className="font-display text-xl text-deep-teal mt-0.5">
                    {tcActivationStage?.name || "Application"}
                    {stagesBetweenWendy != null && stagesBetweenWendy > 0 ? (
                      <span className="text-sm text-deep-teal/55 font-normal ml-2">
                        ({stagesBetweenWendy} stage{stagesBetweenWendy === 1 ? "" : "s"} away)
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="text-sm text-deep-teal/75 leading-relaxed mb-4">
                When you move this to <span className="font-semibold text-deep-teal">{tcActivationStage?.name || "Application"}</span>, Wendy&rsquo;s TC dashboard activates with the compliance checklist (pre-showing brokerage agreement, supervising broker disclosure, landlord-side compensation disclosure) and your handoff context pre-loaded.
              </p>
            </>
          )}
          <a
            href={tcDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-paper hover:bg-gold/10 border border-deep-teal/15 hover:border-gold-dark text-deep-teal px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Open Wendy&rsquo;s view →
          </a>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          Shortlist (mirror of client view)
        </p>
        {v2 && v2.properties.length > 0 ? (
          v2.properties.map((p, i) => <PropertyCardV2 key={p.slug || i} property={p} />)
        ) : (
          <div className="bg-white rounded-lg border border-deep-teal/10 p-6 text-sm text-deep-teal/70">
            No shortlist yet. The poller will pick this contact up on the next run, or trigger
            <code className="px-1 mx-1 bg-paper/60 rounded text-xs">process-contact.js --force</code>
            manually.
          </div>
        )}
      </section>

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-4xl mx-auto px-6 py-6 text-xs text-deep-teal/60">
          Internal MAMS dashboard · token-gated · do not forward this URL outside the team.
        </div>
      </footer>
    </main>
  );
}

function IntakeBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-deep-teal/55 font-semibold mb-1">
        {label}
      </div>
      <div className="text-sm text-deep-teal/90 leading-relaxed">
        {value ? value : <span className="text-deep-teal/40 italic">not provided</span>}
      </div>
    </div>
  );
}
