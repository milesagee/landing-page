// Signed, time limited tokens for the Richmond Relocation Guide PDF.
//
// Why this exists: the PDF sat at /guides/richmond-relocation-guide.pdf inside
// public/ and returned 200 to anyone, crawlers included, which meant the email
// form on the landing page gated nothing. The file now lives outside public/ and
// only reaches a reader through /api/guide/download with a valid token.
//
// The control is proven by making it refuse. If GUIDE_DOWNLOAD_SECRET is not
// configured, mintGuideToken throws and verifyGuideToken returns "unconfigured".
// Nothing here ever falls open to serving the file.

import { createHmac, timingSafeEqual } from "node:crypto";

const PURPOSE = "richmond-relocation-guide";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days, long enough for an email to sit unread

export type TokenVerdict =
  | { ok: true; expiresAt: number }
  | { ok: false; reason: "unconfigured" | "missing" | "malformed" | "bad-signature" | "expired" };

function secret(): string | null {
  const value = process.env.GUIDE_DOWNLOAD_SECRET;
  if (!value || value.length < 32) return null;
  return value;
}

export function guideDownloadConfigured(): boolean {
  return secret() !== null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Returns "<expEpochSeconds>.<signature>". Throws if the secret is missing. */
export function mintGuideToken(ttlSeconds: number = DEFAULT_TTL_SECONDS): string {
  const key = secret();
  if (!key) {
    throw new Error(
      "GUIDE_DOWNLOAD_SECRET is not set (needs 32+ chars). Refusing to mint a guide token."
    );
  }
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${PURPOSE}:${exp}`;
  return `${exp}.${sign(payload, key)}`;
}

export function verifyGuideToken(token: string | null | undefined): TokenVerdict {
  const key = secret();
  if (!key) return { ok: false, reason: "unconfigured" };
  if (!token) return { ok: false, reason: "missing" };

  const dot = token.indexOf(".");
  if (dot < 1) return { ok: false, reason: "malformed" };

  const expRaw = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp <= 0 || !provided) {
    return { ok: false, reason: "malformed" };
  }

  const expected = sign(`${PURPOSE}:${exp}`, key);
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad-signature" };
  }

  if (Math.floor(Date.now() / 1000) > exp) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, expiresAt: exp };
}

export function guideDownloadUrl(origin: string, ttlSeconds?: number): string {
  return `${origin}/api/guide/download?t=${encodeURIComponent(mintGuideToken(ttlSeconds))}`;
}
