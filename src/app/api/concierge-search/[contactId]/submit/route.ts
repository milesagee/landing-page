/**
 * /api/concierge-search/[contactId]/submit
 *
 * Generic submit endpoint for the Josephus concierge-search dashboard.
 * Handles per-property rate/tour-request and general-note actions.
 * Token-gated via URL query. Writes a GHL note + tag + Conversations email.
 */

import { NextResponse } from "next/server";
import { getJosephusByToken, type Property } from "@/lib/josephus-concierge-search-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type Action = "rate" | "tour-request" | "general-note";

type SubmitBody = {
  action: Action;
  propertySlug?: string;
  viewerType: "primary" | "partner";
  payload: {
    rating?: "love" | "maybe" | "hide";
    note?: string;
    tourRequested?: boolean;
  };
};

async function ghlPost(urlPath: string, body: unknown) {
  const token = process.env.GHL_MAMS_TOKEN;
  if (!token) throw new Error("GHL_MAMS_TOKEN missing");
  const res = await fetch(`${GHL_API}${urlPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL POST ${urlPath} -> ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

function findProperty(slug: string, properties: Property[]): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

function actionTag(action: Action): string {
  switch (action) {
    case "rate":
      return "concierge-search-rated";
    case "tour-request":
      return "concierge-search-tour-requested";
    case "general-note":
      return "concierge-search-note";
  }
}

function actionSubject(action: Action, viewerFirstName: string, property?: Property): string {
  const propRef = property ? `${property.address}, ${property.city}` : "search";
  switch (action) {
    case "rate":
      return `[Josephus Search] ${viewerFirstName} rated ${propRef}`;
    case "tour-request":
      return `[Josephus Search] ${viewerFirstName} requested a tour at ${propRef}`;
    case "general-note":
      return `[Josephus Search] ${viewerFirstName} left a note`;
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const lookup = getJosephusByToken(contactId, t);
  if (!lookup) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { action, propertySlug, payload } = body;
  if (!action) {
    return NextResponse.json({ ok: false, error: "missing_action" }, { status: 400 });
  }

  const property = propertySlug ? findProperty(propertySlug, lookup.data.properties) : undefined;
  const viewerFirstName = lookup.viewer.firstName;
  const viewerType = lookup.viewer.viewerType;
  const submittedAt = new Date().toISOString();

  // Build the canonical GHL note body.
  const noteLines = [
    `[Concierge Search] ${action} by ${viewerFirstName} (${viewerType})`,
    `Submitted: ${submittedAt}`,
  ];
  if (property) {
    noteLines.push(
      `Property: ${property.address}, ${property.city} VA ${property.zip} (rank #${property.rank}, ${property.tier})`,
    );
  }
  if (payload.rating) noteLines.push(`Rating: ${payload.rating}`);
  if (payload.tourRequested) noteLines.push(`Tour requested: yes`);
  if (payload.note && payload.note.trim()) {
    noteLines.push(``, `Note:`, payload.note.trim());
  }

  const noteBody = noteLines.join("\n");

  const milesEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Concierge Search Action</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${viewerFirstName} just submitted on Josephus's dashboard.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 8px 0;"><strong>Action:</strong> ${action}</p>
    ${property ? `<p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${property.address}, ${property.city} VA ${property.zip} (rank #${property.rank}, ${property.tier})</p>` : ""}
    ${payload.rating ? `<p style="margin: 0 0 8px 0;"><strong>Rating:</strong> ${payload.rating}</p>` : ""}
    ${payload.tourRequested ? `<p style="margin: 0 0 8px 0;"><strong>Tour requested:</strong> yes</p>` : ""}
    ${payload.note && payload.note.trim() ? `<div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 16px 20px; margin: 16px 0; font-size: 14px;"><strong>Note:</strong><br>${escapeHtml(payload.note.trim())}</div>` : ""}
    <p style="margin: 16px 0 8px 0; font-size: 13px; color: #003F3F99;">Submitted ${new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/New_York" })} ET.</p>
  </div>
</body></html>
  `.trim();

  const results: Record<string, string> = {};

  try {
    await ghlPost(`/contacts/${contactId}/notes`, { body: noteBody });
    results.note = "ok";
  } catch (err) {
    results.note = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/contacts/${contactId}/tags`, { tags: [actionTag(action)] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "office@mamsnow.com",
      subject: actionSubject(action, viewerFirstName, property),
      html: milesEmailHtml,
    });
    results.email = "ok";
  } catch (err) {
    results.email = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({ ok: true, submittedAt, results });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST with ?t=<token> + body { action, propertySlug?, viewerType, payload }" },
    { status: 405 },
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
