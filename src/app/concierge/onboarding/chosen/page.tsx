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
  title: "Chosen Walkthrough | MAMS Move-In Concierge",
  robots: { index: false, follow: false },
};

const DEMO_AGENT_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD/agent?t=c1c1a3bd64ea468e9a601645ba14c225";
const DEMO_TC_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD/tc?t=c1c1a3bd64ea468e9a601645ba14c225";
const DEMO_CLIENT_URL = "https://mamsnow.com/concierge/9ZGENlckA3evlHAWMqCD?t=c1c1a3bd64ea468e9a601645ba14c225";
const TOTAL = 10;

export default function ChosenOnboarding() {
  return (
    <main className="min-h-screen bg-paper text-deep-teal pb-12">
      <OnboardingHeader role="Chosen" />

      <OnboardingHero
        greeting="Chosen! Welcome to your concierge command center."
        pitch="Every rental lead that comes in now arrives on a dashboard built for you. You see what they want, what they need, how to call them, and exactly when Wendy gets pulled in. Your old 'spend 15 minutes pulling notes' becomes 'spend 2 minutes preparing for the call.' This walkthrough takes about 15 minutes. Click the demo link in each section to see it live (we're using a fake test lead called TestF so nothing you click affects a real client)."
        bookmarkUrl={DEMO_AGENT_URL}
        bookmarkLabel="Bookmark this — your TestF demo dashboard"
      />

      <OnboardingSection number={1} total={TOTAL} title="How you get to your dashboard for a real lead">
        <p>
          Every real concierge lead lands in Open Dispo with a Note attached. Open the contact, scroll to Notes, look for the one starting with <code className="bg-paper/60 px-1.5 py-0.5 rounded text-xs">[CONCIERGE SHORTLIST]</code>.
        </p>
        <p>
          That Note has three links. The one you want is <span className="font-semibold">Open the agent dashboard (Chosen)</span>. Click it. Your dashboard for that lead opens in a new tab. That&rsquo;s the only step.
        </p>
        <p className="text-xs text-deep-teal/60 italic">
          Tip: pin or bookmark each lead&rsquo;s dashboard URL while you&rsquo;re working them. You can also always come back to the Note.
        </p>
      </OnboardingSection>

      <OnboardingSection number={2} total={TOTAL} title="The pipeline pulse — your motivator">
        <p>
          The big number at the top of your dashboard is your <span className="font-semibold">stage-weighted potential commission</span> across every open concierge deal you&rsquo;re working. It grows as you close deals and as deals advance through stages.
        </p>
        <p>
          This shows up on every contact&rsquo;s dashboard. Every time you open one, you see the whole pipeline at a glance. The smaller number on the right (&quot;This deal&quot;) is just this specific lead&rsquo;s weighted value.
        </p>
        <CtaLink href={DEMO_AGENT_URL} label="Look at the pulse on TestF" />
      </OnboardingSection>

      <OnboardingSection number={3} total={TOTAL} title="The 10-minute call target">
        <p>
          When a lead arrives, you have <span className="font-semibold">10 minutes</span> before they go cold. That&rsquo;s the standard you&rsquo;re running.
        </p>
        <p>
          The badge inside your &quot;First-call prep&quot; card tells you exactly when to call:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="text-deep-teal font-semibold">Teal &quot;X minutes to go&quot;</span> — plenty of time, prep on the call</li>
          <li><span className="text-gold-dark font-semibold">Gold &quot;within 5 min&quot;</span> — call now, prep is enough</li>
          <li><span className="text-gold-dark font-semibold">Gold-on-gold &quot;past target — call now (X min over)&quot;</span> — overdue, dial immediately, leave value on the voicemail if they don&rsquo;t pick up</li>
        </ul>
        <p>
          A 30-second voicemail with one specific thing from their intake (&quot;Hey Anna, saw you mentioned the morning walk with Hank — I have a couple Scott&rsquo;s Addition spots you&rsquo;ll love&quot;) beats a delayed call every time.
        </p>
      </OnboardingSection>

      <OnboardingSection number={4} total={TOTAL} title="The first-call prep card — starting points, not scripts">
        <p>
          Right below the 10-minute badge, you&rsquo;ll see four blocks pulled straight from the lead&rsquo;s intake:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="font-semibold">What they want</span> — their criteria, in their own words</li>
          <li><span className="font-semibold">Their daily rhythm</span> — what their normal day looks like</li>
          <li><span className="font-semibold">What lights them up</span> — coffee shops, brunch, dog walks, whatever</li>
          <li><span className="font-semibold">Where life is centered</span> — the address they anchor around</li>
        </ul>
        <p>
          Use these as natural reference points. &quot;I see you mentioned [thing]. Tell me more about that.&quot; Don&rsquo;t lead with them — let the conversation flow. They&rsquo;re there so you&rsquo;re ready, not so you can perform preparedness.
        </p>
        <p className="text-xs text-deep-teal/60 italic">
          The card auto-hides once the lead moves to Application — by then it&rsquo;s Wendy&rsquo;s job, not yours.
        </p>
      </OnboardingSection>

      <OnboardingSection number={5} total={TOTAL} title="The lead-facing first touch — your one-click send">
        <p>
          Below the prep card, you&rsquo;ll see a card labeled <span className="font-semibold">Lead-facing first touch</span>. This is a short email drafted in Miles&rsquo;s voice with one verifiable specific thing from the lead&rsquo;s intake.
        </p>
        <p>
          Two buttons:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><span className="font-semibold">Send as-is in Gmail</span> — opens Gmail with the prospect&rsquo;s email, subject, and full body pre-filled. Hit send. Done.</li>
          <li><span className="font-semibold">Edit before send</span> — opens Gmail with the prospect&rsquo;s email and subject pre-filled, body left empty so you can rewrite from scratch.</li>
        </ul>
        <p>
          The shortlist URL is already in the body. They click → they see their curated rentals. You sign as yourself by default — change the signature in Gmail if Miles is sending instead.
        </p>
        <p className="text-xs text-deep-teal/60 italic">
          The cover always references one real thing from their intake (a daily anchor, a lifestyle priority, a neighborhood they mentioned). If it doesn&rsquo;t feel right, the &quot;Edit&quot; button gives you the launching pad.
        </p>
      </OnboardingSection>

      <OnboardingSection number={6} total={TOTAL} title="Moving the lead through stages">
        <p>
          Further down, the <span className="font-semibold">Pipeline stage</span> card shows all 9 stages. Tap any to advance. Writes back to Open Dispo instantly — no second screen, no manual update.
        </p>
        <p>
          The 9 stages, in order:
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li>Inquiry</li>
          <li>Criteria Captured</li>
          <li>Agreement Signed</li>
          <li>Active Search</li>
          <li>Tour Stage</li>
          <li>Application <span className="text-gold-dark">← Wendy activates here</span></li>
          <li>Lease Signed</li>
          <li>Post-Move Nurture</li>
          <li>Future Buyer Activation</li>
        </ol>
        <p>
          Each stage carries a probability (Inquiry 10%, Tour Stage 80%, Lease Signed 100%). That feeds the pipeline pulse at the top.
        </p>
      </OnboardingSection>

      <OnboardingSection number={7} total={TOTAL} title="The relay to Wendy">
        <p>
          Below the stage card, the <span className="font-semibold">What&rsquo;s next · the relay</span> panel shows you when Wendy gets pulled in.
        </p>
        <p>
          Before Application: it says &quot;Wendy gets pulled in at Application — X stages away.&quot; She&rsquo;s standing by, not active yet.
        </p>
        <p>
          At Application or beyond: it says &quot;Wendy is active on this file.&quot; Her TC dashboard activates the second you move the stage.
        </p>
        <p>
          One-click button: <span className="font-semibold">Open Wendy&rsquo;s view</span>. Useful when you want to see exactly what she&rsquo;s seeing, or to verify a handoff landed.
        </p>
        <CtaLink href={DEMO_TC_URL} label="See Wendy&rsquo;s view of TestF" />
      </OnboardingSection>

      <OnboardingSection number={8} total={TOTAL} title="The shortlist mirror">
        <p>
          At the bottom of your dashboard, you see the exact same property shortlist the lead sees. Same vibes paragraph, same lifestyle anchors, same actionable phone numbers + addresses + InsiderRVA links.
        </p>
        <p>
          Use it on the call. Pull up a property by name, look at the vibes paragraph and lease-trap red flags before talking about it, click the phone number to test it before recommending. You&rsquo;re seeing exactly what they see.
        </p>
        <CtaLink href={DEMO_CLIENT_URL} label="See the lead&rsquo;s view (TestF)" />
      </OnboardingSection>

      <OnboardingSection number={9} total={TOTAL} title="Common questions">
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-1">What if I can&rsquo;t call within 10 minutes?</p>
            <p className="text-sm text-deep-teal/80">A voicemail with one specific intake detail (&quot;Hey, saw you mentioned the Sunday brunch walk with [dog name] — I&rsquo;ve got 3 spots that fit&quot;) beats a delayed call. The prep card is built for exactly this scenario.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Can I send the shortlist before calling?</p>
            <p className="text-sm text-deep-teal/80">You can, but the call-first approach builds more trust because you reflect their words back at them. Try both and see which converts better for your style.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">What if the AI-drafted cover doesn&rsquo;t fit?</p>
            <p className="text-sm text-deep-teal/80">Click &quot;Edit before send.&quot; Gmail opens with the prospect&rsquo;s email and subject filled in. Body is yours to write. The drafted text is a starting point, never a hard requirement.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">What if I tap the wrong stage by accident?</p>
            <p className="text-sm text-deep-teal/80">Just tap the right one. It writes back to Open Dispo immediately and refreshes the page. No undo button, but stages are non-destructive — you can advance and retreat freely.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">What happens if I open someone else&rsquo;s dashboard?</p>
            <p className="text-sm text-deep-teal/80">You can&rsquo;t — every URL has a 32-character token tied to one specific contact. There&rsquo;s no master view. Each lead&rsquo;s dashboard is its own page.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Does Wendy see what I write in the Notes?</p>
            <p className="text-sm text-deep-teal/80">Yes. Your contact notes show on her TC dashboard in a &quot;What Chosen logged&quot; section. Be specific — she relies on what you captured.</p>
          </div>
        </div>
      </OnboardingSection>

      <OnboardingSection number={10} total={TOTAL} title="You&rsquo;re ready">
        <p>
          That&rsquo;s the whole tool. Bookmark the TestF dashboard above so you can revisit this walkthrough by exploring the live demo any time. For real leads, the link comes from each contact&rsquo;s Note in Open Dispo.
        </p>
        <p>
          The system gets sharper the more you use it. If something feels off, tell Miles — the next pass folds your feedback in. This is your tool, built around how you work.
        </p>
        <CtaLink href={DEMO_AGENT_URL} label="Open your TestF dashboard" />
      </OnboardingSection>

      <OnboardingFooter />
    </main>
  );
}
