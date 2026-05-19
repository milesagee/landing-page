"use client";

import type { PropertyIntakePayload } from "@/lib/host-data";

const CURRENT_STATES: PropertyIntakePayload["currentState"][] = [
  "Vacant",
  "Tenant-occupied",
  "Living in it",
  "Mid-rehab",
];

const FURNISHING_STATES: PropertyIntakePayload["furnishingStatus"][] = [
  "Fully furnished",
  "Partially furnished",
  "Empty",
  "Help me decide",
];

const TARGET_MARKETS = [
  "Executive & business travel",
  "Weekend Carytown crowd",
  "Families & groups",
  "Long-stay (30+ nights)",
  "You tell me what fits",
];

const RESTRICTIONS = [
  "HOA",
  "Condo bylaws",
  "Already registered with City of Richmond",
  "Haven't checked any of these yet",
];

const CAPITAL_BUCKETS: PropertyIntakePayload["capitalBucket"][] = [
  "Under $5k",
  "$5–15k",
  "$15–30k",
  "$30k+",
];

const HANDS_ON: PropertyIntakePayload["handsOn"][] = [
  "Fully hands-off (MAMS coordinates everything end-to-end)",
  "Mostly hands-off (I'll touch one or two pieces, MAMS handles the rest)",
  "Self-managed (I drive day-to-day, MAMS is the playbook + backstop)",
];

export function PropertyIntakeCard({
  index,
  value,
  onChange,
}: {
  index: number;
  value: PropertyIntakePayload;
  onChange: (next: PropertyIntakePayload) => void;
}) {
  const set = <K extends keyof PropertyIntakePayload>(
    key: K,
    v: PropertyIntakePayload[K],
  ) => onChange({ ...value, [key]: v });

  const toggleArr = (key: "targetMarket" | "restrictions", item: string, max?: number) => {
    const arr = value[key];
    const has = arr.includes(item);
    let next: string[];
    if (has) {
      next = arr.filter((x) => x !== item);
    } else {
      if (max && arr.length >= max) return;
      next = [...arr, item];
    }
    onChange({ ...value, [key]: next });
  };

  return (
    <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
          Property {index + 1}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        <Field label="Nickname or address" required>
          <input
            type="text"
            value={value.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            placeholder='e.g. "Carytown spot" or "3210 W Cary St"'
            className="w-full text-base text-deep-teal border-b-2 border-deep-teal/20 focus:border-gold focus:outline-none py-2 bg-transparent placeholder:text-deep-teal/35"
          />
        </Field>

        <Field label="Current state" required>
          <RadioGroup
            name={`currentState-${index}`}
            options={[...CURRENT_STATES]}
            value={value.currentState}
            onChange={(v) => set("currentState", v as PropertyIntakePayload["currentState"])}
          />
        </Field>

        <Field label="Furnishing status" required>
          <RadioGroup
            name={`furnishingStatus-${index}`}
            options={[...FURNISHING_STATES]}
            value={value.furnishingStatus}
            onChange={(v) =>
              set("furnishingStatus", v as PropertyIntakePayload["furnishingStatus"])
            }
          />
        </Field>

        <Field label="Who you want to attract" hint="Pick up to 2">
          <ChipGroup
            options={TARGET_MARKETS}
            selected={value.targetMarket}
            onToggle={(item) => toggleArr("targetMarket", item, 2)}
          />
        </Field>

        <Field label="What you know about restrictions" hint="Optional, check any that apply">
          <ChipGroup
            options={RESTRICTIONS}
            selected={value.restrictions}
            onToggle={(item) => toggleArr("restrictions", item)}
          />
        </Field>

        <Field label="Capital you're comfortable putting in to launch" required>
          <SegmentedGroup
            name={`capital-${index}`}
            options={[...CAPITAL_BUCKETS]}
            value={value.capitalBucket}
            onChange={(v) => set("capitalBucket", v as PropertyIntakePayload["capitalBucket"])}
          />
        </Field>

        <Field label="How hands-off do you want this?" hint="Most owners pick fully hands-off" required>
          <RadioGroup
            name={`handsOn-${index}`}
            options={[...HANDS_ON]}
            value={value.handsOn}
            onChange={(v) => set("handsOn", v as PropertyIntakePayload["handsOn"])}
            stacked
          />
        </Field>

        <Field label="Target go-live month" required>
          <input
            type="month"
            value={value.targetMonth}
            onChange={(e) => set("targetMonth", e.target.value)}
            className="text-base text-deep-teal border-b-2 border-deep-teal/20 focus:border-gold focus:outline-none py-2 bg-transparent"
          />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.16em] text-deep-teal/60 font-semibold mb-3">
        {label}
        {required && <span className="text-gold-dark ml-1">*</span>}
        {hint && (
          <span className="ml-2 text-deep-teal/45 normal-case tracking-normal font-normal">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  stacked,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  stacked?: boolean;
}) {
  return (
    <div className={stacked ? "space-y-2" : "flex flex-wrap gap-2"}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            className={`cursor-pointer text-sm leading-snug px-4 py-2.5 rounded-md border transition-colors ${
              selected
                ? "bg-deep-teal text-ivory border-deep-teal"
                : "bg-paper text-deep-teal/85 border-deep-teal/15 hover:border-gold/50"
            } ${stacked ? "block" : "inline-block"}`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={selected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function SegmentedGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            className={`cursor-pointer text-center text-sm font-semibold py-3 rounded-md border transition-colors ${
              selected
                ? "bg-gold text-deep-teal border-gold"
                : "bg-paper text-deep-teal/80 border-deep-teal/15 hover:border-gold/60"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={selected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onToggle(opt)}
            className={`text-sm leading-snug px-4 py-2 rounded-full border transition-colors ${
              isSelected
                ? "bg-deep-teal text-ivory border-deep-teal"
                : "bg-paper text-deep-teal/85 border-deep-teal/15 hover:border-gold/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
