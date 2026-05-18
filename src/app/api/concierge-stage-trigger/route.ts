/**
 * /api/concierge-stage-trigger
 *
 * Receives POST from Open Dispo Workflow on Pipeline Stage Changed in the
 * Move-In Concierge pipeline (Application or Lease Signed stages).
 *
 * What it does:
 * 1. Validates the payload (contact_id + to_stage_id present and known stage)
 * 2. Appends a queue entry to the contact's `concierge_stage_trigger_queue`
 *    custom field (LARGE_TEXT, JSON-lines or JSON-array)
 * 3. Mac poller picks up the queue entry on its next 5-min cycle, sends the
 *    Wendy email via gmail-cli, and clears the entry
 *
 * Why the relay: Vercel has no mail transport wired today. The Mac already
 * has gmail-cli + OAuth. Relaying via a GHL field keeps mail-sending on the
 * Mac without changing the inbound trigger path.
 *
 * Authentication: optional shared-secret header X-Concierge-Webhook-Secret
 * (set CONCIERGE_WEBHOOK_SECRET in Vercel env to enable).
 */

import { NextResponse } from "next/server";
import { getConciergeFieldIds, patchContactCustomFields, getConciergeContact } from "@/lib/ghl-concierge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KNOWN_TRIGGER_STAGES: Record<string, string> = {
  "731ca2f6-e7a8-457e-8193-f3af29a185c6": "Application",
  "074d2710-bba9-47bf-8c59-27196a83c480": "Lease Signed",
};

interface IncomingPayload {
  contact_id?: string;
  contactId?: string;
  opportunity_id?: string;
  opportunityId?: string;
  from_stage_id?: string;
  fromStageId?: string;
  to_stage_id?: string;
  toStageId?: string;
  to_stage_name?: string;
  trigger_source?: string;
  test?: boolean;
}

interface QueueEntry {
  opportunity_id: string;
  from_stage_id: string;
  to_stage_id: string;
  to_stage_name: string;
  trigger_source: string;
  fired_at: string;
  delivered_at: string | null;
}

function extractContactId(p: IncomingPayload): string | undefined {
  return p.contact_id || p.contactId;
}

function extractToStageId(p: IncomingPayload): string | undefined {
  return p.to_stage_id || p.toStageId;
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST a stage-change payload to fire a Wendy email via the queue." }, { status: 405 });
}

export async function POST(req: Request) {
  let body: IncomingPayload;
  try {
    body = (await req.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Optional shared-secret check
  const secret = process.env.CONCIERGE_WEBHOOK_SECRET;
  if (secret) {
    const sent = req.headers.get("x-concierge-webhook-secret");
    if (sent !== secret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  // Test ping — used by the Comet prompt curl check to verify the endpoint exists
  if (body.test === true) {
    return NextResponse.json({ ok: true, message: "endpoint live", known_trigger_stages: KNOWN_TRIGGER_STAGES });
  }

  const contactId = extractContactId(body);
  const toStageId = extractToStageId(body);
  if (!contactId || !toStageId) {
    return NextResponse.json(
      { ok: false, error: "missing_required_fields", required: ["contact_id", "to_stage_id"], got: body },
      { status: 400 },
    );
  }

  const stageName = KNOWN_TRIGGER_STAGES[toStageId];
  if (!stageName) {
    return NextResponse.json(
      { ok: false, error: "unknown_or_unsupported_stage", to_stage_id: toStageId, supported: KNOWN_TRIGGER_STAGES },
      { status: 422 },
    );
  }

  // Confirm contact exists
  const contact = await getConciergeContact(contactId).catch(() => null);
  if (!contact) {
    return NextResponse.json({ ok: false, error: "contact_not_found", contact_id: contactId }, { status: 404 });
  }

  const fieldIds = await getConciergeFieldIds();
  if (!fieldIds.stageTriggerQueue) {
    return NextResponse.json(
      { ok: false, error: "queue_field_not_configured", hint: "concierge_stage_trigger_queue custom field missing in MAMS GHL" },
      { status: 500 },
    );
  }

  // Append the new entry to the queue
  const existingRaw = (contact as unknown as { stageTriggerQueue?: string }).stageTriggerQueue;
  let queue: QueueEntry[] = [];
  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw);
      if (Array.isArray(parsed)) queue = parsed as QueueEntry[];
    } catch {
      queue = [];
    }
  }

  const entry: QueueEntry = {
    opportunity_id: body.opportunity_id || body.opportunityId || "",
    from_stage_id: body.from_stage_id || body.fromStageId || "",
    to_stage_id: toStageId,
    to_stage_name: stageName,
    trigger_source: body.trigger_source || "unknown",
    fired_at: new Date().toISOString(),
    delivered_at: null,
  };
  queue.push(entry);

  // Keep queue bounded — last 20 entries max
  if (queue.length > 20) queue = queue.slice(-20);

  await patchContactCustomFields(contactId, [
    { id: fieldIds.stageTriggerQueue, field_value: JSON.stringify(queue) },
  ]);

  return NextResponse.json({
    ok: true,
    queued: entry,
    queue_depth: queue.length,
    next_step: "Mac poller will pick this up on the next 5-min cycle and email Wendy.",
  });
}
