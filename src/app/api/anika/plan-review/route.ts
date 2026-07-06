import { NextRequest, NextResponse } from "next/server";
import { isValidAnikaToken } from "@/lib/anika-data";

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
  const t = req.nextUrl.searchParams.get("t");

  let body: Payload = {};
  try {
    body = (await req.json()) as Payload;
  } catch {
    // Fall through with empty body so we can still log the auth attempt below.
  }

  if (!isValidAnikaToken(t)) {
    console.log(
      "[anika-plan-review][unauthorized]",
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        reason: "invalid_token",
        payload: body,
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  console.log(
    "[anika-plan-review]",
    JSON.stringify({
      receivedAt: new Date().toISOString(),
      payload: body,
    }),
  );

  return NextResponse.json({ ok: true, received: body });
}
