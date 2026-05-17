import type { MetadataRoute } from "next";

const PUBLIC_DISALLOW = ["/api/", "/admin/", "/private/", "/concierge/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PUBLIC_DISALLOW },

      { userAgent: "OAI-SearchBot", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "GPTBot", allow: "/", disallow: PUBLIC_DISALLOW },

      { userAgent: "Claude-SearchBot", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "Claude-User", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "ClaudeBot", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "anthropic-ai", allow: "/", disallow: PUBLIC_DISALLOW },

      { userAgent: "PerplexityBot", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "Perplexity-User", allow: "/", disallow: PUBLIC_DISALLOW },

      { userAgent: "Google-Extended", allow: "/", disallow: PUBLIC_DISALLOW },

      { userAgent: "Applebot-Extended", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "CCBot", allow: "/", disallow: PUBLIC_DISALLOW },
      { userAgent: "Meta-ExternalAgent", allow: "/", disallow: PUBLIC_DISALLOW },
    ],
    sitemap: "https://mamsnow.com/sitemap.xml",
    host: "https://mamsnow.com",
  };
}
