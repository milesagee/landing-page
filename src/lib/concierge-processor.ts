/**
 * Server-side concierge processor used by the Vercel webhook.
 *
 * Mirrors scripts/insiderrva/process-contact.js (Mac), but ports the criteria
 * parser, InsiderRVA query, shortlist formatter, and share-credential
 * generator to TypeScript so the webhook can do GHL writes without depending
 * on the local Node + Python toolchain.
 *
 * Email notification is NOT sent from here. The Mac poller picks up the
 * contact on its next tick (≤5 min) and sends the email when it sees
 * status="shortlisted" but concierge_notified_at empty.
 */

import crypto from "node:crypto";
import {
  CONCIERGE_FIELD_KEYS,
  getConciergeContact,
  getConciergeFieldIds,
  patchContactCustomFields,
  addContactTag,
  addContactNote,
  listContactNotes,
  type ConciergeContact,
} from "./ghl-concierge";

const INSIDERRVA_API = "https://www.insiderrva.com/api";
const UA = "MAMS-Concierge-Webhook/1.0 (+miles@milesagee.com)";
const SHARE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mamsnow.com";

// ---------------- Criteria parser ----------------

const NEIGHBORHOODS = [
  "Scott's Addition", "The Fan", "Museum District", "Church Hill", "Shockoe Bottom",
  "Manchester", "Carytown", "Forest Hill", "Westover Hills", "Northside",
  "Oregon Hill", "The Diamond", "Jackson Ward", "Bellevue", "Ginter Park",
  "Battery Park", "Highland Park", "Byrd Park", "Maymont", "Randolph",
  "Deerbourne", "Stratford Hills",
];

const DISTRICTS = ["Near West", "East End", "Southside", "Northside", "Downtown", "Broad Rock"];

export interface CriteriaFlags {
  maxRent?: number;
  minRent?: number;
  minBeds?: number;
  neighborhood?: string;
  district?: string;
  pet?: boolean;
  limit?: number;
}

export function parseCriteria(text: string): CriteriaFlags {
  if (!text?.trim()) throw new Error("Empty criteria");
  const lower = text.toLowerCase();
  const flags: CriteriaFlags = {};

  const rentPatterns = [
    /\$\s*([0-9,]{3,6})/,
    /(?:under|max|maximum|<=?|<|up to|less than)\s*\$?\s*([0-9,]{3,6})/,
    /([0-9,]{3,6})\s*\/?\s*(?:mo|month|monthly|\/mo)/,
    /([0-9,]{3,6})\s*(?:budget|range|cap)/,
  ];
  for (const re of rentPatterns) {
    const m = lower.match(re);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (n >= 500 && n <= 20000) { flags.maxRent = n; break; }
    }
  }

  if (/\bstudio\b/.test(lower)) {
    flags.minBeds = 0;
  } else {
    const m = lower.match(/(\d+)\s*\+?\s*(?:bed|bd|br|bedroom)/);
    if (m) flags.minBeds = parseInt(m[1], 10);
  }

  const sortedNeighborhoods = [...NEIGHBORHOODS].sort((a, b) => b.length - a.length);
  for (const n of sortedNeighborhoods) {
    const needle = n.toLowerCase();
    const idx = lower.indexOf(needle);
    if (idx >= 0) {
      const before = idx === 0 || /\W/.test(lower[idx - 1]);
      const after = idx + needle.length === lower.length || /\W/.test(lower[idx + needle.length]);
      if (before && after) { flags.neighborhood = n; break; }
    }
  }
  if (!flags.neighborhood) {
    for (const d of DISTRICTS) {
      if (lower.includes(d.toLowerCase())) { flags.district = d; break; }
    }
  }
  if (/\b(dog|cat|pet|pets|pet-friendly|pet friendly)\b/.test(lower)) flags.pet = true;

  const limitMatch = lower.match(/\btop\s*(\d+)\b/);
  if (limitMatch) flags.limit = parseInt(limitMatch[1], 10);

  if (Object.keys(flags).length === 0) {
    throw new Error("Could not extract any criteria from the text");
  }
  return flags;
}

// ---------------- InsiderRVA shortlist query ----------------

interface RawFloorplan {
  bedroomType?: string;
  bathrooms?: string;
  priceRange?: { min?: number; max?: number };
  sqft?: { min?: number; max?: number };
  availability?: string;
}
interface RawProperty {
  slug: string;
  name: string;
  insiderRating?: number;
  rating?: number;
  managementCompany?: string;
  managementSlug?: string;
  reviewIntegrity?: string;
  flaggedReviews?: unknown[];
  redditMentions?: unknown[];
  walkScore?: number;
  transitScore?: number;
  floorplans?: RawFloorplan[];
  location?: { address?: string; neighborhood?: string; district?: string };
}

