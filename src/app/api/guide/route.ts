const GHL_TOKEN = process.env.GHL_MAMS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_MAMS_LOCATION_ID;
const GHL_WORKFLOW_ID = process.env.GHL_GUIDE_WORKFLOW_ID;
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
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // Must be 10 digits (or 11 starting with 1)
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits[0] === '1') return true;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

interface GuidePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export async function POST(request: Request) {
  try {
    const body: GuidePayload = await request.json();

    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return Response.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return Response.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Block disposable emails
    if (isDisposableEmail(body.email)) {
      return Response.json(
        { success: false, error: "Please use a permanent email address, not a temporary one" },
        { status: 400 }
      );
    }

    // Validate phone format
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
        source: "Relocation Guide Download",
        tags: ["guide-lead", "source-landing-page", "relocation-guide"],
      }),
    });

    const createData = await createRes.json();
    const contactId = createData?.contact?.id;

    if (!contactId) {
      console.error("Failed to create GHL contact:", createData);
      return Response.json(
        { success: false, error: "Failed to create contact" },
        { status: 502 }
      );
    }

    // Step 2: Add note
    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify({
        body: [
          "RELOCATION GUIDE REQUEST",
          "",
          `Name: ${body.firstName} ${body.lastName}`,
          `Email: ${body.email}`,
          `Phone: ${body.phone}`,
          "",
          "Requested the Richmond Relocation Guide from the landing page.",
          "Pending verification before guide delivery.",
          "",
          `Source: landing-page`,
          `Date: ${new Date().toISOString()}`,
        ].join("\n"),
      }),
    });

    // Step 3: Enroll in guide delivery workflow (if configured)
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

    return Response.json({ success: true, contactId });
  } catch (err) {
    console.error("Guide API error:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
