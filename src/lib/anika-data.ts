import crypto from "crypto";

// The actual token lives only in Anika's email + iMessage from Miles.
// This hash is the gate. Brute-forcing 96 bits of base64url is not the threat
// model. Casual repo-scraping is, and the hash defeats it.
const ANIKA_PLAN_TOKEN_HASH =
  "3addff43e2ecc7879f114aaa8cb0c3eaf5cb2a912299e951e999b9ff0e7cf541";

export function isValidAnikaToken(t: string | undefined | null): boolean {
  if (!t) return false;
  const incoming = crypto.createHash("sha256").update(t).digest("hex");
  // Constant-time compare to avoid timing leaks on the hash.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(incoming, "hex"),
      Buffer.from(ANIKA_PLAN_TOKEN_HASH, "hex"),
    );
  } catch {
    return false;
  }
}
