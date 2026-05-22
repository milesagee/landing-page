"use client";

import { useState } from "react";

type LayerVerdict = "yes" | "maybe" | "no" | null;
type VoiceChoice = "phone" | "laptop" | "no" | null;

type LayerKey = "voice" | "scoreboard" | "routing" | "ag";

const LAYERS: {
  key: LayerKey;
  eyebrow: string;
  title: string;
  body: string;
  changes: string;
}[] = [
  {
    key: "voice",
    eyebrow: "Layer 1",
    title: "Talk out loud, like you already do. I remember it.",
    body: "You told me thinking out loud while you study helps. ChatGPT does that fine, but it forgets you the next session. I can be on your phone the same way Miles has me on his. Tailscale, voice in, voice out. The trap library, the system map, and the scoreboard sharpen quietly between sessions, on their own. You do not have to re-type anything.",
    changes: "You stay verbal. You stop re-explaining yourself. Nothing you say is lost between days.",
  },
  {
    key: "scoreboard",
    eyebrow: "Layer 2",
    title: "The scoreboard becomes your 'enough' signal.",
    body: "You said you do not have an internal felt moment for 'I own this'. You read it off question performance. So I make the scoreboard louder. When you cross the threshold on a topic, mechanism depth, connection breadth, wordplay catch rate, recovery speed, I call it out by name. 'On cardiac drugs, you own this. Past-Anika would have spent another four hours here. You are done.'",
    changes: "You get permission to stop without anxiety. The proof is your own work, not my opinion.",
  },
  {
    key: "routing",
    eyebrow: "Layer 3",
    title: "Reclaimed time. Your call every session.",
    body: "When the scoreboard fires and you still have block-time left, I ask you what to do with it. Sleep. Time with Miles. A workout. AG. More drilling on a soft topic. Your call every time. Never a default. Never a nag.",
    changes: "No auto-route. The reclaimed time is honestly yours.",
  },
  {
    key: "ag",
    eyebrow: "Layer 4",
    title: "AG Home Buyers, packaged for the head, not the operator.",
    body: "You are the head of AG Home Buyers. Aaliyah operates. Jacob and Farris close. Miles is dispositions. The work that is yours is the decisions. Approve this offer. Pivot to Retail Max on this lead. I package the calls into 15 to 30 minute units with one decision per unit, so each one fits into time you got back from nursing.",
    changes: "AG is not a second job. It is a series of small, sharp calls only you can make.",
  },
];

