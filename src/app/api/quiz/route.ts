const GHL_TOKEN = process.env.GHL_MAMS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_MAMS_LOCATION_ID;
const GHL_WORKFLOW_ID = process.env.GHL_QUIZ_WORKFLOW_ID;
const GHL_BASE = "https://services.leadconnectorhq.com";

const ghlHeaders = {
  Authorization: `Bearer ${GHL_TOKEN}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

interface QuizPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  answers: {
    lifeStage: string | null;
    budget: string | null;
    setting: string | null;
    homeStyle: string | null;
    walkability: number;
    commute: string | null;
    schoolsTaxes: string | null;
    lifestyle: string[];
    weeknight: string[];
    vibe: string | null;
  };
  results: {
    top3: { name: string; score: number }[];
  };
  tags: string[];
}

// Disposable email domains to block
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

export async function POST(request: Request) {
  try {
    const body: QuizPayload = await request.json();

    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return Response.json(
        { success: false, error: "All fields are required" },
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
        { success: false, error: "Please use a permanent email address" },
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
        source: "Neighborhood Quiz",
        tags: body.tags,
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

    // Step 2: Add quiz results note
    const top3 = body.results?.top3 || [];
    const noteBody = [
      "NEIGHBORHOOD QUIZ RESULTS (v2 - Zone Based)",
      "",
      ...top3.map(
        (m, i) => `#${i + 1} Match: ${m.name} (Score: ${m.score}/100)`
      ),
      "",
      "--- Quiz Answers ---",
      `Life Stage: ${body.answers?.lifeStage || "N/A"}`,
      `Budget: ${body.answers?.budget || "N/A"}`,
      `Setting Preference: ${body.answers?.setting || "N/A"}`,
      `Home Style: ${body.answers?.homeStyle || "N/A"}`,
      `Walkability Preference: ${body.answers?.walkability || "N/A"}/5`,
      `Commute Tolerance: ${body.answers?.commute || "N/A"}`,
      `Schools/Taxes: ${body.answers?.schoolsTaxes || "N/A"}`,
      `Lifestyle Priorities: ${(body.answers?.lifestyle || []).join(", ")}`,
      `Weeknight Needs: ${(body.answers?.weeknight || []).join(", ")}`,
      `Vibe: ${body.answers?.vibe || "N/A"}`,
      "",
      `Source: ${body.source || "landing-page"}`,
    ].join("\n");

    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify({ body: noteBody }),
    });

    // Step 3: Enroll in nurture workflow (if configured)
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
    console.error("Quiz API error:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