export interface ShortlistProperty {
  slug: string;
  name: string;
  address?: string;
  neighborhood?: string;
  district?: string;
  insiderRating?: number;
  managementCompany?: string;
  floorplans: { beds?: string; baths?: string; priceMin?: number; priceMax?: number }[];
  flaggedReviewCount: number | null;
  redditMentionCount: number | null;
  insiderUrl: string;
}

function parseBeds(bedroomType?: string): number {
  if (!bedroomType) return 0;
  const s = String(bedroomType).toLowerCase();
  if (s.startsWith("studio") || s.startsWith("s")) return 0;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export async function runShortlistQuery(flags: CriteriaFlags): Promise<ShortlistProperty[]> {
  const res = await fetch(`${INSIDERRVA_API}/properties`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`InsiderRVA /properties → ${res.status}`);
  const all = (await res.json()) as RawProperty[];

  const minRating = 3.0;
  const maxRent = flags.maxRent ?? Infinity;
  const minRent = flags.minRent ?? 0;
  const minBeds = flags.minBeds ?? 0;
  const neighborhood = flags.neighborhood?.toLowerCase();
  const district = flags.district?.toLowerCase();
  const limit = flags.limit ?? 12;

  const filtered = all
    .filter(p => (p.insiderRating ?? 0) >= minRating)
    .filter(p => !neighborhood || (p.location?.neighborhood || "").toLowerCase().includes(neighborhood))
    .filter(p => !district || (p.location?.district || "").toLowerCase().includes(district))
    .filter(p => {
      if (!Array.isArray(p.floorplans) || !p.floorplans.length) return false;
      return p.floorplans.some(f => {
        const bedNum = parseBeds(f.bedroomType);
        const lowPrice = f.priceRange?.min ?? Infinity;
        return bedNum >= minBeds && lowPrice <= maxRent && lowPrice >= minRent;
      });
    })
    .sort((a, b) => (b.insiderRating ?? 0) - (a.insiderRating ?? 0))
    .slice(0, limit);

  return filtered.map(p => ({
    slug: p.slug,
    name: p.name,
    address: p.location?.address,
    neighborhood: p.location?.neighborhood,
    district: p.location?.district,
    insiderRating: p.insiderRating,
    managementCompany: p.managementCompany,
    floorplans: (p.floorplans || []).map(f => ({
      beds: f.bedroomType,
      baths: f.bathrooms,
      priceMin: f.priceRange?.min,
      priceMax: f.priceRange?.max,
    })),
    flaggedReviewCount: Array.isArray(p.flaggedReviews) ? p.flaggedReviews.length : null,
    redditMentionCount: Array.isArray(p.redditMentions) ? p.redditMentions.length : null,
    insiderUrl: `https://insiderrva.com/property/${p.slug}`,
  }));
}

// ---------------- Shortlist HTML formatter ----------------

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function formatPrice(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "?";
  return "$" + Math.round(n).toLocaleString();
}

function cheapestPrice(floorplans: { priceMin?: number }[]): number | null {
  if (!Array.isArray(floorplans) || !floorplans.length) return null;
  return floorplans.reduce<number | null>(
    (min, f) => (f.priceMin && (!min || f.priceMin < min)) ? f.priceMin : min,
    null
  );
}

function bedsSummary(floorplans: { beds?: string }[]): string {
  if (!Array.isArray(floorplans)) return "";
  return [...new Set(floorplans.map(f => f.beds).filter(Boolean))].sort().join(", ");
}

export function formatShortlistHtml(
  properties: ShortlistProperty[],
  criteriaText: string,
  flags: CriteriaFlags
): string {
  const tealDeep = "#003F3F";
  const gold = "#D4AF37";
  const goldDark = "#B1922E";
  const paper = "#FAF7F1";
  const line = "rgba(0,63,63,0.15)";
  const muted = "#6b6b6b";

  if (!properties.length) {
    return `<div style="font-family:Inter,system-ui,sans-serif; background:${paper}; padding:16px; border-radius:8px; color:${tealDeep};">
<div style="font-weight:700; color:${goldDark}; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;">MAMS Move-In Concierge Shortlist</div>
<p style="margin:0; font-size:14px;">No matching properties found for the criteria provided.</p>
<p style="margin:8px 0 0; font-size:12px; color:${muted};"><b>Criteria:</b> ${escapeHtml(criteriaText)}</p>
<p style="margin:4px 0 0; font-size:12px; color:${muted};"><b>Parsed:</b> ${escapeHtml(JSON.stringify(flags))}</p>
</div>`;
  }

  const ts = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  let html = `<div style="font-family:Inter,system-ui,sans-serif; background:${paper}; padding:18px; border-radius:8px; color:${tealDeep}; max-width:720px;">
<div style="border-left:3px solid ${gold}; padding:0 0 0 12px; margin-bottom:14px;">
  <div style="font-weight:700; color:${goldDark}; font-size:10px; letter-spacing:0.12em; text-transform:uppercase;">MAMS Move-In Concierge Shortlist</div>
  <div style="font-family:Fraunces,Georgia,serif; font-size:18px; font-weight:600; color:${tealDeep}; margin-top:2px;">${properties.length} curated propert${properties.length === 1 ? "y" : "ies"}</div>
  <div style="font-size:11px; color:${muted}; margin-top:3px;">Generated ${escapeHtml(ts)} ET &middot; criteria: ${escapeHtml(criteriaText)}</div>
</div>`;

  for (const p of properties) {
    const beds = bedsSummary(p.floorplans);
    const cheapest = cheapestPrice(p.floorplans);
    const fees = p.flaggedReviewCount != null ? `${p.flaggedReviewCount} flagged review${p.flaggedReviewCount === 1 ? "" : "s"}` : "";
    const reddit = p.redditMentionCount != null ? `${p.redditMentionCount} Reddit mention${p.redditMentionCount === 1 ? "" : "s"}` : "";
    const intel = [fees, reddit].filter(Boolean).join(" &middot; ");
    html += `
<div style="background:#fff; border:1px solid ${line}; border-radius:6px; padding:12px 14px; margin-bottom:8px;">
  <div style="display:flex; justify-content:space-between; align-items:baseline; gap:10px;">
    <div style="font-family:Fraunces,Georgia,serif; font-size:15px; font-weight:600; color:${tealDeep};">${escapeHtml(p.name || p.slug)}</div>
    <div style="font-family:Fraunces,Georgia,serif; font-size:14px; font-weight:700; color:${goldDark}; white-space:nowrap;">&#9733; ${p.insiderRating ?? "?"}</div>
  </div>
  <div style="font-size:12.5px; color:${muted}; margin-top:2px;">${escapeHtml(p.address || "")}</div>
  <div style="font-size:12px; color:${tealDeep}; margin-top:4px;">${escapeHtml(p.neighborhood || "?")} &middot; ${escapeHtml(p.district || "?")} &middot; ${escapeHtml(p.managementCompany || "Mgmt unknown")}</div>
  <div style="font-size:12px; color:${tealDeep}; margin-top:4px;"><b>From ${formatPrice(cheapest)}</b> &middot; Beds: ${escapeHtml(beds || "?")}${intel ? " &middot; " + intel : ""}</div>
</div>`;
  }

  html += `
<div style="margin-top:14px; padding-top:10px; border-top:1px solid ${line}; font-size:11px; color:${muted};">
  Generated by MAMS internal market intelligence. Do not share this source or methodology with clients. Frame as <i>"our curated Richmond rental intel"</i>.
</div>
</div>`;
  return html;
}

// ---------------- Share credentials ----------------

function buildShareUrl(contactId: string, token: string): string {
  return `${SHARE_BASE_URL.replace(/\/$/, "")}/concierge/${contactId}?t=${token}`;
}

function ensureShareCredentials(contact: ConciergeContact): { token: string; url: string; isNew: boolean } {
  if (contact.shareToken && contact.shareUrl) {
    return { token: contact.shareToken, url: contact.shareUrl, isNew: false };
  }
  const token = contact.shareToken || crypto.randomUUID().replace(/-/g, "");
  const url = buildShareUrl(contact.id, token);
  return { token, url, isNew: true };
}

// ---------------- Discoverability (Note + Tag) ----------------

const CONCIERGE_TAG = "concierge-shortlist-ready";
const CONCIERGE_NOTE_MARKER = "[CONCIERGE SHORTLIST]";

function buildConciergeNoteBody(args: {
  firstName?: string;
  propertiesCount: number;
  criteria: string;
  shareUrl: string;
}): string {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return `${CONCIERGE_NOTE_MARKER} Shortlist ready for ${args.firstName || "this lead"} — ${args.propertiesCount} propert${args.propertiesCount === 1 ? "y" : "ies"} matched.

Open the client share page: ${args.shareUrl}

Criteria provided: "${args.criteria}"

Generated ${ts} ET by MAMS Move-In Concierge automation. The branded HTML shortlist is in the Concierge Shortlist custom field on this contact.`;
}

async function ensureConciergeNote(contactId: string, body: string): Promise<{ added: boolean; noteId?: string; error?: string }> {
  try {
    const existing = await listContactNotes(contactId);
    const dupe = existing.find(n => (n.body || "").startsWith(CONCIERGE_NOTE_MARKER));
    if (dupe) return { added: false, noteId: dupe.id };
    const created = await addContactNote(contactId, body);
    return { added: true, noteId: created.id };
  } catch (e) {
    return { added: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function ensureConciergeTag(contactId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await addContactTag(contactId, CONCIERGE_TAG);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------- Orchestrator ----------------

export interface ProcessResult {
  action: "processed" | "skipped" | "errored";
  reason?: string;
  contactId: string;
  status?: string;
  propertiesCount?: number;
  shareToken?: string;
  shareUrl?: string;
  shareCredentialsCreated?: boolean;
  processingError?: string;
  note?: { added: boolean; noteId?: string; error?: string };
  tag?: { ok: boolean; error?: string };
}

/**
 * Webhook-side processor. Does GHL writes only. Does not send email.
 */
export async function processContactWebhook(contactId: string, options: { forceReprocess?: boolean } = {}): Promise<ProcessResult> {
  const { forceReprocess = false } = options;

  const contact = await getConciergeContact(contactId);
  if (!contact) return { action: "skipped", reason: "contact_not_found", contactId };
  if (!contact.criteria?.trim()) return { action: "skipped", reason: "no_criteria", contactId };
  if (!forceReprocess && (contact.status === "shortlisted" || contact.status === "error")) {
    return { action: "skipped", reason: `already_${contact.status}`, contactId };
  }

  const fieldIds = await getConciergeFieldIds();

  let properties: ShortlistProperty[] = [];
  let shortlistHtml: string;
  let finalStatus: "shortlisted" | "error";
  let processingError: string | undefined;
  try {
    const flags = parseCriteria(contact.criteria);
    properties = await runShortlistQuery(flags);
    shortlistHtml = formatShortlistHtml(properties, contact.criteria, flags);
    finalStatus = "shortlisted";
  } catch (e) {
    processingError = e instanceof Error ? e.message : String(e);
    shortlistHtml = `<div style="font-family:sans-serif; color:#C0392B; padding:12px; background:#fdf2f0; border-radius:6px;">
<b>Could not build shortlist:</b> ${processingError}<br>
<small>Criteria provided: "${contact.criteria}"</small>
</div>`;
    finalStatus = "error";
  }

  const share = ensureShareCredentials(contact);

  const fields = [
    { id: fieldIds.shortlist, field_value: shortlistHtml },
    { id: fieldIds.status, field_value: finalStatus },
  ];
  if (share.isNew) {
    fields.push(
      { id: fieldIds.shareToken, field_value: share.token },
      { id: fieldIds.shareUrl, field_value: share.url },
    );
  }
  await patchContactCustomFields(contactId, fields);

  // Discoverability: Note + Tag so Miles can find the share URL from the contact panel
  let noteResult: { added: boolean; noteId?: string; error?: string } = { added: false };
  let tagResult: { ok: boolean; error?: string } = { ok: false };
  if (finalStatus === "shortlisted") {
    const noteBody = buildConciergeNoteBody({
      firstName: contact.firstName,
      propertiesCount: properties.length,
      criteria: contact.criteria,
      shareUrl: share.url,
    });
    noteResult = await ensureConciergeNote(contactId, noteBody);
    tagResult = await ensureConciergeTag(contactId);
  }

  return {
    action: processingError ? "errored" : "processed",
    contactId,
    status: finalStatus,
    propertiesCount: properties.length,
    shareToken: share.token,
    shareUrl: share.url,
    shareCredentialsCreated: share.isNew,
    processingError,
    note: noteResult,
    tag: tagResult,
  };
}

export const __TEST__ = { parseCriteria, formatShortlistHtml, ensureShareCredentials, buildShareUrl };
// Suppress unused-export TS hint
void CONCIERGE_FIELD_KEYS;
