/**
 * TC-facing concierge helpers (Wendy's domain).
 * Reads from the same GHL data as the agent dashboard, computes stage-relative
 * milestones + a baseline compliance checklist sourced from the legal review.
 *
 * No paperwork templates are generated here — the legal review (in
 * shared/completed/2026-05-17-1734-concierge-paperwork-legal-review.md) lists
 * exit conditions that must clear before any tenant brokerage agreement or
 * future-buyer letter ships. This dashboard surfaces those reminders so
 * Wendy can flag the contract handoff manually until Phase C lands.
 */

import { CONCIERGE_STAGES, stageById, type ConciergeStage, type ConciergeOpportunity } from "./ghl-concierge-agent";

/** Stages at or beyond which Wendy is actively engaged on the deal. */
export const TC_ACTIVATION_STAGE_POSITIONS = {
  application: 5,    // "Application" — Wendy starts seeing the file
  leaseSigned: 6,    // "Lease Signed" — Wendy owns the file through close
} as const;

export interface TcStageView {
  stage: ConciergeStage;
  isCurrent: boolean;
  isComplete: boolean;
  isFuture: boolean;
  isWendyOwned: boolean;
  blurb: string;
}

const STAGE_BLURBS: Record<string, string> = {
  "5341c40c-1f54-48b3-ab2e-f703874d3775": "Lead arrives. Chosen reviews intake and books the first call within 10 minutes.",
  "3c24f916-1022-4fe7-a1c7-84d18be0f188": "Chosen confirms criteria + lifestyle anchors. Concierge shortlist generates automatically.",
  "709f736f-cd32-4bf3-a7a9-b7dab4b4b8a8": "Tenant Brokerage Agreement signed BEFORE any property tour. Future Buyer Engagement Letter on file.",
  "76f70de8-be1b-4f87-b6e1-0dbbabcf0687": "Chosen filters down to the 2-3 properties the client wants to tour.",
  "a832daa7-eb55-4f75-966b-f7be0979c8b1": "Tours scheduled. Brokerage disclosures sent to each property's leasing office in advance.",
  "731ca2f6-e7a8-457e-8193-f3af29a185c6": "Wendy opens the file. Application packaged, landlord-side compensation disclosed in writing.",
  "074d2710-bba9-47bf-8c59-27196a83c480": "Lease executed. Concierge Fee (Base + Rent Equivalency) invoiced. Future buyer credit window begins.",
  "d505c480-be7d-4594-bf41-754094d971b5": "Post-move check-ins. 24-month future-buyer credit clock running.",
  "6ec4f1b4-3a3f-422d-90f6-d1c66d2a1238": "Client ready to buy in Greater Richmond. Trigger separate buyer brokerage agreement referencing the credit.",
};

/**
 * Builds a stage-by-stage view annotated with completion + ownership for
 * Wendy. "Current" + everything before it is considered complete; everything
 * after is future.
 */
export function buildTcStageView(currentStageId: string | undefined | null): TcStageView[] {
  const current = stageById(currentStageId);
  const currentPos = current?.position ?? -1;
  return CONCIERGE_STAGES.map((stage) => ({
    stage,
    isCurrent: stage.id === currentStageId,
    isComplete: stage.position < currentPos,
    isFuture: stage.position > currentPos,
    isWendyOwned: stage.position >= TC_ACTIVATION_STAGE_POSITIONS.application,
    blurb: STAGE_BLURBS[stage.id] || "",
  }));
}

/** True if the deal has reached Wendy's domain (Application or beyond). */
export function isTcActiveStage(stageId: string | undefined | null): boolean {
  const stage = stageById(stageId);
  if (!stage) return false;
  return stage.position >= TC_ACTIVATION_STAGE_POSITIONS.application;
}

export interface TcChecklistItem {
  id: string;
  label: string;
  context: string;
  requiredBy: string; // stage name or moment
  legalCitation?: string;
}

/**
 * Static baseline TC checklist. Sourced from the 2026-05-17 paperwork legal
 * review exit conditions. NOT a contract; just compliance reminders so Wendy
 * has a visible reference until Phase C (paperwork automation) ships.
 */
