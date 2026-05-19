/**
 * /api/buyer-match/[contactId]/interest
 *
 * Fires when a buyer taps "Tell Miles more" on any buyer-match card. Records
 * the interest as a GHL note + tag and notifies Miles via Conversations
 * email. Token-gated. POST only.
 */

import { NextResponse } from "next/server";
import { getBuyerMatchByToken } from "@/lib/buyer-match-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

type Params = Promise<{ contactId: string }>;

type InterestBody = {
  slug?: string;
  address?: string;
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

export async function POST(req: Request, { params }: { params: Params }) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  if (!t) return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });

  const data = getBuyerMatchByToken(contactId, t);
  if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  let body: InterestBody;
  try {
    body = (await req.json()) as InterestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!body.slug || !body.address) {
    return NextResponse.json({ ok: false, error: "missing_property" }, { status: 422 });
  }

  const interestedAt = new Date().toISOString();
  const property = data.properties.find((p) => p.slug === body.slug);
  if (!property) {
    return NextResponse.json({ ok: false, error: "property_not_in_shortlist" }, { status: 404 });
  }

  const noteBody = [
    `[Buyer Match] ${data.firstName} tapped "Tell Miles more"`,
    `Recorded: ${interestedAt}`,
    `Property: ${property.address}, ${property.city} ${property.state} ${property.zip}`,
    `Price label: ${property.priceLabel}`,
    `MLS: ${property.mlsNumber || "Not on MLS"}`,
    `Source: ${property.sourceUrl}`,
    ``,
    `Gap-fill reason: ${property.gapFillReason}`,
  ].join("\n");

  const milesEmailHtml = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Buyer Match - interest</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${data.firstName} wants more on ${property.address}.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px 0;">Tapped on the buyer-match dashboard at <code>${new Date(interestedAt).toLocaleString("en-US")}</code>.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Property</td><td style="padding: 4px 0;">${property.address}, ${property.city} ${property.state} ${property.zip}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Price</td><td style="padding: 4px 0;">${property.priceLabel}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">MLS</td><td style="padding: 4px 0;">${property.mlsNumber || "Not on MLS"}</td></tr>
    </table>
    <p style="margin: 16px 0 0 0;"><a href="${property.sourceUrl}" style="color: #B1922E;">Open the listing</a></p>
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
    await ghlPost(`/contacts/${contactId}/tags`, { tags: ["buyer-match-interest"] });
    results.tag = "ok";
  } catch (err) {
    results.tag = `failed: ${(err as Error).message}`;
  }

  try {
    await ghlPost(`/conversations/messages`, {
      type: "Email",
      contactId,
      emailTo: "miles@milesagee.com",
      subject: `[Buyer Match] ${data.firstName} - ${property.address}`,
      html: milesEmailHtml,
    });
    results.milesEmail = "ok";
  } catch (err) {
    results.milesEmail = `failed: ${(err as Error).message}`;
  }

  return NextResponse.json({ ok: true, interestedAt, results });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST with ?t=<token> + { slug, address } to record interest.",
    },
    { status: 405 },
  );
}
