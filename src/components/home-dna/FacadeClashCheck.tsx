"use client";

import { useState } from "react";
import type { FacadeExample } from "@/lib/home-dna-data";

/**
 * Interactive Facade Clash Check. The buyer reads through real facade examples
 * and watches the rule resolve to PASS or FLAG. The Tupper Branch example is the
 * calibration proof: it MUST render FLAG, matching the home Mary walked away from
 * on the exterior alone. Client-side only, no network, no GHL writes.
 */
export function FacadeClashCheck({ examples }: { examples: FacadeExample[] }) {
  const [active, setActive] = useState(
    // Open on the calibration example so the proof is the first thing she sees.
    Math.max(
      0,
      examples.findIndex((e) => e.isCalibration),
    ),
  );

  const current = examples[active];

  return (
    <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      <div className="px-6 sm:px-8 py-4 bg-deep-teal/[0.04] border-b border-deep-teal/10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
          Run a front through it
        </p>
      </div>

      <div className="px-6 sm:px-8 pt-5 flex flex-wrap gap-2">
        {examples.map((e, i) => (
          <button
            key={e.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`text-xs font-semibold px-3.5 py-2 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
              i === active
                ? "bg-deep-teal text-ivory"
                : "bg-deep-teal/[0.06] text-deep-teal/75 hover:bg-deep-teal/10"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md ${
              current.verdict === "FLAG"
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            }`}
          >
            {current.verdict === "FLAG" ? "Flag" : "Pass"}
          </span>
          {current.isCalibration && (
            <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold">
              Your real reaction, scored
            </span>
          )}
        </div>
        <p className="text-sm text-deep-teal/55 mb-2">{current.materials}</p>
        <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">{current.why}</p>
      </div>
    </div>
  );
}
