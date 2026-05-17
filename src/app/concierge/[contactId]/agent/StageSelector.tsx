"use client";

import { useTransition } from "react";
import { moveStageAction } from "./actions";
import type { ConciergeStage } from "@/lib/ghl-concierge-agent";

interface Props {
  contactId: string;
  token: string;
  opportunityId: string;
  currentStageId: string;
  stages: ConciergeStage[];
}

export function StageSelector({ contactId, token, opportunityId, currentStageId, stages }: Props) {
  const [pending, startTransition] = useTransition();

  const handleClick = (stageId: string) => {
    if (stageId === currentStageId || pending) return;
    const fd = new FormData();
    fd.set("contactId", contactId);
    fd.set("token", token);
    fd.set("opportunityId", opportunityId);
    fd.set("stageId", stageId);
    startTransition(async () => {
      try {
        await moveStageAction(fd);
      } catch (e) {
        alert(`Stage move failed: ${e instanceof Error ? e.message : "unknown"}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {stages.map((s) => {
        const isCurrent = s.id === currentStageId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleClick(s.id)}
            disabled={pending || isCurrent}
            className={[
              "text-left px-3 py-2 rounded-md border text-sm font-medium transition",
              "disabled:opacity-100",
              isCurrent
                ? "bg-deep-teal text-ivory border-deep-teal shadow-sm"
                : "bg-white text-deep-teal border-deep-teal/15 hover:border-gold-dark hover:bg-paper",
              pending && !isCurrent ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <div className="text-[10px] uppercase tracking-[0.12em] text-current/70 mb-0.5">
              {s.position + 1}
            </div>
            <div className="text-[13px] leading-tight">{s.name}</div>
            <div className={[
              "text-[10px] mt-1",
              isCurrent ? "text-ivory/70" : "text-deep-teal/55",
            ].join(" ")}>
              {Math.round(s.probability * 100)}% likely to close
            </div>
          </button>
        );
      })}
    </div>
  );
}
