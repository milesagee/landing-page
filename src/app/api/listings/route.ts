import { isRateLimited } from "@/lib/rate-limit";

const GHL_TOKEN = process.env.GHL_MAMS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_MAMS_LOCATION_ID;
const GHL_WORKFLOW_ID = process.env.GHL_LISTINGS_WORKFLOW_ID;
const GHL_BASE = "https://services.leadconnectorhq.com";

const ghlHeaders = {
  Authorization: `Bearer ${GHL_TOKEN}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

// Disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'guerrillamail.com','guerrillamail.net','guerrillamail.org','grr.la','guerrillamailblock.com',
  'tempmail.com','temp-mail.org','temp-mail.io','tempail.com','tempr.email',
  'throwaway.email','throwaway.com','throwamail.com',
  'mailinator.com','maildrop.cc','dispostable.com','yopmail.com','yopmail.fr',
  'sharklasers.com','guerrillamail.info','spam4.me','trashmail.com','trashmail.net',
  'fakeinbox.com','mailnesia.com','mailcatch.com','discard.email','discardmail.com',
  'getairmail.com','mailexpire.com','mohmal.com','burnermail.io','10minutemail.com',
  'minutemail.com','emailondeck.com','getnada.com','mailsac.com','harakirimail.com',
  'crazymailing.com','tmail.ws','tmpmail.net','tmpmail.org','bupmail.com',
  'mailtemp.info','inboxkitten.com','33mail.com','anonaddy.com','simplelogin.co',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return !domain || DISPOSABLE_DOMAINS.has(domain);
}

function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits[0] === '1') return true;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Instant first-touch SMS to the inquirer. Monique intro framing (brand, not
// AI disclosure) per the MAMS first-touch rule. No implied urgency, no calendar
// push, no em dash. The listings page is cold inbound, so the channel is the
// MAMS line and this is their first contact from it.
function buildInquirerSms(firstName: string, listing?: string, intent?: string): string {
  const i = (intent || "").toLowerCase();
  if (listing) {
    return `Hi ${firstName}, this is Monique with MAMS, Miles Agee's coordinator. Your question on ${listing} came through. Miles handles these himself and will follow up. Anything you want him to know first, just reply here.`;
  }
  if (i.includes("sell")) {
    return `Hi ${firstName}, this is Monique with MAMS, Miles Agee's coordinator. Your note about selling came through. Miles will follow up personally. Anything you want him to know first, just reply here.`;
  }
  return `Hi ${firstName}, this is Monique with MAMS, Miles Agee's coordinator. Your inquiry from the listings page came through. Miles will follow up personally. Anything you want him to know first, just reply here.`;
}

