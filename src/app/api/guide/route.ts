const GHL_TOKEN = process.env.GHL_MAMS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_MAMS_LOCATION_ID;
const GHL_WORKFLOW_ID = process.env.GHL_GUIDE_WORKFLOW_ID;
const GHL_BASE = "https://services.leadconnectorhq.com";

const ghlHeaders = {
  Authorization: `Bearer ${GHL_TOKEN}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

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
