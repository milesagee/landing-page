import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// Miles's MAMS GHL contact (the SMS notify target). Not a secret, just an id.
const MILES_CONTACT_ID = "aTE32T0AwFEzoyqRXtMt";
const MILES_EMAIL = "miles@milesagee.com";

// Lightweight shared gate. Visible in page source (static page), so this only
// blocks drive-by bots, not a determined actor. The page is noindex + curated.
const OFFER_TOKEN = "offmarket-offer-2026";

type OfferBody = {
  t?: string;
  deal?: string; // human label, e.g. "2119 Pimmit Dr, Falls Church VA 22043"
  dealSlug?: string; // e.g. "2119-pimmit-dr"
  name?: string;
  email?: string;
  phone?: string;
  entity?: string;
  offerPrice?: string;
  proofOfFunds?: string;
  targetClose?: string;
  contingencies?: string;
};

async function ghl(path: string, body: unknown) {
  const token = process.env.GHL_MAMS_TOKEN;
  if (!token) throw new Error("GHL_MAMS_TOKEN missing");
  const res = await fetch(`${GHL_API}${path}`, {
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
    throw new Error(`GHL ${path} -> ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

function clean(s: string | undefined, max = 400): string {
  return (s ?? "").toString().trim().substring(0, max);
}

export async function POST(req: Request) {
  let b: OfferBody;
  try {
    b = (await req.json()) as OfferBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const url = new URL(req.url);
  const token = b.t || url.searchParams.get("t") || "";
  if (token !== OFFER_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const name = clean(b.name, 120);
  const email = clean(b.email, 160);
  const phone = clean(b.phone, 40);
  const entity = clean(b.entity, 160);
  const offerPrice = clean(b.offerPrice, 60);
  const proofOfFunds = clean(b.proofOfFunds, 20);
  const targetClose = clean(b.targetClose, 80);
  const contingencies = clean(b.contingencies, 600);
  const deal = clean(b.deal, 160) || "an off-market lot";
  const dealSlug = (clean(b.dealSlug, 60) || "offmarket").replace(/[^a-z0-9-]/gi, "").toLowerCase();

  // Minimum viable: need some way to reach the buyer and a price.
  if (!offerPrice || (!email && !phone)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const locationId = process.env.GHL_MAMS_LOCATION_ID;
  const parts = name.split(/\s+/);
  const firstName = parts[0] || "Cash";
  const lastName = parts.slice(1).join(" ") || "Buyer";

  const results: Record<string, string> = {};
  let buyerContactId = "";

  // 1) Upsert the buyer as a contact (dedupes on email/phone)
  try {
    const upsert = await ghl("/contacts/upsert", {
      locationId,
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
      source: "Off-Market Dispo Page",
      tags: ["offer-presented", `dispo-${dealSlug}`],
    });
    buyerContactId = upsert?.contact?.id || upsert?.id || "";
    results.contact = buyerContactId ? "ok" : "no_id";
  } catch (e) {
    results.contact = `failed: ${(e as Error).message}`;
  }

  // 2) Note the full offer on the buyer record
  const noteBody = [
    `[OFFER PRESENTED] ${deal}`,
    ``,
    `Buyer: ${name || "(no name)"}`,
    `Entity: ${entity || "(none given)"}`,
    `Offer: ${offerPrice}`,
    `Proof of funds: ${proofOfFunds || "(not stated)"}`,
    `Target close: ${targetClose || "(not stated)"}`,
    contingencies ? `Contingencies: ${contingencies}` : `Contingencies: none stated`,
    ``,
    `Email: ${email || "(none)"}`,
    `Phone: ${phone || "(none)"}`,
    `Source: off-market deal page`,
  ].join("\n");

  if (buyerContactId) {
    try {
      await ghl(`/contacts/${buyerContactId}/notes`, { body: noteBody });
      results.note = "ok";
    } catch (e) {
      results.note = `failed: ${(e as Error).message}`;
    }
  }

  // 3) Text Miles
  try {
    const sms =
      `New offer on ${deal}: ${offerPrice}` +
      `${entity ? ` from ${entity}` : ""}` +
      `${name ? ` (${name})` : ""}.` +
      ` POF: ${proofOfFunds || "?"}. Close: ${targetClose || "?"}.` +
      `${phone ? ` ${phone}` : ""}. In OpenDispo now.`;
    await ghl("/conversations/messages", {
      type: "SMS",
      contactId: MILES_CONTACT_ID,
      message: sms.substring(0, 600),
    });
    results.smsMiles = "ok";
  } catch (e) {
    results.smsMiles = `failed: ${(e as Error).message}`;
  }

  // 4) Email Miles a record (sent through Miles's own contact so emailTo matches)
  {
    try {
      const html = `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#003F3F;max-width:560px;margin:0 auto">
  <div style="background:#003F3F;color:#fff;padding:20px 22px;border-radius:8px 8px 0 0">
    <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#D4AF37;font-weight:700">Offer Presented</div>
    <div style="font-size:20px;font-weight:700;margin-top:6px">${offerPrice}</div>
    <div style="font-size:12px;opacity:0.85;margin-top:2px">${deal}</div>
  </div>
  <div style="background:#fff;border:1px solid rgba(0,63,63,0.12);border-top:0;padding:20px 22px;border-radius:0 0 8px 8px;font-size:14px;line-height:1.6">
    <p style="margin:0 0 6px"><strong>Buyer:</strong> ${name || "(no name)"}</p>
    <p style="margin:0 0 6px"><strong>Entity:</strong> ${entity || "(none)"}</p>
    <p style="margin:0 0 6px"><strong>Proof of funds:</strong> ${proofOfFunds || "(not stated)"}</p>
    <p style="margin:0 0 6px"><strong>Target close:</strong> ${targetClose || "(not stated)"}</p>
    <p style="margin:0 0 6px"><strong>Contingencies:</strong> ${contingencies || "none stated"}</p>
    <p style="margin:0 0 6px"><strong>Email:</strong> ${email || "(none)"}</p>
    <p style="margin:0 0 6px"><strong>Phone:</strong> ${phone || "(none)"}</p>
    <p style="margin:14px 0 0;font-size:12px;opacity:0.7">Logged in OpenDispo with tag offer-presented + dispo-${dealSlug}.</p>
  </div>
</div>`.trim();
      await ghl("/conversations/messages", {
        type: "Email",
        contactId: MILES_CONTACT_ID,
        emailTo: MILES_EMAIL,
        subject: `[Offer] ${deal}, ${offerPrice}${entity ? ` (${entity})` : ""}`,
        html,
      });
      results.emailMiles = "ok";
    } catch (e) {
      results.emailMiles = `failed: ${(e as Error).message}`;
    }
  }

  const captured = results.contact === "ok";
  return NextResponse.json({ ok: captured, results }, { status: captured ? 200 : 502 });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, hint: "POST an offer with the form token" },
    { status: 405 }
  );
}
