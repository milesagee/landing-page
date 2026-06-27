import type { MetadataRoute } from "next";
import { neighborhoodSlugs } from "./neighborhoods/content";
import { zones } from "./quiz/neighborhoods";
import { activeListings } from "@/lib/listings";

const BASE = "https://mamsnow.com";

const FLAGSHIP_GUIDES = [
  "richmond-relocation",
  "first-time-buyers-richmond-va",
  "selling-in-richmond-va",
];

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

  const guideEntries: MetadataRoute.Sitemap = FLAGSHIP_GUIDES.map((slug) => ({
    url: `${BASE}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const quizResultEntries: MetadataRoute.Sitemap = zones.map((z) => ({
    url: `${BASE}/quiz/results/${z.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...core,
    ...listingEntries,
    ...neighborhoodEntries,
    ...guideEntries,
    ...quizResultEntries,
  ];
}
