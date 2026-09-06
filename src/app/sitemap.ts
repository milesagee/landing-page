import type { MetadataRoute } from "next";
import { neighborhoodSlugs } from "./neighborhoods/content";
import { activeListings } from "@/lib/listings";

const BASE = "https://mamsnow.com";

// Only list a URL here once its route actually returns 200. A sitemap entry for
// an unbuilt route is a 404 served straight to an answer engine. The /guides/*
// and /quiz/results/* blocks were removed 2026-09-06 for exactly that reason:
// they advertised ~20 dead URLs out of 36. Re-add each one in the same commit
// that ships its route, never ahead of it.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/quiz`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/listings`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/neighborhoods`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/connect`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const listingEntries: MetadataRoute.Sitemap = activeListings()
    .filter((l) => l.breakdownUrl)
    .map((l) => ({
      url: `${BASE}${l.breakdownUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

  const neighborhoodEntries: MetadataRoute.Sitemap = neighborhoodSlugs.map(
    (slug) => ({
      url: `${BASE}/neighborhoods/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    })
  );

  return [...core, ...listingEntries, ...neighborhoodEntries];
}
