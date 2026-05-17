import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getConciergeContact, listContactNotes } from "@/lib/ghl-concierge";
import {
  getContactConciergeOpportunity,
  stageById,
} from "@/lib/ghl-concierge-agent";
import {
  buildTcStageView,
  isTcActiveStage,
  TC_BASELINE_CHECKLIST,
} from "@/lib/concierge-tc";
import { ChecklistCard } from "./ChecklistCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "TC Dashboard | MAMS Move-In Concierge",
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

export default async function ConciergeTcDashboard({
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

  const [opp, notes] = await Promise.all([
    getContactConciergeOpportunity(contactId),
    listContactNotes(contactId).catch(() => []),
  ]);

  const currentStage = stageById(opp?.pipelineStageId);
  const tcActive = isTcActiveStage(opp?.pipelineStageId);
  const stageView = buildTcStageView(opp?.pipelineStageId);

  const firstName = contact.firstName || "this lead";
  const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "this lead";
  const clientShareUrl = `https://mamsnow.com/concierge/${contactId}?t=${t}`;
  const agentDashboardUrl = `https://mamsnow.com/concierge/${contactId}/agent?t=${t}`;

  const chosenNotes = (notes || []).filter((n) => !(n.body || "").startsWith("[CONCIERGE SHORTLIST]"));

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
                TC Dashboard
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-gold-dark/80 hidden sm:inline">
            Internal · transaction coordinator view
          </span>
        </div>
      </header>

      {/* Activation status banner */}
      <section className="max-w-4xl mx-auto px-6 pt-8">
        {tcActive ? (
          <div className="bg-deep-teal text-ivory rounded-lg p-5 sm:p-6">
            <div className="text-xs uppercase tracking-[0.15em] text-gold-dark font-semibold">
              Your file is active
            </div>
            <h1 className="font-display text-2xl sm:text-3xl mt-1 leading-tight">
              {fullName} · {currentStage?.name}
            </h1>
            <p className="text-sm text-ivory/80 mt-2 leading-relaxed">
              Chosen has handed this off. Run the compliance checklist below before the lease closes.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-deep-teal/15 rounded-lg p-5 sm:p-6">
            <div className="text-xs uppercase tracking-[0.15em] text-deep-teal/60 font-semibold">
              Standing by
            </div>
            <h1 className="font-display text-2xl sm:text-3xl mt-1 text-deep-teal leading-tight">
              {fullName} · {currentStage?.name || "Inquiry"}
            </h1>
            <p className="text-sm text-deep-teal/70 mt-2 leading-relaxed">
              Chosen is still working this lead. You&rsquo;ll be activated when the deal moves to
              <span className="font-semibold text-deep-teal"> Application </span>
              or
              <span className="font-semibold text-deep-teal"> Lease Signed</span>.
              Until then, here&rsquo;s the context so you&rsquo;re ready when the handoff lands.
            </p>
          </div>
        )}
      </section>

      {/* Lead handoff context */}
      <section className="max-w-4xl mx-auto px-6 pt-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          Lead handoff context
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <IntakeBlock label="What they want" value={contact.criteria} />
            <IntakeBlock label="Lifestyle priorities" value={contact.lifestylePriorities} />
            <IntakeBlock label="Daily anchors" value={contact.dailyAnchors} />
            <IntakeBlock label="Anchor address" value={contact.anchorAddress} />
            {contact.email ? <IntakeBlock label="Email" value={contact.email} /> : null}
          </div>
          <div className="mt-5 pt-5 border-t border-deep-teal/10 flex flex-wrap gap-2">
            <a
              href={agentDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-paper hover:bg-gold/10 border border-deep-teal/15 hover:border-gold-dark text-deep-teal px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Open Chosen&rsquo;s view
            </a>
            <a
              href={clientShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-paper hover:bg-gold/10 border border-deep-teal/15 hover:border-gold-dark text-deep-teal px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Open lead share page
            </a>
          </div>
        </div>
      </section>

      {/* Stage timeline */}
      <section className="max-w-4xl mx-auto px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          Lifecycle · what happens at every stage
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6">
          <ol className="space-y-3">
            {stageView.map((sv) => (
              <li
                key={sv.stage.id}
                className={[
                  "flex gap-3 p-3 rounded-md border",
                  sv.isCurrent
                    ? "bg-deep-teal text-ivory border-deep-teal"
                    : sv.isComplete
                    ? "bg-paper/60 border-deep-teal/10 opacity-70"
                    : "bg-white border-deep-teal/10",
                ].join(" ")}
              >
                <div className={[
                  "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  sv.isCurrent
                    ? "bg-gold text-deep-teal"
                    : sv.isComplete
                    ? "bg-deep-teal/15 text-deep-teal"
                    : sv.isWendyOwned
                    ? "bg-gold/20 text-gold-dark"
                    : "bg-paper text-deep-teal/60",
                ].join(" ")}>
                  {sv.stage.position + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={[
                    "text-sm font-semibold flex flex-wrap items-baseline gap-x-2",
                    sv.isCurrent ? "text-ivory" : "text-deep-teal",
                  ].join(" ")}>
                    <span>{sv.stage.name}</span>
                    {sv.isWendyOwned ? (
                      <span className={[
                        "text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded",
                        sv.isCurrent ? "bg-gold/20 text-gold" : "bg-gold/15 text-gold-dark",
                      ].join(" ")}>
                        Wendy owns
                      </span>
                    ) : null}
                  </div>
                  <div className={[
                    "text-xs mt-1 leading-relaxed",
                    sv.isCurrent ? "text-ivory/85" : "text-deep-teal/70",
                  ].join(" ")}>
                    {sv.blurb}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Compliance checklist */}
      <section className="max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <ChecklistCard contactId={contactId} items={TC_BASELINE_CHECKLIST} />
        </div>
      </section>

      {/* Chosen's notes */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-2">
          What Chosen logged
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6">
          {chosenNotes.length > 0 ? (
            <ul className="space-y-4">
              {chosenNotes.slice(0, 5).map((n) => (
                <li key={n.id} className="border-l-2 border-gold-dark/40 pl-4">
                  <p className="text-sm text-deep-teal/85 whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-deep-teal/65 italic">
              No Chosen notes on this contact yet. The concierge automation note is hidden from this view — open Chosen&rsquo;s dashboard for the shortlist.
            </p>
          )}
        </div>
      </section>

      {/* Paperwork status (Phase C heads-up) */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-gold/10 border border-gold-dark/20 rounded-lg p-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-gold-dark font-semibold mb-1">
            Paperwork status
          </div>
          <p className="text-sm text-deep-teal/85 leading-relaxed">
            Tenant Brokerage Agreement and Future Buyer Engagement Letter are
            <span className="font-semibold"> NOT cleared to send</span> until the legal review exit conditions
            (entity naming, supervising broker contact, dual-compensation rewrite, 24-month Act recital) land.
            Until then, contracts go through manual review with Miles before client signature.
          </p>
          <p className="text-xs text-deep-teal/65 mt-2 italic">
            Source: 2026-05-17 concierge paperwork legal review (Va. Code § 54.1-2106.1, § 54.1-2110.1, § 54.1-2134, Title 55.1 Ch. 32)
          </p>
        </div>
      </section>

      {/* Last activity footer */}
      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-4xl mx-auto px-6 py-6 text-xs text-deep-teal/60 flex flex-wrap gap-x-6 gap-y-2">
          <span>Opp opened {relTime(opp?.createdAt)}</span>
          <span>Stage last moved {relTime(opp?.lastStageChangeAt)}</span>
          <span>Status: <span className="text-deep-teal font-medium">{contact.status || "—"}</span></span>
          <span className="ml-auto">Internal · do not forward outside the team</span>
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