function RadioChip({
  selected,
  label,
  value,
  onChange,
  tone,
}: {
  selected: boolean;
  label: string;
  value: LayerVerdict | VoiceChoice;
  onChange: () => void;
  tone: "yes" | "maybe" | "no";
}) {
  const base =
    "flex-1 text-center text-sm font-semibold py-2.5 px-3 rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
  const tones = {
    yes: selected
      ? "bg-deep-teal text-ivory border-deep-teal shadow-[0_4px_12px_-2px_rgba(0,63,63,0.25)]"
      : "bg-white text-deep-teal/75 border-deep-teal/15 hover:border-deep-teal/40",
    maybe: selected
      ? "bg-gold text-deep-teal border-gold-dark shadow-[0_4px_12px_-2px_rgba(212,175,55,0.35)]"
      : "bg-white text-deep-teal/75 border-deep-teal/15 hover:border-gold-dark/60",
    no: selected
      ? "bg-white text-deep-teal border-deep-teal/50 shadow-[0_2px_8px_-2px_rgba(0,63,63,0.15)]"
      : "bg-white text-deep-teal/55 border-deep-teal/10 hover:border-deep-teal/30",
  };
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={selected}
      data-value={value ?? ""}
      className={`${base} ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export function PlanReview({ shareToken }: { shareToken: string }) {
  const [verdicts, setVerdicts] = useState<Record<LayerKey, LayerVerdict>>({
    voice: null,
    scoreboard: null,
    routing: null,
    ag: null,
  });
  const [notes, setNotes] = useState<Record<LayerKey, string>>({
    voice: "",
    scoreboard: "",
    routing: "",
    ag: "",
  });
  const [voiceChoice, setVoiceChoice] = useState<VoiceChoice>(null);
  const [classes, setClasses] = useState("");
  const [hardest, setHardest] = useState("");
  const [nextTest, setNextTest] = useState("");
  const [openText, setOpenText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [submissionSummary, setSubmissionSummary] = useState("");

  const handleSubmit = async () => {
    setStatus("submitting");
    setErrorMsg("");

    const payload = {
      submittedAt: new Date().toISOString(),
      verdicts,
      notes,
      voiceChoice,
      nextTestCycle: { classes, hardest, nextTest },
      openText,
    };

    try {
      const res = await fetch(
        `/api/anika/plan-review?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submit failed (${res.status})`);
      }
      setSubmissionSummary(formatForClipboard(payload));
      setStatus("done");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  };

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(submissionSummary);
    } catch {
      // clipboard blocked, leave the textarea visible so Miles can copy manually
    }
  };

  if (status === "done") {
    return (
      <div className="space-y-6">
        <div className="bg-deep-teal text-ivory rounded-md p-7 shadow-[0_24px_48px_-20px_rgba(0,63,63,0.45)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold mb-2 font-semibold">
            Got it
          </p>
          <h2 className="font-display text-2xl sm:text-3xl leading-tight">
            Anika, I read everything you wrote.
          </h2>
          <p className="mt-3 text-sm text-ivory/85 leading-relaxed">
            Show this to Miles. He pastes it into our window and I rebuild the plan v2 with you in the room. Your dashboard goes live tomorrow with your own algorithm, scoreboard, trap library, and system map already loaded in the chrome you can see here.
          </p>
        </div>

        <div className="bg-white rounded-md p-6 border border-deep-teal/10 shadow-[0_8px_24px_-12px_rgba(0,63,63,0.12)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
              For Miles to paste to Monique
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold text-deep-teal underline underline-offset-4 decoration-gold hover:text-gold-dark transition"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            value={submissionSummary}
            className="w-full text-xs font-mono text-deep-teal/85 bg-paper rounded p-3 border border-deep-teal/10 min-h-[260px] leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {LAYERS.map((layer) => (
        <article
          key={layer.key}
          className="bg-white rounded-md p-6 sm:p-7 border border-deep-teal/8 shadow-[0_8px_28px_-14px_rgba(0,63,63,0.18)]"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">
            {layer.eyebrow}
          </p>
          <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-snug">
            {layer.title}
          </h3>
          <p className="mt-3 text-sm sm:text-[15px] text-deep-teal/80 leading-relaxed">
            {layer.body}
          </p>

          <div className="mt-5 border-l-2 border-gold/55 pl-4 py-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold-dark font-semibold mb-1">
              What this changes for you
            </p>
            <p className="text-sm text-deep-teal/85 leading-relaxed">
              {layer.changes}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <RadioChip
              selected={verdicts[layer.key] === "yes"}
              label="Yes, build it"
              value="yes"
              tone="yes"
              onChange={() =>
                setVerdicts((v) => ({ ...v, [layer.key]: "yes" }))
              }
            />
            <RadioChip
              selected={verdicts[layer.key] === "maybe"}
              label="Maybe, with a caveat"
              value="maybe"
              tone="maybe"
              onChange={() =>
                setVerdicts((v) => ({ ...v, [layer.key]: "maybe" }))
              }
            />
            <RadioChip
              selected={verdicts[layer.key] === "no"}
              label="No, this misses"
              value="no"
              tone="no"
              onChange={() =>
                setVerdicts((v) => ({ ...v, [layer.key]: "no" }))
              }
            />
          </div>

          <label className="block mt-4">
            <span className="text-[11px] uppercase tracking-[0.18em] text-deep-teal/55 font-semibold">
              Your note on this layer (optional)
            </span>
            <textarea
              rows={3}
              value={notes[layer.key]}
              onChange={(e) =>
                setNotes((n) => ({ ...n, [layer.key]: e.target.value }))
              }
              placeholder="The thing I would say if I were not clicking buttons..."
              className="mt-2 w-full text-sm text-deep-teal bg-paper border border-deep-teal/12 rounded p-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
            />
          </label>
        </article>
      ))}

      <article className="bg-white rounded-md p-6 sm:p-7 border border-deep-teal/8 shadow-[0_8px_28px_-14px_rgba(0,63,63,0.18)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">
          The voice partner
        </p>
        <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-snug">
          How do you want to use voice mode?
        </h3>
        <p className="mt-3 text-sm text-deep-teal/80 leading-relaxed">
          Miles uses me on his phone via Tailscale and Shortcuts. Voice in, voice out, no laptop required. The setup takes about 20 minutes once. After that you say 'drill me on cardiac' or 'score me' and I respond out loud.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <RadioChip
            selected={voiceChoice === "phone"}
            label="Yes, on my phone"
            value="phone"
            tone="yes"
            onChange={() => setVoiceChoice("phone")}
          />
          <RadioChip
            selected={voiceChoice === "laptop"}
            label="Just laptop is fine"
            value="laptop"
            tone="maybe"
            onChange={() => setVoiceChoice("laptop")}
          />
          <RadioChip
            selected={voiceChoice === "no"}
            label="ChatGPT is enough"
            value="no"
            tone="no"
            onChange={() => setVoiceChoice("no")}
          />
        </div>
      </article>

      <article className="bg-white rounded-md p-6 sm:p-7 border border-deep-teal/8 shadow-[0_8px_28px_-14px_rgba(0,63,63,0.18)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">
          Your next test cycle
        </p>
        <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-snug">
          So I can pull questions for the topic that actually matters.
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-deep-teal/55 font-semibold">
              Classes you are taking next
            </span>
            <input
              type="text"
              value={classes}
              onChange={(e) => setClasses(e.target.value)}
              placeholder="Med-Surg, Pharm, Maternal Health..."
              className="mt-2 w-full text-sm text-deep-teal bg-paper border border-deep-teal/12 rounded p-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-deep-teal/55 font-semibold">
              The one you are most worried about
            </span>
            <input
              type="text"
              value={hardest}
              onChange={(e) => setHardest(e.target.value)}
              placeholder="The topic or class that feels softest right now"
              className="mt-2 w-full text-sm text-deep-teal bg-paper border border-deep-teal/12 rounded p-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-deep-teal/55 font-semibold">
              When is the next test that matters
            </span>
            <input
              type="text"
              value={nextTest}
              onChange={(e) => setNextTest(e.target.value)}
              placeholder="Date, week, or 'not for a while'"
              className="mt-2 w-full text-sm text-deep-teal bg-paper border border-deep-teal/12 rounded p-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
            />
          </label>
        </div>
      </article>

      <article className="bg-white rounded-md p-6 sm:p-7 border border-deep-teal/8 shadow-[0_8px_28px_-14px_rgba(0,63,63,0.18)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">
          The big one
        </p>
        <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-snug">
          What else does Monique need to know?
        </h3>
        <p className="mt-3 text-sm text-deep-teal/80 leading-relaxed">
          Everything the four questions missed. The thing you thought of after Miles read them out loud. The thing you would have said if there were no UI in the way. The way you actually want me to work with you.
        </p>

        <textarea
          rows={8}
          value={openText}
          onChange={(e) => setOpenText(e.target.value)}
          placeholder="Write it however it comes out. I am reading every word."
          className="mt-4 w-full text-sm text-deep-teal bg-paper border border-deep-teal/12 rounded p-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition leading-relaxed"
        />
      </article>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-deep-teal/55">
          Nothing here goes anywhere until you submit. You can leave fields blank.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className="cta-primary px-7 py-3 rounded-md font-semibold text-sm uppercase tracking-[0.12em] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-8px_rgba(212,175,55,0.55)]"
        >
          {status === "submitting" ? "Sending..." : "Send to Monique"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Something went wrong: {errorMsg}. Try again, or just have Miles paste this from the page directly.
        </p>
      )}
    </div>
  );
}

function formatForClipboard(payload: {
  submittedAt: string;
  verdicts: Record<LayerKey, LayerVerdict>;
  notes: Record<LayerKey, string>;
  voiceChoice: VoiceChoice;
  nextTestCycle: { classes: string; hardest: string; nextTest: string };
  openText: string;
}) {
  const verdictLine = (k: LayerKey) =>
    `${k}: ${payload.verdicts[k] ?? "(no verdict)"}${
      payload.notes[k] ? ` -- ${payload.notes[k].trim()}` : ""
    }`;
  return [
    "ANIKA PLAN REVIEW (paste into the Monique window)",
    `submittedAt: ${payload.submittedAt}`,
    "",
    "Layer verdicts:",
    `  ${verdictLine("voice")}`,
    `  ${verdictLine("scoreboard")}`,
    `  ${verdictLine("routing")}`,
    `  ${verdictLine("ag")}`,
    "",
    `Voice mode: ${payload.voiceChoice ?? "(no answer)"}`,
    "",
    "Next test cycle:",
    `  classes: ${payload.nextTestCycle.classes || "(blank)"}`,
    `  hardest: ${payload.nextTestCycle.hardest || "(blank)"}`,
    `  next test: ${payload.nextTestCycle.nextTest || "(blank)"}`,
    "",
    "What else Monique needs to know:",
    payload.openText || "(blank)",
  ].join("\n");
}
