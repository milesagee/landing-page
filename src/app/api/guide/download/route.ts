// Token gated delivery of the Richmond Relocation Guide PDF.
//
// The file lives at mams-site/private/guides/, outside public/, so Next never
// serves it from the filesystem. This handler is the only path to it, and it
// refuses without a valid signed token. /api/ is already disallowed in
// robots.ts, and every response here also carries X-Robots-Tag: noindex.

import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { verifyGuideToken } from "@/lib/guide-token";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_PATH = path.join(process.cwd(), "private", "guides", "richmond-relocation-guide.pdf");

const NO_INDEX = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "Cache-Control": "private, no-store",
};

function refuse(status: number, message: string) {
  return Response.json({ success: false, error: message }, { status, headers: NO_INDEX });
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return refuse(429, "Too many requests. Please try again in a minute.");
  }

  const token = new URL(request.url).searchParams.get("t");
  const verdict = verifyGuideToken(token);

  if (!verdict.ok) {
    if (verdict.reason === "unconfigured") {
      console.error("GUIDE_DOWNLOAD_SECRET is not set. Refusing to serve the guide.");
      return refuse(503, "Guide delivery is not configured yet.");
    }
    if (verdict.reason === "expired") {
      return refuse(410, "This download link has expired. Request the guide again at mamsnow.com/#guide");
    }
    return refuse(403, "This download link is not valid. Request the guide at mamsnow.com/#guide");
  }

  let size: number;
  try {
    size = statSync(PDF_PATH).size;
  } catch {
    console.error("Guide PDF missing at", PDF_PATH);
    return refuse(500, "The guide is temporarily unavailable.");
  }

  const stream = Readable.toWeb(createReadStream(PDF_PATH)) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    status: 200,
    headers: {
      ...NO_INDEX,
      "Content-Type": "application/pdf",
      "Content-Length": String(size),
      "Content-Disposition": 'inline; filename="richmond-relocation-guide.pdf"',
    },
  });
}
