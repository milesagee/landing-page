import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Payload = {
  submittedAt?: string;
  verdicts?: Record<string, string | null>;
  notes?: Record<string, string>;
  voiceChoice?: string | null;
  nextTestCycle?: { classes?: string; hardest?: string; nextTest?: string };
  openText?: string;
};

export async function GET() {
  return NextResponse.json({ error: "POST only" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  // Echo the payload back so the client can render the thank-you summary,
  // and log to Vercel server logs so Miles can recover it from the dashboard
  // if the clipboard step gets skipped.
  console.log(
    "[anika-plan-review]",
    JSON.stringify({
      receivedAt: new Date().toISOString(),
      payload: body,
    }),
  );

  return NextResponse.json({ ok: true, received: body });
}
