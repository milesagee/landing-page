"use client";

import { useMemo, useState } from "react";

type ChipKey = "Morning" | "Afternoon" | "Evening";
const CHIPS: ChipKey[] = ["Morning", "Afternoon", "Evening"];
const CHIP_LABEL: Record<ChipKey, string> = {
  Morning: "Morning (9-12)",
  Afternoon: "Afternoon (12-5)",
  Evening: "Evening (5-8)",
};

export type AvailabilitySelection = Record<string, ChipKey[]>;

export type LockedWindow = {
  dayKey: string;
  chip: ChipKey;
  label: string;
};

export function AvailabilityPicker({
  contactId,
  shareToken,
  lockedWindows = [],
  startISO,
  days = 7,
}: {
  contactId: string;
  shareToken: string;
  lockedWindows?: LockedWindow[];
  startISO?: string;
  days?: number;
}) {
  const dayList = useMemo(() => buildDays(startISO, days), [startISO, days]);
  const [selection, setSelection] = useState<AvailabilitySelection>({});
  const [submitState, setSubmitState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lockedMap = useMemo(() => {
    const m: Record<string, Set<ChipKey>> = {};
    for (const w of lockedWindows) {
      if (!m[w.dayKey]) m[w.dayKey] = new Set();
      m[w.dayKey].add(w.chip);
    }
    return m;
  }, [lockedWindows]);

  const toggle = (dayKey: string, chip: ChipKey) => {
    if (lockedMap[dayKey]?.has(chip)) return;
    setSelection((prev) => {
      const cur = prev[dayKey] || [];
      const next = cur.includes(chip) ? cur.filter((c) => c !== chip) : [...cur, chip];
      return { ...prev, [dayKey]: next };
    });
  };

  const setAllDay = (dayKey: string) => {
    const allLocked = CHIPS.every((c) => lockedMap[dayKey]?.has(c));
    if (allLocked) return;
    setSelection((prev) => {
      const cur = prev[dayKey] || [];
      const allSelected = CHIPS.every((c) => cur.includes(c) || lockedMap[dayKey]?.has(c));
      if (allSelected) {
        return { ...prev, [dayKey]: cur.filter((c) => lockedMap[dayKey]?.has(c)) };
      }
      const next = CHIPS.filter((c) => !lockedMap[dayKey]?.has(c));
      return { ...prev, [dayKey]: next };
    });
  };

  const summary = useMemo(() => buildSummary(dayList, selection, lockedMap), [dayList, selection, lockedMap]);

  const onSubmit = async () => {
    setSubmitState("pending");
    setSubmitError(null);
    try {
      const res = await fetch(
        `/api/listing/${contactId}/availability?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selection, summary }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Submission failed");
      }
      setSubmitState("done");
    } catch (e) {
      setSubmitState("error");
      setSubmitError((e as Error).message);
    }
  };

  if (submitState === "done") {
    return (
      <div className="bg-deep-teal text-ivory rounded-lg p-6 sm:p-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
          Locked in
        </p>
        <p className="font-display text-2xl sm:text-3xl text-ivory leading-tight">
          Got it. Wendy and I take it from here.
        </p>
        <div className="bg-ivory/[0.06] border border-ivory/15 rounded-md p-4 mt-3 space-y-2 text-sm text-ivory/90">
          {summary.length === 0 ? (
            <p>You didn&rsquo;t select any windows. Open at least one when you have a chance and I&rsquo;ll re-broadcast to the buyer agents.</p>
          ) : (
            summary.map((s, i) => (
              <p key={i}>
                <span className="font-semibold text-gold">{s.day}:</span> {s.windows.join(" / ")}
              </p>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => setSubmitState("idle")}
          className="text-xs text-ivory/60 underline hover:text-gold mt-2"
        >
          Change my availability
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {dayList.map((d) => {
          const sel = selection[d.key] || [];
          const locked = lockedMap[d.key] || new Set();
          const allSelected =
            CHIPS.every((c) => sel.includes(c) || locked.has(c)) && (sel.length > 0 || locked.size === 3);
          return (
            <div key={d.key} className="bg-white rounded-lg border border-deep-teal/10 p-4">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-display text-base text-deep-teal">{d.label}</p>
                {locked.size === 0 && (
                  <button
                    type="button"
                    onClick={() => setAllDay(d.key)}
                    className={`text-[10px] uppercase tracking-[0.14em] font-semibold ${
                      allSelected ? "text-deep-teal/40" : "text-gold-dark hover:text-deep-teal"
                    }`}
                  >
                    {allSelected ? "All set" : "All day"}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((c) => {
                  const isLocked = locked.has(c);
                  const isSelected = sel.includes(c) || isLocked;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(d.key, c)}
                      disabled={isLocked}
                      className={`text-sm font-medium rounded-full px-4 py-2 border transition-colors ${
                        isLocked
                          ? "bg-gold/15 border-gold/40 text-deep-teal/80 cursor-default"
                          : isSelected
                          ? "bg-deep-teal text-ivory border-deep-teal"
                          : "bg-white text-deep-teal/70 border-deep-teal/15 hover:border-deep-teal/40"
                      }`}
                    >
                      {isLocked ? `${CHIP_LABEL[c]} - booked` : CHIP_LABEL[c]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitState === "pending"}
        className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-deep-teal font-semibold text-base px-6 py-3.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitState === "pending" ? "Sending..." : "Submit my availability"}
      </button>
      <p className="text-[11px] text-deep-teal/55 leading-relaxed">
        Once you submit, Wendy and Miles get your windows. Buyer agents only get the slots you said yes to. You can change this anytime.
      </p>
      {submitError && (
        <p className="text-xs text-red-700">
          Something snagged: {submitError}. Text Miles or Wendy directly and they&rsquo;ll log it.
        </p>
      )}
    </div>
  );
}

function buildDays(startISO: string | undefined, days: number) {
  const start = startISO ? new Date(startISO) : new Date();
  start.setHours(12, 0, 0, 0);
  const list: { key: string; label: string }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    list.push({ key, label });
  }
  return list;
}

function buildSummary(
  dayList: { key: string; label: string }[],
  selection: AvailabilitySelection,
  lockedMap: Record<string, Set<ChipKey>>,
) {
  const out: { day: string; windows: string[] }[] = [];
  for (const d of dayList) {
    const sel = selection[d.key] || [];
    const locked = Array.from(lockedMap[d.key] || []);
    const combined = Array.from(new Set([...sel, ...locked]));
    if (combined.length === 0) continue;
    const windows = CHIPS.filter((c) => combined.includes(c)).map((c) => {
      const lockedSuffix = locked.includes(c) && !sel.includes(c) ? " (booked)" : "";
      return CHIP_LABEL[c] + lockedSuffix;
    });
    out.push({ day: d.label, windows });
  }
  return out;
}
