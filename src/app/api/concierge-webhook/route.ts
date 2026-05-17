/**
 * /api/concierge-webhook
 *
 * Receives POST from Open Dispo Workflow on Opportunity Created in the
 * Move-In Concierge pipeline. Runs the GHL writes synchronously and returns.
 *
 * Email notification: NOT sent here. The Mac poller (every 5 min) picks up
 * the contact when it sees status="shortlisted" but concierge_notified_at empty.
 *
 * Authentication: optional shared-secret header X-Concierge-Webhook-Secret
 * (set CONCIERGE_WEBHOOK_SECRET in Vercel env to enable).
 *
 * Accepted payload shapes (GHL workflow webhooks send any of these):
 *   { contact_id: "..." }
 *   { contactId: "..." }
 *   { contact: { id: "..." } }
 *   { opportunity: { contactId: "..." } }
 */

import { NextResponse } from "next/server";
import { processContactWebhook } from "@/lib/concierge-processor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingPayload {
  contact_id?: string;
  contactId?: string;
  contact?: { id?: string };
  opportunity?: { contactId?: string; contact_id?: string };
  // GHL sometimes posts the contact at top level
  id?: string;
}

function extractContactId(payload: IncomingPayload): string | null {
  return (
    payload.contact_id ||
    payload.contactId ||
    payload.contact?.id ||
    payload.opportunity?.contactId ||
    payload.opportunity?.contact_id ||
    payload.id ||
    null
  );
}

function unauthorized(): NextResponse {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  // Optional shared-secret auth
  const expectedSecret = process.env.CONCIERGE_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = req.headers.get("x-concierge-webhook-secret");
    if (got !== expectedSecret) return unauthorized();
  }

  let payload: IncomingPayload;
  try {
    payload = (await req.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const contactId = extractContactId(payload);
  if (!contactId) {
    return NextResponse.json({ ok: false, error: "missing_contact_id" }, { status: 400 });
  }

  const force = req.headers.get("x-concierge-force-reprocess") === "1";

  try {
    const result = await processContactWebhook(contactId, { forceReprocess: force });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg, contactId }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "concierge-webhook",
    method: "POST",
    expects: "JSON with contact_id (or contactId, or contact.id)",
  });
}
