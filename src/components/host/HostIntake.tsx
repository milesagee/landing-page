"use client";

import { useMemo, useState } from "react";
import type { HostContact, HostIntakePayload, PropertyIntakePayload } from "@/lib/host-data";
import { PropertyIntakeCard } from "./PropertyIntakeCard";

const emptyProperty = (): PropertyIntakePayload => ({
  nickname: "",
  currentState: "",
  furnishingStatus: "",
  targetMarket: [],
  restrictions: [],
  capitalBucket: "",
  handsOn: "",
  targetMonth: "",
});

const REQUIRED_KEYS: (keyof PropertyIntakePayload)[] = [
  "nickname",
  "currentState",
  "furnishingStatus",
  "capitalBucket",
  "handsOn",
  "targetMonth",
];

export function HostIntake({
  data,
  shareToken,
}: {
  data: HostContact;
  shareToken: string;
}) {
  const [properties, setProperties] = useState<PropertyIntakePayload[]>(
    Array.from({ length: data.propertyCount }, emptyProperty),
  );
  const [whyNow, setWhyNow] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const setProperty = (i: number, next: PropertyIntakePayload) => {
    setProperties((curr) => curr.map((p, idx) => (idx === i ? next : p)));
  };

  const canSubmit = useMemo(() => {
    return properties.every((p) =>
      REQUIRED_KEYS.every((k) => {
        const v = p[k];
        return typeof v === "string" ? v.trim().length > 0 : true;
      }),
    );
  }, [properties]);

  const onSubmit = async () => {
    if (state === "pending" || !canSubmit) return;
    setState("pending");
    setError(null);
    try {
      const payload: HostIntakePayload = { properties, whyNow, anythingElse };
      const res = await fetch(
        `/api/host/${data.contactId}/intake?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Submission failed");
      setState("done");
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  };

  if (state === "done") {
    return (
      <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
        <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
            Autopilot, engaged
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-3">
          <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
            Got it, {data.firstName}. The engine&rsquo;s already running.
          </p>
          <p className="text-sm sm:text-base text-ivory/85 leading-relaxed">
            Behind the scenes my research crew is pulling Carytown short-term-rental comps, occupancy rates, the City of Richmond permit landscape, and a vetted vendor cluster for both your spots specifically.
          </p>
          <p className="text-sm sm:text-base text-ivory/85 leading-relaxed">
            Inside 48 hours you&rsquo;ll get your autopilot game plan in your inbox, built from your actual answers, not a template. After that, I run it. You stay hands-off.
          </p>
          <p className="text-sm sm:text-base text-ivory/85 leading-relaxed">
            If anything else comes to mind before then, just text me.
          </p>
          <p className="text-sm text-gold pt-2">&mdash; Miles</p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {properties.map((p, i) => (
        <PropertyIntakeCard
          key={i}
          index={i}
          value={p}
          onChange={(next) => setProperty(i, next)}
        />
      ))}

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            A little more context
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label
              htmlFor="whyNow"
              className="block text-[11px] uppercase tracking-[0.16em] text-deep-teal/60 font-semibold mb-2"
            >
              Why now?
              <span className="ml-2 text-deep-teal/45 normal-case tracking-normal font-normal">
                Optional. 1&ndash;3 sentences.
              </span>
            </label>
            <textarea
              id="whyNow"
              value={whyNow}
              onChange={(e) => setWhyNow(e.target.value)}
              rows={3}
              placeholder="What's driving the timing? Anything we should know about your bigger picture."
              className="w-full text-base text-deep-teal border border-deep-teal/15 rounded-md focus:border-gold focus:outline-none p-3 bg-paper placeholder:text-deep-teal/35 leading-relaxed"
            />
          </div>

          <div>
            <label
              htmlFor="anythingElse"
              className="block text-[11px] uppercase tracking-[0.16em] text-deep-teal/60 font-semibold mb-2"
            >
              Anything else?
              <span className="ml-2 text-deep-teal/45 normal-case tracking-normal font-normal">
                Optional
              </span>
            </label>
            <textarea
              id="anythingElse"
              value={anythingElse}
              onChange={(e) => setAnythingElse(e.target.value)}
              rows={3}
              placeholder="Vendors you already use, ideas you've been kicking around, hard nos."
              className="w-full text-base text-deep-teal border border-deep-teal/15 rounded-md focus:border-gold focus:outline-none p-3 bg-paper placeholder:text-deep-teal/35 leading-relaxed"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What we&rsquo;re running for you the moment you submit
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-5 text-sm sm:text-base text-deep-teal/80 leading-relaxed">
          <p className="text-deep-teal/85">
            Your answers don&rsquo;t sit in a queue. They kick off a research and planning engine the same moment you hit send. Here&rsquo;s the inside view:
          </p>
          <EngineRow
            label="Deep market research"
            body="A long-running research crew pulls Carytown short-term-rental comps, occupancy benchmarks, ADR seasonality, and the City of Richmond STR permit landscape, tuned to both your specific addresses."
          />
          <EngineRow
            label="Preliminary scout pass"
            body="Lighter, lower-cost sub-agents run preliminary sweeps on furnishing comps, photography partners, dynamic pricing platforms (Wheelhouse / PriceLabs / AirDNA), and cleaning crews already vetted in Richmond."
          />
          <EngineRow
            label="Tailored autopilot game plan"
            body="Inside 48 hours, Miles personally lands your custom plan in your inbox: vendor cluster, capital allocation, go-live timeline, and the exact pieces MAMS handles vs anything you wanted to touch."
          />
          <EngineRow
            label="Then we just run it"
            body="You stay hands-off. MAMS coordinates vendors, manages the launch, and reports back on a cadence you choose. Income shows up. You stay focused on whatever else you&rsquo;re building."
          />
        </div>
      </section>

      <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8 space-y-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={state === "pending" || !canSubmit}
            className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-base px-6 py-3.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "pending" ? "Sending..." : `Engage autopilot, Miles`}
          </button>
          {!canSubmit && state !== "pending" && (
            <p className="text-[11px] text-ivory/60 leading-relaxed">
              Fill the required fields on both properties to send. Required fields are marked with a gold asterisk.
            </p>
          )}
          {state === "error" && error && (
            <p className="text-xs text-red-300">
              Something snagged: {error}. Text Miles directly and he&rsquo;ll grab it manually.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function EngineRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-dark flex-shrink-0" />
      <div>
        <p className="font-display text-lg text-deep-teal leading-tight">{label}</p>
        <p className="text-sm sm:text-base text-deep-teal/75 leading-relaxed mt-1">{body}</p>
      </div>
    </div>
  );
}
