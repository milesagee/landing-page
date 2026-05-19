"use client";

import { useMemo, useState } from "react";
import {
  type BuyerIntakeContact,
  type BuyerIntakePayload,
  type IntakeCurrentSituation,
  type IntakeTimeline,
  type Stage1Response,
  validateIntake,
  NEIGHBORHOOD_CHIPS,
  MUST_HAVE_CHIPS,
  TIMELINE_OPTIONS,
  SITUATION_OPTIONS,
} from "@/lib/buyer-intake-data";
import { Stage1InsightPanel } from "./Stage1InsightPanel";

type WizardState = "step1" | "step2" | "step3" | "step4" | "step5" | "submitting" | "done" | "error";

export function BuyerIntakeWizard({
  contactId,
  shareToken,
  contact,
}: {
  contactId: string;
  shareToken: string;
  contact: BuyerIntakeContact;
}) {
  const [state, setState] = useState<WizardState>("step1");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stage1, setStage1] = useState<Stage1Response | null>(null);
  const [eta, setEta] = useState<string>("");

  // Step 1: budget + footprint
  const [budgetMin, setBudgetMin] = useState<number>(contact.prefill?.budgetMin ?? 250000);
  const [budgetMax, setBudgetMax] = useState<number>(contact.prefill?.budgetMax ?? 450000);
  const [minBeds, setMinBeds] = useState<number>(contact.prefill?.minBeds ?? 2);
  const [minBaths, setMinBaths] = useState<number>(contact.prefill?.minBaths ?? 1);

  // Step 2: neighborhoods
  const [topNeighborhoods, setTopNeighborhoods] = useState<string[]>(
    contact.prefill?.topNeighborhoods ?? [],
  );

  // Step 3: must-haves
  const [mustHaves, setMustHaves] = useState<string[]>(contact.prefill?.mustHaves ?? []);

  // Step 4: timeline + prequal + situation
  const [timeline, setTimeline] = useState<IntakeTimeline>(
    contact.prefill?.timeline ?? "next-90-days",
  );
  const [prequalAmount, setPrequalAmount] = useState<number>(
    contact.prefill?.prequalAmount ?? 400000,
  );
  const [currentSituation, setCurrentSituation] = useState<IntakeCurrentSituation>(
    contact.prefill?.currentSituation ?? "renting",
  );

  // Step 5: notes
  const [notes, setNotes] = useState<string>(contact.prefill?.notes ?? "");

  const stepIdx = useMemo(() => {
    const map: Record<WizardState, number> = {
      step1: 0,
      step2: 1,
      step3: 2,
      step4: 3,
      step5: 4,
      submitting: 4,
      done: 5,
      error: 4,
    };
    return map[state];
  }, [state]);

  const submit = async () => {
    const payload: BuyerIntakePayload = {
      budgetMin,
      budgetMax,
      prequalAmount,
      minBeds,
      minBaths,
      topNeighborhoods,
      mustHaves,
      timeline,
      currentSituation,
      notes,
      submittedAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    const err = validateIntake(payload);
    if (err) {
      setState("error");
      setErrorMsg(`${err.field}: ${err.reason}`);
      return;
    }

    setState("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/buyer-intake/${contactId}/submit?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Submission failed");
      }
      setStage1(json.stage1 || null);
      setEta(json.eta || "tonight");
      setState("done");
    } catch (e) {
      setState("error");
      setErrorMsg((e as Error).message);
    }
  };

  if (state === "done") {
    return (
      <Stage1InsightPanel
        firstName={contact.firstName}
        stage1={stage1}
        eta={eta}
        onReset={() => {
          setState("step1");
          setStage1(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={stepIdx} total={5} />

      {state === "step1" && (
        <Step1
          budgetMin={budgetMin}
          budgetMax={budgetMax}
          minBeds={minBeds}
          minBaths={minBaths}
          onBudgetMin={setBudgetMin}
          onBudgetMax={setBudgetMax}
          onMinBeds={setMinBeds}
          onMinBaths={setMinBaths}
          onNext={() => setState("step2")}
        />
      )}

      {state === "step2" && (
        <Step2
          selected={topNeighborhoods}
          onChange={setTopNeighborhoods}
          onBack={() => setState("step1")}
          onNext={() => setState("step3")}
        />
      )}

      {state === "step3" && (
        <Step3
          selected={mustHaves}
          onChange={setMustHaves}
          onBack={() => setState("step2")}
          onNext={() => setState("step4")}
        />
      )}

      {state === "step4" && (
        <Step4
          timeline={timeline}
          prequalAmount={prequalAmount}
          currentSituation={currentSituation}
          onTimeline={setTimeline}
          onPrequal={setPrequalAmount}
          onSituation={setCurrentSituation}
          onBack={() => setState("step3")}
          onNext={() => setState("step5")}
        />
      )}

      {state === "step5" && (
        <Step5
          notes={notes}
          onNotes={setNotes}
          onBack={() => setState("step4")}
          onSubmit={submit}
        />
      )}

      {state === "submitting" && (
        <div className="bg-white rounded-lg border border-deep-teal/10 p-8 text-center">
          <p className="font-display text-2xl text-deep-teal mb-3">Working on it.</p>
          <p className="text-sm text-deep-teal/70">
            Pulling together what we already see for you. Five seconds.
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="bg-white rounded-lg border border-red-200 p-6 space-y-3">
          <p className="font-display text-xl text-deep-teal">Something snagged.</p>
          <p className="text-sm text-deep-teal/80">{errorMsg}</p>
          <button
            type="button"
            onClick={() => setState("step1")}
            className="text-xs text-deep-teal underline hover:text-gold-dark"
          >
            Back to start
          </button>
        </div>
      )}
    </div>
  );
}

// ----- Sub-components -----

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-deep-teal/55 font-semibold">
        <span>Step {Math.min(current + 1, total)} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 w-full bg-deep-teal/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StepShell({ eyebrow, headline, children, footer }: {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
          {eyebrow}
        </p>
      </div>
      <div className="p-6 sm:p-8 space-y-6">
        <h2 className="font-display text-2xl sm:text-3xl text-deep-teal leading-tight">
          {headline}
        </h2>
        {children}
      </div>
      <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-t border-deep-teal/10 flex items-center justify-between">
        {footer}
      </div>
    </div>
  );
}

function Step1({
  budgetMin,
  budgetMax,
  minBeds,
  minBaths,
  onBudgetMin,
  onBudgetMax,
  onMinBeds,
  onMinBaths,
  onNext,
}: {
  budgetMin: number;
  budgetMax: number;
  minBeds: number;
  minBaths: number;
  onBudgetMin: (v: number) => void;
  onBudgetMax: (v: number) => void;
  onMinBeds: (v: number) => void;
  onMinBaths: (v: number) => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      eyebrow="Step 1 - Money and footprint"
      headline="What does your search shape look like?"
      footer={
        <>
          <span />
          <button
            type="button"
            onClick={onNext}
            disabled={!budgetMin || !budgetMax || budgetMax < budgetMin}
            className="bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-sm px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <DollarInput label="Budget min" value={budgetMin} onChange={onBudgetMin} step={10000} />
          <DollarInput label="Budget max" value={budgetMax} onChange={onBudgetMax} step={10000} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberStepper label="Min beds" value={minBeds} min={0} max={6} onChange={onMinBeds} />
          <NumberStepper label="Min baths" value={minBaths} min={1} max={5} onChange={onMinBaths} step={0.5} />
        </div>
        <p className="text-xs text-deep-teal/55 leading-relaxed border-l-2 border-gold/40 pl-3">
          Studio? Drop beds to zero. Half-bath? Bath stepper goes by 0.5.
        </p>
      </div>
    </StepShell>
  );
}

function Step2({
  selected,
  onChange,
  onBack,
  onNext,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const toggle = (n: string) => {
    if (selected.includes(n)) {
      onChange(selected.filter((x) => x !== n));
    } else {
      if (selected.length >= 5) return;
      onChange([...selected, n]);
    }
  };
  return (
    <StepShell
      eyebrow="Step 2 - Neighborhoods"
      headline="Which Richmond pockets are on your shortlist?"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-deep-teal/70 underline hover:text-deep-teal"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={selected.length === 0}
            className="bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-sm px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-deep-teal/75 leading-relaxed">
          Tap up to 5. Order matters: your first tap is your first choice. Adjacent neighborhoods
          worth a look will show up in the curated dashboard tonight.
        </p>
        <div className="flex flex-wrap gap-2">
          {NEIGHBORHOOD_CHIPS.map((n) => {
            const isSelected = selected.includes(n);
            const order = isSelected ? selected.indexOf(n) + 1 : null;
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                  isSelected
                    ? "bg-deep-teal text-ivory border-deep-teal"
                    : "bg-white text-deep-teal/70 border-deep-teal/15 hover:border-deep-teal/40"
                }`}
              >
                {order ? `${order}. ${n}` : n}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-deep-teal/55 leading-relaxed">
          {selected.length} of 5 selected.
        </p>
      </div>
    </StepShell>
  );
}

function Step3({
  selected,
  onChange,
  onBack,
  onNext,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const toggle = (s: string) => {
    if (selected.includes(s)) {
      onChange(selected.filter((x) => x !== s));
    } else {
      if (selected.length >= 3) return;
      onChange([...selected, s]);
    }
  };
  return (
    <StepShell
      eyebrow="Step 3 - Must-haves"
      headline="Pick up to three. What can&rsquo;t the right home be missing?"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-deep-teal/70 underline hover:text-deep-teal"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-sm px-6 py-2.5 rounded-md transition-colors"
          >
            Next
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {MUST_HAVE_CHIPS.map((c) => {
            const isSelected = selected.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                  isSelected
                    ? "bg-deep-teal text-ivory border-deep-teal"
                    : "bg-white text-deep-teal/70 border-deep-teal/15 hover:border-deep-teal/40"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-deep-teal/55 leading-relaxed">
          {selected.length} of 3 selected. Leave blank if nothing is truly non-negotiable.
        </p>
      </div>
    </StepShell>
  );
}

function Step4({
  timeline,
  prequalAmount,
  currentSituation,
  onTimeline,
  onPrequal,
  onSituation,
  onBack,
  onNext,
}: {
  timeline: IntakeTimeline;
  prequalAmount: number;
  currentSituation: IntakeCurrentSituation;
  onTimeline: (v: IntakeTimeline) => void;
  onPrequal: (v: number) => void;
  onSituation: (v: IntakeCurrentSituation) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      eyebrow="Step 4 - Timeline and reality"
      headline="When are you actually moving?"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-deep-teal/70 underline hover:text-deep-teal"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-sm px-6 py-2.5 rounded-md transition-colors"
          >
            Next
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-deep-teal/60 font-semibold mb-2">
            Timeline
          </p>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onTimeline(o.value)}
                className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                  timeline === o.value
                    ? "bg-deep-teal text-ivory border-deep-teal"
                    : "bg-white text-deep-teal/70 border-deep-teal/15 hover:border-deep-teal/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <DollarInput
          label="Prequal amount"
          value={prequalAmount}
          onChange={onPrequal}
          step={5000}
          hint="From your prequal letter. Tells me what's actually on the table."
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-deep-teal/60 font-semibold mb-2">
            Current housing
          </p>
          <div className="flex flex-wrap gap-2">
            {SITUATION_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onSituation(o.value)}
                className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                  currentSituation === o.value
                    ? "bg-deep-teal text-ivory border-deep-teal"
                    : "bg-white text-deep-teal/70 border-deep-teal/15 hover:border-deep-teal/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function Step5({
  notes,
  onNotes,
  onBack,
  onSubmit,
}: {
  notes: string;
  onNotes: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <StepShell
      eyebrow="Step 5 - Anything else"
      headline="Anything I should know that the chips didn&rsquo;t capture?"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-deep-teal/70 underline hover:text-deep-teal"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-base px-6 py-3 rounded-md transition-colors"
          >
            Submit
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value.slice(0, 2000))}
          rows={5}
          placeholder="The block on Stuart you used to walk by. A type of layout that drives you crazy. The dealbreaker the chips don't cover. Anything."
          className="w-full bg-paper border border-deep-teal/15 rounded-md p-4 text-sm text-deep-teal leading-relaxed focus:outline-none focus:border-deep-teal/40"
        />
        <p className="text-[11px] text-deep-teal/55">{notes.length} / 2000 characters</p>
      </div>
    </StepShell>
  );
}

// ----- Primitives -----

function DollarInput({
  label,
  value,
  onChange,
  step = 10000,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-deep-teal/60 font-semibold block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-teal/55 text-sm">$</span>
        <input
          type="number"
          step={step}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-paper border border-deep-teal/15 rounded-md py-2.5 pl-7 pr-3 text-sm text-deep-teal focus:outline-none focus:border-deep-teal/40"
        />
      </div>
      {hint && <p className="text-[11px] text-deep-teal/55 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function NumberStepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, Number((value - step).toFixed(1))));
  const inc = () => onChange(Math.min(max, Number((value + step).toFixed(1))));
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-deep-teal/60 font-semibold block mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-paper border border-deep-teal/15 rounded-md p-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="w-9 h-9 rounded-md bg-white border border-deep-teal/10 text-deep-teal/80 text-base hover:border-deep-teal/30 disabled:opacity-40"
        >
          -
        </button>
        <span className="flex-1 text-center font-display text-xl text-deep-teal">
          {value === 0 ? "Studio" : value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="w-9 h-9 rounded-md bg-white border border-deep-teal/10 text-deep-teal/80 text-base hover:border-deep-teal/30 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
