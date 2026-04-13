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
  email: string;
  phone: string;
  source?: string;
  answers: {
    budget: string | null;
    lifeStage: string | null;
    walkability: number;
    commute: string | null;
    lifestyle: string[];
    schoolsTaxes: string | null;
    vibe: string | null;
  };
  results: {
    top3: { name: string; score: number }[];
  };
  tags: string[];
}

export async function POST(request: Request) {
  try {
    const body: QuizPayload = await request.json();

    if (!body.firstName || !body.email || !body.phone) {
      return Response.json(
        { success: false, error: "Missing required fields" },
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
      "NEIGHBORHOOD QUIZ RESULTS",
      "",
      ...top3.map(
        (m, i) => `#${i + 1} Match: ${m.name} (Score: ${m.score})`
      ),
      "",
      `Budget: ${body.answers?.budget || "N/A"}`,
      `Life Stage: ${body.answers?.lifeStage || "N/A"}`,
      `Walkability Preference: ${body.answers?.walkability || "N/A"}/5`,
      `Commute Tolerance: ${body.answers?.commute || "N/A"}`,
      `Lifestyle Priorities: ${(body.answers?.lifestyle || []).join(", ")}`,
      `Schools/Taxes: ${body.answers?.schoolsTaxes || "N/A"}`,
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
