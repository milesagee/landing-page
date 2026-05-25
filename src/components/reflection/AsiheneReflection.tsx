"use client";

import { useEffect, useState } from "react";
import type { ReflectionCard, ReflectionData } from "@/lib/asihene-reflection-data";

type SubmitState = "idle" | "submitting" | "done" | "error";

type CardState = {
  status: SubmitState;
  errorMsg?: string;
};

const STORAGE_PREFIX = "mams-reflection";

function storageKey(contactId: string, cardId: string, questionId: string) {
  return `${STORAGE_PREFIX}:${contactId}:${cardId}:${questionId}`;
}

function getStored(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function setStored(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode - silent */
  }
}

export function AsiheneReflection({
  data,
  shareToken,
  contactId,
}: {
  data: ReflectionData;
  shareToken: string;
  contactId: string;
}) {
  return (
    <div className="space-y-6">
      {data.cards.map((card) => (
        <CardBlock
          key={card.id}
          card={card}
          shareToken={shareToken}
          contactId={contactId}
        />
      ))}
    </div>
  );
}

function CardBlock({
  card,
  shareToken,
  contactId,
}: {
  card: ReflectionCard;
  shareToken: string;
  contactId: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<CardState>({ status: "idle" });

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const q of card.questions) {
      next[q.id] = getStored(storageKey(contactId, card.id, q.id));
    }
    setAnswers(next);
  }, [card, contactId]);

  function updateAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setStored(storageKey(contactId, card.id, qid), value);
  }

  async function submit() {
    setState({ status: "submitting" });
    try {
      const res = await fetch(
        `/api/reflection/${contactId}/submit?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: card.id, answers }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        setState({
          status: "error",
          errorMsg: `Submit failed (${res.status}). ${text.slice(0, 140)}`,
        });
        return;
      }
      setState({ status: "done" });
    } catch (err) {
      setState({
        status: "error",
        errorMsg: (err as Error).message || "Network error",
      });
    }
  }

  const hasAtLeastOneAnswer = Object.values(answers).some(
    (v) => v && v.trim().length > 0,
  );

  return (
    <article className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
      <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
          {card.label}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-deep-teal mt-1 leading-tight">
          {card.headline}
        </h2>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {card.factBlock && (
          <div className="border-l-2 border-gold/40 pl-4 py-1">
            <p className="font-display text-lg text-deep-teal">
              {card.factBlock.address}
            </p>
            <p className="text-sm text-deep-teal/70">
              {card.factBlock.neighborhood} &middot; {card.factBlock.listPrice} &middot;{" "}
              {card.factBlock.status}
            </p>
            <p className="text-xs text-deep-teal/60 mt-1">{card.factBlock.specs}</p>
          </div>
        )}

        {card.anchorQuote && (
          <blockquote className="bg-paper border border-gold/20 rounded p-4">
            <p className="font-display text-base italic text-deep-teal leading-snug">
              &ldquo;{card.anchorQuote}&rdquo;
            </p>
            {card.anchorAttribution && (
              <p className="text-xs text-deep-teal/60 mt-2">
                {card.anchorAttribution}
              </p>
            )}
          </blockquote>
        )}

        <p className="text-base text-deep-teal/85 leading-relaxed">{card.frame}</p>

        <div className="space-y-4 pt-2">
          {card.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label
                className="block text-sm font-semibold text-deep-teal"
                htmlFor={`${card.id}-${q.id}`}
              >
                {q.label}
              </label>
              <textarea
                id={`${card.id}-${q.id}`}
                className="w-full min-h-[88px] rounded border border-deep-teal/20 bg-paper px-3 py-2 text-sm text-deep-teal placeholder:text-deep-teal/40 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                placeholder={q.placeholder}
                value={answers[q.id] ?? ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                disabled={state.status === "done"}
              />
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-3 flex-wrap">
          {state.status === "done" ? (
            <p className="text-sm font-semibold text-deep-teal">
              Locked in. Miles has it.
            </p>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={state.status === "submitting" || !hasAtLeastOneAnswer}
              className="bg-deep-teal text-ivory px-5 py-2.5 rounded text-sm font-semibold tracking-wide hover:bg-deep-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {state.status === "submitting" ? "Sending..." : card.submitLabel}
            </button>
          )}
          {state.status === "error" && (
            <p className="text-xs text-red-700">{state.errorMsg}</p>
          )}
        </div>
      </div>
    </article>
  );
}