function buildMilesEmailHtml(p: ListingsPayload): string {
  return `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #003F3F; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
  <div style="background: #003F3F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; font-weight: 600;">Listings Page - new inquiry</div>
    <div style="font-size: 22px; font-weight: 700; margin-top: 8px; font-family: 'Fraunces', serif;">${escapeHtml(p.firstName)} just reached out from /listings.</div>
  </div>
  <div style="background: white; border: 1px solid #003F3F1A; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px 0;">Monique sent the holding first-touch SMS on the MAMS line. Your move next.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Name</td><td style="padding: 4px 0;">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Phone</td><td style="padding: 4px 0;">${escapeHtml(p.phone)}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Email</td><td style="padding: 4px 0;">${escapeHtml(p.email)}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Intent</td><td style="padding: 4px 0;">${escapeHtml(p.intent || "Not specified")}</td></tr>
      <tr><td style="padding: 4px 8px 4px 0; color: #003F3F99;">Listing</td><td style="padding: 4px 0;">${escapeHtml(p.listing || "No specific listing")}</td></tr>
    </table>
    ${p.message ? `<div style="background: #FAF7F1; border-left: 3px solid #D4AF37; padding: 12px 16px; margin: 16px 0 0 0; font-size: 14px; line-height: 1.6;"><strong>What they're looking for:</strong><br/>${escapeHtml(p.message)}</div>` : ""}
  </div>
</body></html>
  `.trim();
}

interface ListingsPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  intent?: string; // "Buying" | "Selling" | "Both"
  message?: string; // wishlist / what they're looking for
  listing?: string; // specific listing label when "Ask about this home" was used
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Content-Type check
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return Response.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body: ListingsPayload = await request.json();

    // Length limits
    if (body.firstName?.length > 100 || body.lastName?.length > 100) {
      return Response.json(
        { success: false, error: "Name fields must be under 100 characters" },
        { status: 400 }
      );
    }
    if (body.email?.length > 254) {
      return Response.json(
        { success: false, error: "Email must be under 254 characters" },
        { status: 400 }
      );
    }
    if (body.phone?.length > 20) {
      return Response.json(
        { success: false, error: "Phone number is too long" },
        { status: 400 }
      );
    }
    if (body.message && body.message.length > 2000) {
      return Response.json(
        { success: false, error: "Message is too long" },
        { status: 400 }
      );
    }

    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return Response.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return Response.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (isDisposableEmail(body.email)) {
      return Response.json(
        { success: false, error: "Please use a permanent email address, not a temporary one" },
        { status: 400 }
      );
    }

    if (!isValidUSPhone(body.phone)) {
      return Response.json(
        { success: false, error: "Please enter a valid US phone number" },
        { status: 400 }
      );
    }

    if (!GHL_TOKEN || !GHL_LOCATION_ID) {
      console.error("GHL credentials not configured");
      return Response.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const intent = (body.intent || "").toLowerCase();
    const tags = ["listings-inquiry", "source-listings-page"];
    if (intent.includes("buy")) tags.push("interest-buying");
    if (intent.includes("sell")) tags.push("interest-selling");
    if (body.listing) tags.push("listing-specific");

    // Step 1: Create contact in GHL
    const createRes = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        locationId: GHL_LOCATION_ID,
        source: "Listings Page",
        tags,
      }),
    });

    const createData = await createRes.json();
    const contactId = createData?.contact?.id;

    if (!contactId) {
      console.error("Failed to create GHL contact, status:", createRes.status);
      return Response.json(
        { success: false, error: "Failed to create contact" },
        { status: 502 }
      );
    }

    // Step 2: Add note with the wishlist details
    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify({
        body: [
          "LISTINGS PAGE INQUIRY",
          "",
          `Name: ${body.firstName} ${body.lastName}`,
          `Email: ${body.email}`,
          `Phone: ${body.phone}`,
          `Intent: ${body.intent || "Not specified"}`,
          `Interested in: ${body.listing || "No specific listing"}`,
          "",
          "What they're looking for:",
          body.message || "(no details provided)",
          "",
          `Source: mamsnow.com/listings`,
          `Date: ${new Date().toISOString()}`,
        ].join("\n"),
      }),
    });

    // Step 3: Speed-to-lead first-touch. Sent directly here (not deferred to a
    // GHL workflow) so a buyer never hits silence. Two sends in parallel:
    //   a) Monique intro + holding-reply SMS to the inquirer on the MAMS line.
    //   b) Instant notification email to Miles so he can follow up personally.
    // Failures are non-fatal: the lead is already captured (contact + note), so
    // a send hiccup must not 502 the form.
    const inquirerSms = buildInquirerSms(body.firstName, body.listing, body.intent);
    const milesEmailHtml = buildMilesEmailHtml(body);

    const firstTouch = await Promise.allSettled([
      fetch(`${GHL_BASE}/conversations/messages`, {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify({ type: "SMS", contactId, message: inquirerSms }),
      }),
      fetch(`${GHL_BASE}/conversations/messages`, {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify({
          type: "Email",
          contactId,
          emailTo: "miles@milesagee.com",
          subject: `[Listings Inquiry] ${body.firstName} ${body.lastName}`,
          html: milesEmailHtml,
        }),
      }),
    ]);
    if (firstTouch[0].status === "rejected") {
      console.error("Listings first-touch SMS failed:", firstTouch[0].reason);
    }
    if (firstTouch[1].status === "rejected") {
      console.error("Listings Miles-notification email failed:", firstTouch[1].reason);
    }

    // Step 4: Optionally enroll in a longer nurture workflow (if configured).
    // This is now supplemental to the instant first-touch above, not the only
    // response. Leave GHL_LISTINGS_WORKFLOW_ID unset and inquiries still get the
    // immediate Monique touch + Miles alert.
    if (GHL_WORKFLOW_ID) {
      await fetch(
        `${GHL_BASE}/contacts/${contactId}/workflow/${GHL_WORKFLOW_ID}`,
        {
          method: "POST",
          headers: ghlHeaders,
          body: JSON.stringify({}),
        }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Listings API error:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
