import type { Metadata } from "next";
import {
  OnboardingHeader,
  OnboardingHero,
  OnboardingSection,
  CtaLink,
  OnboardingFooter,
} from "@/components/concierge/OnboardingShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Wendy Walkthrough | MAMS Move-In Concierge",
  robots: { index: false, follow: false },
};

const DEMO_TC_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD/tc?t=c1c1a3bd64ea468e9a601645ba14c225";
const DEMO_AGENT_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD/agent?t=c1c1a3bd64ea468e9a601645ba14c225";
const DEMO_CLIENT_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD?t=c1c1a3bd64ea468e9a601645ba14c225";
const TOTAL = 10;

export default function WendyOnboarding() {
  return (
    <main className="min-h-screen bg-paper text-deep-teal pb-12">
      <OnboardingHeader role="Wendy" />

      <OnboardingHero
        greeting="Wendy! Welcome to your TC handoff view."
        pitch="Every MAMS rental lease now lands on a dashboard built for you. No PDF, no screenshot grind. One click and you&rsquo;re inside the lead&rsquo;s whole story — what they want, what Chosen captured, what the lease requires, what&rsquo;s legally cleared and what isn&rsquo;t. This walkthrough takes about 15 minutes. We&rsquo;re using a fake test lead called TestF, so nothing you click affects a real client."
        bookmarkUrl={DEMO_TC_URL}
        bookmarkLabel="Bookmark this — your TestF demo dashboard"
      />

      <OnboardingSection number={1} total={TOTAL} title="How you get to your dashboard for a real lead">
        <p>
          Every real concierge lead lands in Open Dispo with a Note attached. Open the contact, scroll to Notes, look for the one starting with <code className="bg-paper/60 px-1.5 py-0.5 rounded text-xs">[CONCIERGE SHORTLIST]</code>.
        </p>
        <p>
          That Note has three links. The one you want is <span className="font-semibold">Open the TC dashboard (Wendy)</span>. Click it. Your dashboard for that lead opens in a new tab.
        </p>
        <p className="text-xs text-deep-teal/60 italic">
          You can pre-open dashboards for leads still in early stages — your view will say &quot;Standing by&quot; until Chosen advances them.
        </p>
      </OnboardingSection>

      <OnboardingSection number={2} total={TOTAL} title="When your view activates — and why">
        <p>
          The banner at the top tells you the activation status. There are two states:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="font-semibold">Standing by</span> (white background) — Chosen is still working this lead. You&rsquo;ll get pulled in automatically when the deal moves to <span className="font-semibold">Application</span> or <span className="font-semibold">Lease Signed</span>. You don&rsquo;t need to do anything yet. Reading the context helps you arrive prepared.</li>
          <li><span className="font-semibold">Your file is active</span> (teal background) — Chosen has moved the deal to Application or beyond. You own the file from here through closing.</li>
        </ul>
        <p>
          TestF (your demo) is at Inquiry stage, so your demo dashboard shows &quot;Standing by.&quot; If you want to see what the &quot;active&quot; state looks like, tell Miles to advance TestF on Chosen&rsquo;s view and refresh yours.
        </p>
        <CtaLink href={DEMO_TC_URL} label="See your TestF dashboard" />
      </OnboardingSection>

      <OnboardingSection number={3} total={TOTAL} title="Lead handoff context — everything Chosen captured">
        <p>
          Right below the banner, you see the lead&rsquo;s intake fields:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="font-semibold">What they want</span> — full criteria text</li>
          <li><span className="font-semibold">Lifestyle priorities</span> — what kind of life they&rsquo;re building</li>
          <li><span className="font-semibold">Daily anchors</span> — their actual routine</li>
          <li><span className="font-semibold">Anchor address</span> — what they orient around</li>
          <li><span className="font-semibold">Email</span> — direct contact</li>
        </ul>
        <p>
          Two buttons below it: <span className="font-semibold">Open Chosen&rsquo;s view</span> (see exactly what she sees, including the shortlist and the cover email she sent) and <span className="font-semibold">Open lead share page</span> (see what the lead sees — same property list, same actionable phone numbers, same vibes paragraphs).
        </p>
        <p>
          Use these any time you need to verify what was promised, or when you want to call a property directly using the phone number from the lead&rsquo;s view.
        </p>
      </OnboardingSection>

      <OnboardingSection number={4} total={TOTAL} title="Lifecycle timeline — what happens at every stage">
        <p>
          Next card down is the full 9-stage lifecycle. Each stage has a short blurb explaining what happens. Stages 6 and beyond carry a gold <span className="font-semibold">Wendy owns</span> badge — those are the ones where the work is yours.
        </p>
        <p>
          Read the timeline top to bottom once. You&rsquo;ll see the full lead journey from first call (Chosen) through future buyer activation (Miles + Chosen, 24 months post-lease). Knowing where you sit in the relay helps you arrive on each file already pointed in the right direction.
        </p>
        <p className="text-xs text-deep-teal/60 italic">
          The teal-highlighted stage is the current one. Faded stages above it are complete. Stages below are still ahead.
        </p>
      </OnboardingSection>

      <OnboardingSection number={5} total={TOTAL} title="Compliance checklist — your daily reference">
        <p>
          The big card below the timeline is the <span className="font-semibold">compliance checklist</span> — 7 items pulled directly from the 2026-05-17 paperwork legal review. Each carries the Virginia Code citation so if any landlord, attorney, or auditor asks why we structured something a certain way, you can point them to the statute.
        </p>
        <p>
          The 7 items:
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li>Tenant Brokerage Agreement signed before any showing — required by Va. Code § 54.1-2134(A)(1) effective July 1, 2025</li>
          <li>Future Buyer Engagement Letter on file with Unfair Real Estate Service Agreement Act recital</li>
          <li>Supervising broker name + contact disclosed in both agreements</li>
          <li>Brokerage relationship disclosed in writing to each property&rsquo;s leasing office</li>
          <li>Any landlord-side compensation disclosed to client in writing before lease signing</li>
          <li>Concierge Fee invoiced (Base $1,995 at signing + Rent Equivalency at lease execution)</li>
          <li>Future buyer credit eligibility logged with move-in date</li>
        </ol>
        <p>
          Check items as you complete them. Your checkbox state persists in your browser for now (Phase C wires it back to Open Dispo so it&rsquo;s visible to the whole team). By the time the lease closes, you should be at 6 of 7 minimum.
        </p>
      </OnboardingSection>

      <OnboardingSection number={6} total={TOTAL} title="What Chosen logged">
        <p>
          Below the checklist, you see Chosen&rsquo;s contact notes (the automated shortlist note is auto-filtered out, since it&rsquo;s not actually her writing).
        </p>
        <p>
          These notes are your real-time signal of what she&rsquo;s been doing on the file. If they&rsquo;re sparse or missing context you need, tell her — she sees your TC view too and can adjust what she logs.
        </p>
      </OnboardingSection>

      <OnboardingSection number={7} total={TOTAL} title="Paperwork status — read this before sending anything">
        <p>
          The gold-bordered banner at the bottom is the single most important reminder on your dashboard right now.
        </p>
        <p>
          <span className="font-semibold">Tenant Brokerage Agreement and Future Buyer Engagement Letter are NOT cleared to send</span> until the legal review&rsquo;s exit conditions clear:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Confirm whether MAMS LLC holds the firm license itself, or operates inside another licensed firm</li>
          <li>Add supervising broker name + phone + email to both agreements</li>
          <li>Rewrite the dual-compensation section to prevent landlord/tenant double-dipping</li>
          <li>Add explicit Unfair Real Estate Service Agreement Act recital to the future-buyer letter</li>
          <li>Get a Virginia real estate attorney&rsquo;s sign-off on the unresolved enforceability questions</li>
        </ul>
        <p>
          Until those clear, every contract for every real lead goes through Miles for manual review before client signature. Don&rsquo;t send templates from old habits — flag any deal that&rsquo;s ready for paperwork to Miles directly, and he&rsquo;ll route the cleaned version to you.
        </p>
      </OnboardingSection>

      <OnboardingSection number={8} total={TOTAL} title="The full lead loop — Chosen&rsquo;s view, your view, lead&rsquo;s view">
        <p>
          Three URLs exist for every concierge lead. Knowing what each one shows helps you cross-check anything:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="font-semibold">Your TC dashboard</span> — what you&rsquo;re looking at right now</li>
          <li><span className="font-semibold">Chosen&rsquo;s agent dashboard</span> — pipeline pulse, first-call prep, the cover email she sent, the stage selector</li>
          <li><span className="font-semibold">Lead share page</span> — what the prospect sees: their curated shortlist with vibes paragraphs and property contact info</li>
        </ul>
        <p>
          All three links live in the Open Dispo Note. Bookmark each per active lead if you want, or just open them from the Note each time.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <CtaLink href={DEMO_AGENT_URL} label="Open Chosen&rsquo;s TestF view" />
          <CtaLink href={DEMO_CLIENT_URL} label="Open lead&rsquo;s TestF view" />
        </div>
      </OnboardingSection>

      <OnboardingSection number={9} total={TOTAL} title="Common questions">
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-1">My view says &quot;Standing by&quot; — should I be doing something?</p>
            <p className="text-sm text-deep-teal/80">No. That means Chosen is still working the lead. You&rsquo;ll be activated automatically when she moves the deal to Application or Lease Signed. Reading the lifecycle timeline helps you arrive prepared when activation lands.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">My checkbox state — does it sync to Open Dispo?</p>
            <p className="text-sm text-deep-teal/80">Not yet. Right now it saves in your browser only, so refreshing the page keeps your checks but a teammate looking at the same dashboard won&rsquo;t see them. Phase C wires it to Open Dispo so the team sees the same state.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">What if I need to look at a different lead?</p>
            <p className="text-sm text-deep-teal/80">Open that contact in Open Dispo, find the [CONCIERGE SHORTLIST] Note, click <span className="font-semibold">Open the TC dashboard (Wendy)</span>. Your view for that lead opens.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Can I send the Tenant Brokerage Agreement using my own template?</p>
            <p className="text-sm text-deep-teal/80">Not until the legal review exit conditions clear. Until then, every contract goes through Miles. He&rsquo;ll send you the legal-clean version when one&rsquo;s ready.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Why is the lifecycle timeline so detailed?</p>
            <p className="text-sm text-deep-teal/80">So you can see what Chosen has been doing before you got pulled in, what you own, and what comes after (Post-Move Nurture + 24-month future-buyer credit). The whole journey on one card.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">What if Chosen&rsquo;s notes are missing context I need?</p>
            <p className="text-sm text-deep-teal/80">Tell her. She sees your TC view too. The system is built around the two of you having visibility into each other&rsquo;s work, so it gets sharper when you communicate what&rsquo;s missing.</p>
          </div>
        </div>
      </OnboardingSection>

      <OnboardingSection number={10} total={TOTAL} title="You&rsquo;re ready">
        <p>
          That&rsquo;s the whole tool. Bookmark the TestF dashboard above so you can revisit the demo any time. For real leads, the URL comes from each contact&rsquo;s [CONCIERGE SHORTLIST] Note in Open Dispo.
        </p>
        <p>
          When the paperwork track unblocks (legal exit conditions cleared), we&rsquo;ll wire one-click document generation directly into this dashboard. Until then, your job is the workflow shell + compliance hygiene, which is exactly what&rsquo;s in front of you.
        </p>
        <CtaLink href={DEMO_TC_URL} label="Open your TestF dashboard" />
      </OnboardingSection>

      <OnboardingFooter />
    </main>
  );
}