export const TC_BASELINE_CHECKLIST: TcChecklistItem[] = [
  {
    id: "tba_signed",
    label: "Tenant Brokerage Agreement signed before any showing",
    context: "Va. Code § 54.1-2134(A)(1), effective July 1, 2025 — pre-showing written agreement is required.",
    requiredBy: "Agreement Signed",
    legalCitation: "Va. Code § 54.1-2134(A)(1)",
  },
  {
    id: "fbel_signed",
    label: "Future Buyer Engagement Letter on file with Unfair Real Estate Service Agreement Act recital",
    context: "24-month future-buyer commitment must avoid running with land, liens, assignment, or recording.",
    requiredBy: "Agreement Signed",
    legalCitation: "Va. Code Title 55.1, Chapter 32",
  },
  {
    id: "supervising_broker_disclosed",
    label: "Supervising broker name + contact disclosed in both agreements",
    context: "Every brokerage agreement must include the supervising broker's name, phone, and email.",
    requiredBy: "Agreement Signed",
    legalCitation: "Va. Code § 54.1-2110.1(B)(6)",
  },
  {
    id: "brokerage_relationship_disclosed_to_landlord",
    label: "Brokerage relationship disclosed in writing to each property's leasing office",
    context: "Disclosure must land in the application or lease, whichever comes first, no later than lease signing.",
    requiredBy: "Tour Stage / Application",
    legalCitation: "Va. Code § 54.1-2138",
  },
  {
    id: "landlord_comp_disclosed",
    label: "Any landlord-side compensation disclosed to client in writing before lease signing",
    context: "Landlord co-broke / locator fee credits dollar-for-dollar against tenant's Concierge Fee unless client gives separate written consent.",
    requiredBy: "Application / Lease Signed",
    legalCitation: "Va. Code § 54.1-2138; Va. Code § 54.1-2140",
  },
  {
    id: "concierge_fee_invoiced",
    label: "Concierge Fee invoiced (Base $1,995 at signing + Rent Equivalency at lease execution)",
    context: "Fee cap = one month's rent or $1,995, whichever greater. Refund mechanics per Section 3.1.",
    requiredBy: "Lease Signed",
  },
  {
    id: "fbel_credit_window_logged",
    label: "Future buyer credit eligibility logged with move-in date",
    context: "24-month clock starts at move-in. Credit applies if client engages MAMS via separate buyer brokerage agreement.",
    requiredBy: "Lease Signed / Post-Move Nurture",
  },
];

/** Minutes between two ISO timestamps. Positive = past, negative = future. */
export function minutesSince(iso: string | undefined | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!t) return null;
  return Math.round((Date.now() - t) / 60000);
}

/**
 * Returns the call-by deadline for a 10-minute response target.
 * @returns ISO string of the deadline, or null if no createdAt provided.
 */
export function callByDeadline(opp: ConciergeOpportunity | null, targetMinutes = 10): { iso: string; minutesRemaining: number } | null {
  if (!opp?.createdAt) return null;
  const created = new Date(opp.createdAt).getTime();
  if (!created) return null;
  const deadline = created + targetMinutes * 60_000;
  const minutesRemaining = Math.round((deadline - Date.now()) / 60_000);
  return { iso: new Date(deadline).toISOString(), minutesRemaining };
}

/**
 * Builds conversational "first-call prep" hooks deterministically from the
 * lead's intake. No AI call — these are direct slice-and-frame of what they
 * told us. Chosen reads, uses naturally, doesn't lead with them.
 */
export interface FirstCallHook {
  label: string;
  text: string;
}

export function buildFirstCallHooks(intake: {
  criteria?: string;
  lifestylePriorities?: string;
  dailyAnchors?: string;
  anchorAddress?: string;
}): FirstCallHook[] {
  const hooks: FirstCallHook[] = [];
  if (intake.criteria) {
    hooks.push({ label: "What they want", text: intake.criteria });
  }
  if (intake.dailyAnchors) {
    hooks.push({ label: "Their daily rhythm", text: intake.dailyAnchors });
  }
  if (intake.lifestylePriorities) {
    hooks.push({ label: "What lights them up", text: intake.lifestylePriorities });
  }
  if (intake.anchorAddress) {
    hooks.push({ label: "Where life is centered", text: intake.anchorAddress });
  }
  return hooks;
}

export function buildTcDashboardUrl(contactId: string, token: string, baseUrl = "https://mamsnow.com"): string {
  return `${baseUrl.replace(/\/$/, "")}/concierge/${contactId}/tc?t=${token}`;
}
