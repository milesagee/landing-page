/**
 * GHL client for concierge consumer share page + webhook.
 * Reads from / writes to MAMS GHL custom fields by fieldKey.
 *
 * Server-side only. Uses GHL_MAMS_TOKEN + GHL_MAMS_LOCATION_ID from env.
 */

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function authHeaders() {
  const token = process.env.GHL_MAMS_TOKEN;
  if (!token) throw new Error("GHL_MAMS_TOKEN missing from env");
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

export const CONCIERGE_FIELD_KEYS = {
  criteria: "contact.concierge_criteria",
  shortlist: "contact.concierge_shortlist",
  status: "contact.concierge_shortlist_status",
  shareToken: "contact.concierge_share_token",
  shareUrl: "contact.concierge_share_url",
  shareViewedAt: "contact.concierge_share_viewed_at",
  notifiedAt: "contact.concierge_notified_at",
  lifestylePriorities: "contact.concierge_lifestyle_priorities",
  dailyAnchors: "contact.concierge_daily_anchors",
  anchorAddress: "contact.concierge_anchor_address",
  shortlistV2Json: "contact.concierge_shortlist_v2_json",
  lastTouchAt: "contact.concierge_last_touch_at",
  prospectCoverSubject: "contact.concierge_prospect_cover_subject",
  prospectCoverBody: "contact.concierge_prospect_cover_body",
} as const;

export interface ConciergeContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  criteria?: string;
  shortlistHtml?: string;
  status?: string;
  shareToken?: string;
  shareUrl?: string;
  shareViewedAt?: string;
  notifiedAt?: string;
  lifestylePriorities?: string;
  dailyAnchors?: string;
  anchorAddress?: string;
  shortlistV2Json?: string;
  lastTouchAt?: string;
  prospectCoverSubject?: string;
  prospectCoverBody?: string;
}

interface RawCustomField {
  id?: string;
  key?: string;
  fieldKey?: string;
  value?: string;
  fieldValue?: string;
}

interface RawContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  customFields?: RawCustomField[];
}

function extractFieldById(contact: RawContact, id: string | undefined): string | undefined {
  if (!id) return undefined;
  const cf = contact.customFields || [];
  for (const f of cf) {
    if (f.id === id || f.fieldKey === id || f.key === id) {
      const v = (f.value ?? f.fieldValue) as unknown;
      return v == null ? undefined : String(v);
    }
  }
  return undefined;
}

export async function getConciergeContact(contactId: string): Promise<ConciergeContact | null> {
  const [res, fieldIds] = await Promise.all([
    fetch(`${GHL_API}/contacts/${contactId}`, { headers: authHeaders(), cache: "no-store" }),
    getFieldIdMap(),
  ]);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GHL GET /contacts/${contactId} → ${res.status}`);
  const body = await res.json();
  const c: RawContact = body.contact || body;
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    criteria: extractFieldById(c, fieldIds.criteria),
    shortlistHtml: extractFieldById(c, fieldIds.shortlist),
    status: extractFieldById(c, fieldIds.status),
    shareToken: extractFieldById(c, fieldIds.shareToken),
    shareUrl: extractFieldById(c, fieldIds.shareUrl),
    shareViewedAt: extractFieldById(c, fieldIds.shareViewedAt),
    notifiedAt: extractFieldById(c, fieldIds.notifiedAt),
    lifestylePriorities: extractFieldById(c, fieldIds.lifestylePriorities),
    dailyAnchors: extractFieldById(c, fieldIds.dailyAnchors),
    anchorAddress: extractFieldById(c, fieldIds.anchorAddress),
    shortlistV2Json: extractFieldById(c, fieldIds.shortlistV2Json),
    lastTouchAt: extractFieldById(c, fieldIds.lastTouchAt),
    prospectCoverSubject: extractFieldById(c, fieldIds.prospectCoverSubject),
    prospectCoverBody: extractFieldById(c, fieldIds.prospectCoverBody),
  };
}

/**
 * Single-field write helper used by the consumer page (mark viewed) and the
 * webhook (write batched fields). Caller controls the field ids + values.
 */
export async function patchContactCustomFields(
  contactId: string,
  fields: { id: string; field_value: string }[]
): Promise<void> {
  const res = await fetch(`${GHL_API}/contacts/${contactId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ customFields: fields }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GHL PUT /contacts/${contactId} → ${res.status}: ${txt.substring(0, 200)}`);
  }
}

/**
 * Resolves all concierge field IDs at once. Exposed so the webhook can do a
 * batched PATCH without each module re-fetching the field list.
 */
export async function getConciergeFieldIds(): Promise<Record<string, string>> {
  return getFieldIdMap();
}

export async function addContactTag(contactId: string, tags: string | string[]): Promise<void> {
  const body = { tags: Array.isArray(tags) ? tags : [tags] };
  const res = await fetch(`${GHL_API}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GHL tag add → ${res.status}`);
}

export async function addContactNote(contactId: string, noteBody: string): Promise<{ id?: string }> {
  const res = await fetch(`${GHL_API}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body: noteBody }),
  });
  if (!res.ok) throw new Error(`GHL note create → ${res.status}`);
  const json = await res.json();
  return { id: json.note?.id };
}

export async function listContactNotes(contactId: string): Promise<{ id: string; body: string }[]> {
  const res = await fetch(`${GHL_API}/contacts/${contactId}/notes`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.notes || []) as { id: string; body: string }[];
}

let cachedFieldIds: Record<string, string> | null = null;

async function getFieldIdMap(): Promise<Record<string, string>> {
  if (cachedFieldIds) return cachedFieldIds;
  const locationId = process.env.GHL_MAMS_LOCATION_ID;
  if (!locationId) throw new Error("GHL_MAMS_LOCATION_ID missing from env");
  const res = await fetch(`${GHL_API}/locations/${locationId}/customFields`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GHL custom fields list → ${res.status}`);
  const body = await res.json();
  const map: Record<string, string> = {};
  for (const f of body.customFields || []) {
    for (const [name, key] of Object.entries(CONCIERGE_FIELD_KEYS)) {
      if (f.fieldKey === key) map[name] = f.id;
    }
  }
  cachedFieldIds = map;
  return map;
}

/**
 * Sets concierge_share_viewed_at on a contact if it's not already set.
 * Fire-and-forget; failures are swallowed (we never want a logging failure
 * to block the consumer page render).
 */
export async function markShareViewed(contactId: string, currentViewedAt?: string): Promise<void> {
  if (currentViewedAt) return;
  try {
    const fields = await getFieldIdMap();
    if (!fields.shareViewedAt) return;
    await fetch(`${GHL_API}/contacts/${contactId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        customFields: [
          { id: fields.shareViewedAt, field_value: new Date().toISOString() },
        ],
      }),
    });
  } catch {
    // swallow
  }
}
