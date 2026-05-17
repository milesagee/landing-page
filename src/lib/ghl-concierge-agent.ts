/**
 * Server-side helpers for the internal concierge agent dashboard.
 * Reads opportunities + pipeline stage probabilities, writes stage moves.
 *
 * Server-side only. Uses GHL_MAMS_TOKEN + GHL_MAMS_LOCATION_ID from env.
 */

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export const CONCIERGE_PIPELINE_ID = "nVjS8rBlwiQM6MjrzPtm";
export const CONCIERGE_DEFAULT_VALUE_USD = 1995;

export interface ConciergeStage {
  id: string;
  name: string;
  position: number;
  probability: number;
  daysToClose: number;
}

// Mirror of .claude/skills/revenue-pulse/config.yaml mams_concierge stages.
// Keep in sync — these probabilities drive both Chosen's pulse and revenue-pulse.
export const CONCIERGE_STAGES: ConciergeStage[] = [
  { id: "5341c40c-1f54-48b3-ab2e-f703874d3775", name: "Inquiry",                  position: 0, probability: 0.10, daysToClose: 30 },
  { id: "3c24f916-1022-4fe7-a1c7-84d18be0f188", name: "Criteria Captured",        position: 1, probability: 0.25, daysToClose: 21 },
  { id: "709f736f-cd32-4bf3-a7a9-b7dab4b4b8a8", name: "Agreement Signed",         position: 2, probability: 0.60, daysToClose: 14 },
  { id: "76f70de8-be1b-4f87-b6e1-0dbbabcf0687", name: "Active Search",            position: 3, probability: 0.70, daysToClose: 14 },
  { id: "a832daa7-eb55-4f75-966b-f7be0979c8b1", name: "Tour Stage",               position: 4, probability: 0.80, daysToClose: 10 },
  { id: "731ca2f6-e7a8-457e-8193-f3af29a185c6", name: "Application",              position: 5, probability: 0.90, daysToClose: 7  },
  { id: "074d2710-bba9-47bf-8c59-27196a83c480", name: "Lease Signed",             position: 6, probability: 1.00, daysToClose: 0  },
  { id: "d505c480-be7d-4594-bf41-754094d971b5", name: "Post-Move Nurture",        position: 7, probability: 0.00, daysToClose: 0  },
  { id: "6ec4f1b4-3a3f-422d-90f6-d1c66d2a1238", name: "Future Buyer Activation",  position: 8, probability: 0.00, daysToClose: 0  },
];

export interface ConciergeOpportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineStageId: string;
  status: string;
  contactId: string;
  contactName?: string;
  createdAt?: string;
  lastStageChangeAt?: string;
  updatedAt?: string;
}

