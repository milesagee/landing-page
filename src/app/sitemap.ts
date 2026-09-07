import type { MetadataRoute } from "next";
import { neighborhoodSlugs } from "./neighborhoods/content";
import { guideSlugs } from "./guides/content";
import { zoneSlugs } from "./quiz/neighborhoods";
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
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/quiz/results`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
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

  // Shipped 2026-09-06 alongside src/app/guides/[slug] and
  // src/app/quiz/results/[zone]. Both routes are statically generated from the
  // same slug arrays listed here, so a slug cannot appear in the sitemap without
  // a page existing for it.
  const guideEntries: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${BASE}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const zoneEntries: MetadataRoute.Sitemap = zoneSlugs.map((slug) => ({
    url: `${BASE}/quiz/results/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    ...core,
    ...guideEntries,
    ...listingEntries,
    ...neighborhoodEntries,
    ...zoneEntries,
  ];
}
