import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // The guide PDF used to sit in public/guides/ and returned 200 to anyone,
  // crawlers included, which made the email form on the landing page a decoration.
  // The file now lives in private/guides/ and is only reachable through
  // /api/guide/download with a signed token. Redirects are evaluated before the
  // filesystem, so this also holds if the file is ever dropped back into public/.
  // Any GHL email still pointing at the old URL lands a human on the gate instead
  // of a 404, and hands a crawler HTML instead of a defective PDF.
  async redirects() {
    return [
      {
        source: "/guides/richmond-relocation-guide.pdf",
        destination: "/#guide",
        permanent: false,
      },
    ];
  },
  // private/ is not traced automatically because nothing imports it.
  outputFileTracingIncludes: {
    "/api/guide/download": ["private/guides/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), camera=(), microphone=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
