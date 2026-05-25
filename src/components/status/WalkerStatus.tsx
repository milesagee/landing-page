"use client";

import { useEffect, useState } from "react";
import type { StatusData } from "@/lib/walker-status-data";

type SubmitState = "idle" | "submitting" | "done" | "error";

const STORAGE_KEY = (contactId: string) => `mams-status:${contactId}:checkin`;

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
    /* silent */
  }
}

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatCloseDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WalkerStatus({
  data,
  shareToken,
  contactId,
}: {
  data: StatusData;
  shareToken: string;
  contactId: string;
}) {
  const [note, setNote] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setNote(getStored(STORAGE_KEY(contactId)));
  }, [contactId]);

  function updateNote(value: string) {
    setNote(value);
    setStored(STORAGE_KEY(contactId), value);
  }

  async function submit() {
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/status/${contactId}/check-in?t=${encodeURIComponent(shareToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        setState("error");
        setErrorMsg(`Submit failed (${res.status}). ${text.slice(0, 140)}`);
        return;
      }
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg((err as Error).message || "Network error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Snapshot block - contract + close */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            The contract
          </p>
        </div>
        <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
          <BigStat label="Contract price" value={formatPrice(data.contractPrice)} />
          <BigStat label="Closing date" value={formatCloseDate(data.closeDate)} />
          <BigStat
            label="Property"
            value={`${data.property.city}, ${data.property.state}`}
            sub={data.property.address}
          />
        </div>
      </section>

      {/* What got cleared */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What got cleared
          </p>
          <p className="text-sm text-deep-teal/70 mt-1">
            The work behind the scenes since contract.
          </p>
        </div>
        <ul className="divide-y divide-deep-teal/10">
          {data.cleared.map((m, i) => (
            <li key={i} className="px-6 sm:px-8 py-4 flex items-start gap-4">
              <span
                className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  m.status === "done"
                    ? "bg-gold text-deep-teal"
                    : "bg-deep-teal/10 text-deep-teal"
                }`}
                aria-label={m.status}
              >
                {m.status === "done" ? "✓" : "·"}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="font-display text-base text-deep-teal">{m.label}</p>
                  <p className="text-xs text-deep-teal/60">{m.date}</p>
                </div>
                <p className="text-sm text-deep-teal/80 mt-1 leading-relaxed">
                  {m.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Runway to close */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            What&rsquo;s next
          </p>
          <p className="text-sm text-deep-teal/70 mt-1">
            The runway to close, in order.
          </p>
        </div>
        <ol className="divide-y divide-deep-teal/10">
          {data.runway.map((step, i) => (
            <li key={i} className="px-6 sm:px-8 py-4 flex items-start gap-4">
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-deep-teal text-ivory text-sm font-bold">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-display text-base text-deep-teal">{step.label}</p>
                <p className="text-sm text-deep-teal/80 mt-1 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Check-in */}
      <section className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
        <div className="bg-deep-teal/[0.04] px-6 sm:px-8 py-4 border-b border-deep-teal/10">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">
            Before we get there
          </p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <label
            className="block text-sm font-semibold text-deep-teal"
            htmlFor="walker-checkin"
          >
            {data.checkIn.label}
          </label>
          <textarea
            id="walker-checkin"
            className="w-full min-h-[120px] rounded border border-deep-teal/20 bg-paper px-3 py-2 text-sm text-deep-teal placeholder:text-deep-teal/40 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
            placeholder={data.checkIn.placeholder}
            value={note}
            onChange={(e) => updateNote(e.target.value)}
            disabled={state === "done"}
          />
          <div className="flex items-center gap-3 flex-wrap">
            {state === "done" ? (
              <p className="text-sm font-semibold text-deep-teal">
                Sent. I&rsquo;ll have an answer ready before Thursday.
              </p>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={state === "submitting" || !note.trim()}
                className="bg-deep-teal text-ivory px-5 py-2.5 rounded text-sm font-semibold tracking-wide hover:bg-deep-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {state === "submitting" ? "Sending..." : "Send this to Miles"}
              </button>
            )}
            {state === "error" && (
              <p className="text-xs text-red-700">{errorMsg}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-deep-teal/60 font-semibold">
        {label}
      </p>
      <p className="font-display text-2xl sm:text-3xl text-deep-teal mt-1 leading-none">
        {value}
      </p>
      {sub && <p className="text-xs text-deep-teal/60 mt-1.5">{sub}</p>}
    </div>
  );
}