function authHeaders() {
  const token = process.env.GHL_MAMS_TOKEN;
  if (!token) throw new Error("GHL_MAMS_TOKEN missing from env");
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

function locationId(): string {
  const id = process.env.GHL_MAMS_LOCATION_ID;
  if (!id) throw new Error("GHL_MAMS_LOCATION_ID missing from env");
  return id;
}

export function stageById(id: string | undefined | null): ConciergeStage | null {
  if (!id) return null;
  return CONCIERGE_STAGES.find(s => s.id === id) || null;
}

function normalizeOpp(raw: Record<string, unknown>): ConciergeOpportunity {
  const contactBlock = raw.contact as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    name: String(raw.name || ""),
    monetaryValue: Number(raw.monetaryValue) || 0,
    pipelineStageId: String(raw.pipelineStageId || ""),
    status: String(raw.status || ""),
    contactId: String(raw.contactId || ""),
    contactName: contactBlock?.name as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    lastStageChangeAt: raw.lastStageChangeAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

/**
 * Returns the most recent concierge-pipeline opportunity for this contact.
 * Returns null if the contact has no concierge opp.
 */
export async function getContactConciergeOpportunity(contactId: string): Promise<ConciergeOpportunity | null> {
  const url = `${GHL_API}/opportunities/search?location_id=${locationId()}&contact_id=${contactId}&pipeline_id=${CONCIERGE_PIPELINE_ID}`;
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`GHL opportunities search → ${res.status}`);
  const body = await res.json();
  const opps = (body.opportunities || []) as Record<string, unknown>[];
  if (!opps.length) return null;
  // Newest first
  opps.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return normalizeOpp(opps[0]);
}

/**
 * All open opportunities in the concierge pipeline. Used for Chosen's
 * pipeline-pulse widget (motivational number at the top of every contact view).
 */
export async function getOpenConciergeOpportunities(): Promise<ConciergeOpportunity[]> {
  const all: ConciergeOpportunity[] = [];
  let page = 1;
  const limit = 100;
  while (true) {
    const url = `${GHL_API}/opportunities/search?location_id=${locationId()}&pipeline_id=${CONCIERGE_PIPELINE_ID}&status=open&page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error(`GHL open opportunities → ${res.status}`);
    const body = await res.json();
    const batch = (body.opportunities || []) as Record<string, unknown>[];
    if (!batch.length) break;
    for (const o of batch) all.push(normalizeOpp(o));
    if (batch.length < limit) break;
    page += 1;
    if (page > 10) break; // safety
  }
  return all;
}

export interface ConciergePulse {
  totalWeightedUsd: number;
  totalDeals: number;
  byStage: Array<{
    stage: ConciergeStage;
    count: number;
    weightedUsd: number;
  }>;
}

/**
 * Computes the motivational pipeline pulse: total stage-weighted USD across
 * all open concierge opportunities, plus per-stage breakdown.
 *
 * Each opportunity's value: max(opp.monetaryValue, CONCIERGE_DEFAULT_VALUE_USD).
 * Each opportunity's weight: stage.probability.
 */
export function computeConciergePulse(opps: ConciergeOpportunity[]): ConciergePulse {
  let total = 0;
  const byStageMap = new Map<string, { stage: ConciergeStage; count: number; weightedUsd: number }>();
  for (const stage of CONCIERGE_STAGES) {
    byStageMap.set(stage.id, { stage, count: 0, weightedUsd: 0 });
  }
  for (const opp of opps) {
    const stage = stageById(opp.pipelineStageId);
    if (!stage) continue;
    const value = Math.max(opp.monetaryValue || 0, CONCIERGE_DEFAULT_VALUE_USD);
    const weighted = value * stage.probability;
    total += weighted;
    const bucket = byStageMap.get(stage.id)!;
    bucket.count += 1;
    bucket.weightedUsd += weighted;
  }
  const byStage = CONCIERGE_STAGES.map(s => byStageMap.get(s.id)!).filter(b => b.count > 0);
  return {
    totalWeightedUsd: Math.round(total),
    totalDeals: opps.length,
    byStage,
  };
}

/**
 * Server-side stage move. Validates the new stage id is a known concierge
 * stage before issuing the PUT.
 */
export async function moveOpportunityStage(
  opportunityId: string,
  newStageId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!stageById(newStageId)) {
    return { ok: false, error: `Unknown concierge stage id: ${newStageId}` };
  }
  const url = `${GHL_API}/opportunities/${opportunityId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ pipelineId: CONCIERGE_PIPELINE_ID, pipelineStageId: newStageId }),
  });
  if (!res.ok) {
    const txt = await res.text();
    return { ok: false, error: `GHL PUT /opportunities/${opportunityId} → ${res.status}: ${txt.substring(0, 200)}` };
  }
  return { ok: true };
}

export function formatUsd(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString();
}

export function buildAgentDashboardUrl(contactId: string, token: string, baseUrl = "https://mamsnow.com"): string {
  return `${baseUrl.replace(/\/$/, "")}/concierge/${contactId}/agent?t=${token}`;
}
