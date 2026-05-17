"use client";

import { useEffect, useState } from "react";
import type { TcChecklistItem } from "@/lib/concierge-tc";

interface Props {
  contactId: string;
  items: TcChecklistItem[];
}

/**
 * TC compliance checklist. State persists in localStorage so Wendy can mark
 * items complete and see them stay marked across reloads — until we wire
 * write-back to GHL in Phase C, this is the bridge.
 */
export function ChecklistCard({ contactId, items }: Props) {
  const storageKey = `mams-tc-checklist-${contactId}-v1`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const completeCount = items.filter((i) => checked[i.id]).length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold-dark font-semibold">
          Compliance checklist
        </p>
        <span className="text-xs text-deep-teal/60">
          {mounted ? `${completeCount} / ${items.length} complete` : `${items.length} items`}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <label
                className={[
                  "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition",
                  isChecked
                    ? "bg-paper border-deep-teal/15 opacity-70"
                    : "bg-white border-deep-teal/10 hover:border-gold-dark/40",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-4 w-4 accent-deep-teal cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className={[
                    "text-sm font-medium",
                    isChecked ? "line-through text-deep-teal/60" : "text-deep-teal",
                  ].join(" ")}>
                    {item.label}
                  </div>
                  <div className="text-xs text-deep-teal/65 mt-1 leading-relaxed">
                    {item.context}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px]">
                    <span className="text-deep-teal/55">Required by: <span className="text-deep-teal/80">{item.requiredBy}</span></span>
                    {item.legalCitation ? (
                      <span className="text-deep-teal/55">Citation: <span className="text-deep-teal/80">{item.legalCitation}</span></span>
                    ) : null}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-deep-teal/55 italic mt-3">
        Checklist state is local to this browser. Once Phase C ships, completion will write back to Open Dispo on the contact.
      </p>
    </div>
  );
}
