// Human labels for the tag vocabularies used by the quiz scoring engine.
// Kept in one place so the interactive quiz and the indexable results pages
// never drift into two different names for the same tag.

export const HOUSING_STOCK_LABELS: Record<string, string> = {
  "historic-character": "Historic homes with original detail",
  "turnkey-established": "Move-in-ready homes, roughly 5 to 15 years old",
  "new-construction": "New construction where you pick finishes",
  "land-acreage": "Land and acreage",
  "flexible-housing": "A mix across price points",
};

export const LIFESTYLE_LABELS: Record<string, string> = {
  "restaurants-nightlife": "Restaurants, bars, and nightlife",
  "parks-trails": "Parks, trails, and outdoor access",
  "shopping-convenience": "Shopping and everyday convenience",
  "arts-culture": "Arts, culture, and community events",
  "quiet-privacy": "Quiet streets and privacy",
  "breweries-food": "Breweries and local food",
};

export const WEEKNIGHT_LABELS: Record<string, string> = {
  "dining-variety": "A restaurant you did not have to plan around",
  "errand-convenience": "Errands done without a second trip",
  "outdoor-access": "A park, a trail, or water before sunset",
  "family-infrastructure": "Practice, school, and a pediatrician close in",
  solitude: "Nothing at all, on purpose",
};

export const SETTING_LABELS: Record<string, string> = {
  "urban-core": "Urban core",
  "established-suburb": "Established suburb",
  "new-suburb": "Newer suburb",
  "rural-land": "Rural and land",
};

export function label(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}
