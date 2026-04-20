"use client";

import { useState, useCallback } from "react";
import { zones, type Zone } from "./neighborhoods";

// ─── TYPES ──────────────────────────────────────────────────
type LifeStage =
  | "single-pro"
  | "couple-no-kids"
  | "family-young"
  | "family-teens"
  | "empty-nester"
  | "remote-relocator";

type BudgetRange =
  | "under-400k"
  | "400-550k"
  | "550-750k"
  | "750k-plus"
  | "flexible";

type SettingPref =
  | "urban-core"
  | "established-suburb"
  | "new-suburb"
  | "rural-land";

type HomeStyle =
  | "historic-character"
  | "turnkey-established"
  | "new-construction"
  | "land-acreage"
  | "flexible-housing";

type CommuteRange =
  | "under-10"
  | "10-20"
  | "20-30"
  | "30-plus"
  | "remote-no-commute";

type LifestyleTag =
  | "restaurants-nightlife"
  | "parks-trails"
  | "shopping-convenience"
  | "arts-culture"
  | "quiet-privacy"
  | "breweries-food";

type SchoolsTaxes = "very-important" | "somewhat" | "not-a-factor";

type WeeknightTag =
  | "dining-variety"
  | "errand-convenience"
  | "outdoor-access"
  | "family-infrastructure"
  | "solitude";

type VibeScenario =
  | "farmers-market-brewery-dinner"
  | "soccer-costco-backyard"
  | "james-river-hike-brunch"
  | "quiet-porch-no-plans"
  | "new-restaurant-live-music";

interface QuizAnswers {
  lifeStage: LifeStage | null;
  budget: BudgetRange | null;
  setting: SettingPref | null;
  homeStyle: HomeStyle | null;
  walkability: number; // 1-5
  commute: CommuteRange | null;
  schoolsTaxes: SchoolsTaxes | null;
  lifestyle: LifestyleTag[];
  weeknight: WeeknightTag[];
  vibe: VibeScenario | null;
}

interface ScoredZone {
  zone: Zone;
  score: number;
  displayScore: number;
}

// ─── SCORING ENGINE ─────────────────────────────────────────
const MAX_POSSIBLE_SCORE = 150;

function scoreZones(answers: QuizAnswers): ScoredZone[] {
  return zones
    .map((z) => {
      let score = 0;

      // Q1: Life Stage (+20)
      if (answers.lifeStage && z.personas.includes(answers.lifeStage)) {
        score += 20;
      }

      // Q2: Budget (pass/fail gate)
      if (answers.budget && answers.budget !== "flexible") {
        const ranges: Record<BudgetRange, [number, number]> = {
          "under-400k": [0, 400],
          "400-550k": [400, 550],
          "550-750k": [550, 750],
          "750k-plus": [750, 2000],
          flexible: [0, 2000],
        };
        const [userLow, userHigh] = ranges[answers.budget];
        const overlaps = z.priceLow <= userHigh && z.priceHigh >= userLow;
        if (!overlaps) score -= 50;
      }

      // Q3: Setting (+15 match / -10 mismatch)
      if (answers.setting) {
        if (z.settingType === answers.setting) {
          score += 15;
        } else {
          // Partial credit for adjacent settings
          const adjacencyMap: Record<string, string[]> = {
            "urban-core": ["established-suburb"],
            "established-suburb": ["urban-core", "new-suburb"],
            "new-suburb": ["established-suburb", "rural-land"],
            "rural-land": ["new-suburb"],
          };
          if (adjacencyMap[answers.setting]?.includes(z.settingType)) {
            score += 3;
          } else {
            score -= 10;
          }
        }
      }

      // Q4: Home Style (+15 match / -8 mismatch)
      if (answers.homeStyle && answers.homeStyle !== "flexible-housing") {
        if (z.housingStock.includes(answers.homeStyle)) {
          score += 15;
        } else {
          score -= 8;
        }
      } else if (answers.homeStyle === "flexible-housing") {
        score += 3;
      }

      // Q5: Walkability (+15 scaled)
      const userWalkPref = answers.walkability; // 1-5
      const normalizedWalkScore = z.walkScore / 100; // 0-1
      const userTarget = (userWalkPref - 1) / 4; // 0-1
      const walkDiff = 1 - Math.abs(normalizedWalkScore - userTarget);
      score += Math.round(walkDiff * 15);

      // Q6: Commute (+15 if in range, -10 if exceeds)
      if (answers.commute && answers.commute !== "remote-no-commute") {
        const commuteMaxes: Record<string, number> = {
          "under-10": 10,
          "10-20": 20,
          "20-30": 30,
          "30-plus": 999,
        };
        const maxCommute = commuteMaxes[answers.commute];
        if (z.commuteMinutes <= maxCommute) {
          score += 15;
        } else if (z.commuteMinutes > maxCommute + 10) {
          score -= 10;
        }
      } else if (answers.commute === "remote-no-commute") {
        score += 8;
      }

      // Q7: Schools/Taxes (+15)
      if (answers.schoolsTaxes === "very-important") {
        if (z.taxRate < 0.90) score += 15;
        else score -= 5;
      } else if (answers.schoolsTaxes === "not-a-factor") {
        if (z.region === "city") score += 10;
      } else if (answers.schoolsTaxes === "somewhat") {
        if (z.taxRate < 1.00) score += 5;
      }

      // Q8: Lifestyle (+10 per match, max 20)
      if (answers.lifestyle.length > 0) {
        let lifestyleMatch = 0;
        for (const tag of answers.lifestyle) {
          if (z.lifestyleTags.includes(tag)) lifestyleMatch += 10;
        }
        score += Math.min(lifestyleMatch, 20);
      }

      // Q9: Weeknight (+10 per match, max 20 / -5 per mismatch)
      if (answers.weeknight.length > 0) {
        for (const tag of answers.weeknight) {
          if (z.weeknightTags.includes(tag)) {
            score += 10;
          } else {
            score -= 5;
          }
        }
      }

      // Q10: Vibe (+15)
      if (answers.vibe && z.vibeTags.includes(answers.vibe)) {
        score += 15;
      }

      const displayScore = Math.max(0, Math.min(100, Math.round((score / MAX_POSSIBLE_SCORE) * 100)));

      return { zone: z, score, displayScore };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── QUIZ QUESTIONS CONFIG ──────────────────────────────────
const QUESTIONS = [
  {
    id: "lifeStage",
    label: "Life Stage",
    question: "Who's making this move?",
    type: "single" as const,
    options: [
      { value: "single-pro", label: "Just me" },
      { value: "couple-no-kids", label: "Me and my partner" },
      { value: "family-young", label: "Family with young kids" },
      { value: "family-teens", label: "Family with teenagers" },
      { value: "empty-nester", label: "Empty nester / downsizing" },
      { value: "remote-relocator", label: "Relocating for work" },
    ],
  },
  {
    id: "budget",
    label: "Budget",
    question: "What's your comfortable price range?",
    type: "single" as const,
    options: [
      { value: "under-400k", label: "Under $400K" },
      { value: "400-550k", label: "$400K - $550K" },
      { value: "550-750k", label: "$550K - $750K" },
      { value: "750k-plus", label: "$750K+" },
      { value: "flexible", label: "I'm flexible" },
    ],
  },
  {
    id: "setting",
    label: "Setting",
    question: "Close your eyes. Where do you picture your front door?",
    type: "single" as const,
    options: [
      { value: "urban-core", label: "A sidewalk-lined street where I can hear my neighbors' music" },
      { value: "established-suburb", label: "A tree-lined neighborhood with a yard and a short drive to everything" },
      { value: "new-suburb", label: "A brand-new street where the landscaping is still growing in" },
      { value: "rural-land", label: "A quiet road with real distance between me and the next house" },
    ],
  },
  {
    id: "homeStyle",
    label: "Home Style",
    question: "What kind of home gets you excited?",
    type: "single" as const,
    options: [
      { value: "historic-character", label: "A historic home with hardwood floors, tall ceilings, and a story to tell" },
      { value: "turnkey-established", label: "A move-in-ready home -- maybe 5 to 15 years old, nothing needs fixing" },
      { value: "new-construction", label: "Brand new construction where I pick the finishes" },
      { value: "land-acreage", label: "Land and space -- acreage, room for the dog to run" },
      { value: "flexible-housing", label: "I'm open -- show me what fits my budget" },
    ],
  },
  {
    id: "walkability",
    label: "Walkability",
    question: "Where do you fall?",
    type: "slider" as const,
    leftLabel: "Give me land, a yard, and room to breathe",
    rightLabel: "I want to walk to everything",
  },
  {
    id: "commute",
    label: "Commute",
    question: "How far are you willing to drive to downtown Richmond?",
    type: "single" as const,
    options: [
      { value: "under-10", label: "Under 10 minutes" },
      { value: "10-20", label: "10-20 minutes" },
      { value: "20-30", label: "20-30 minutes" },
      { value: "30-plus", label: "30+ minutes" },
      { value: "remote-no-commute", label: "I work remote" },
    ],
  },
  {
    id: "schoolsTaxes",
    label: "Schools & Taxes",
    question: "How important are school districts and lower property taxes?",
    type: "single" as const,
    options: [
      { value: "very-important", label: "Very important" },
      { value: "somewhat", label: "Somewhat important" },
      { value: "not-a-factor", label: "Not a factor" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    question: "Pick the two that matter most to your daily life.",
    type: "multi" as const,
    maxSelect: 2,
    answerKey: "lifestyle" as const,
    options: [
      { value: "restaurants-nightlife", label: "Restaurants, bars, and nightlife" },
      { value: "parks-trails", label: "Parks, trails, and outdoor access" },
      { value: "shopping-convenience", label: "Shopping and everyday convenience" },
      { value: "arts-culture", label: "Arts, culture, and community events" },
      { value: "quiet-privacy", label: "Quiet streets and privacy" },
      { value: "breweries-food", label: "Breweries and local food scene" },
    ],
  },
  {
    id: "weeknight",
    label: "Tuesday Night",
    question: "It's a random Tuesday evening. What do you want within a 10-minute drive?",
    type: "multi" as const,
    maxSelect: 2,
    answerKey: "weeknight" as const,
    options: [
      { value: "dining-variety", label: "A great restaurant I didn't have to plan around" },
      { value: "errand-convenience", label: "Target, the grocery store, and a gas station -- just make errands easy" },
      { value: "outdoor-access", label: "A park, a trail, or water I can get to before sunset" },
      { value: "family-infrastructure", label: "My kid's practice, the school, and a pediatrician" },
      { value: "solitude", label: "Nothing -- I moved here to get away from all that" },
    ],
  },
  {
    id: "vibe",
    label: "Vibe Check",
    question: "Which Saturday sounds like yours?",
    type: "single" as const,
    options: [
      {
        value: "farmers-market-brewery-dinner",
        label: "Farmers market, afternoon at a brewery, dinner you walk to",
      },
      {
        value: "soccer-costco-backyard",
        label: "Soccer practice, Costco run, backyard cookout",
      },
      {
        value: "james-river-hike-brunch",
        label: "Hiking the James River trails, then brunch in Carytown",
      },
      {
        value: "quiet-porch-no-plans",
        label: "Quiet morning on the porch with coffee, no plans",
      },
      {
        value: "new-restaurant-live-music",
        label: "Exploring a new restaurant, catching live music",
      },
    ],
  },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    lifeStage: null,
    budget: null,
    setting: null,
    homeStyle: null,
    walkability: 3,
    commute: null,
    schoolsTaxes: null,
    lifestyle: [],
    weeknight: [],
    vibe: null,
  });
  const [results, setResults] = useState<ScoredZone[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = QUESTIONS.length;

  const canAdvance = useCallback(() => {
    const q = QUESTIONS[step];
    if (!q) return false;
    switch (q.id) {
      case "lifeStage":
        return answers.lifeStage !== null;
      case "budget":
        return answers.budget !== null;
      case "setting":
        return answers.setting !== null;
      case "homeStyle":
        return answers.homeStyle !== null;
      case "walkability":
        return true;
      case "commute":
        return answers.commute !== null;
      case "schoolsTaxes":
        return answers.schoolsTaxes !== null;
      case "lifestyle":
        return answers.lifestyle.length >= 1;
      case "weeknight":
        return answers.weeknight.length >= 1;
      case "vibe":
        return answers.vibe !== null;
      default:
        return false;
    }
  }, [step, answers]);

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const scored = scoreZones(answers);
      setResults(scored.slice(0, 6));
      setStep(totalSteps);
    }
  }, [step, totalSteps, answers]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleSingleSelect = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const handleMultiSelect = useCallback(
    (answerKey: "lifestyle" | "weeknight", value: string, maxSelect: number) => {
      setAnswers((prev) => {
        const current = prev[answerKey] as string[];
        if (current.includes(value)) {
          return { ...prev, [answerKey]: current.filter((v) => v !== value) };
        }
        if (current.length >= maxSelect) {
          return { ...prev, [answerKey]: [...current.slice(1), value] };
        }
        return { ...prev, [answerKey]: [...current, value] };
      });
    },
    []
  );

  const handleSlider = useCallback((value: number) => {
    setAnswers((prev) => ({ ...prev, walkability: value }));
  }, []);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: "landing-page",
        answers: {
          lifeStage: answers.lifeStage,
          budget: answers.budget,
          setting: answers.setting,
          homeStyle: answers.homeStyle,
          walkability: answers.walkability,
          commute: answers.commute,
          schoolsTaxes: answers.schoolsTaxes,
          lifestyle: answers.lifestyle,
          weeknight: answers.weeknight,
          vibe: answers.vibe,
        },
        results: {
          top6: results.map((r) => ({
            id: r.zone.id,
            name: r.zone.name,
            score: r.displayScore,
            region: r.zone.region,
          })),
        },
        tags: [
          "quiz-lead",
          "source-landing-page",
          ...results.slice(0, 3).map((r) => r.zone.tagSlug),
          answers.budget ? `budget-${answers.budget}` : null,
          answers.lifeStage ? `stage-${answers.lifeStage}` : null,
          answers.setting ? `setting-${answers.setting}` : null,
          answers.homeStyle ? `home-${answers.homeStyle}` : null,
        ].filter(Boolean),
      };

      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubmitError(data.error || "Something went wrong sending your info. Please try again or text Miles directly at 804-729-6267.");
          setSubmitting(false);
          return;
        }
        setFormSubmitted(true);
      } catch {
        setSubmitError("Connection failed. Please check your internet and try again.");
      }

      setSubmitting(false);
    },
    [formData, answers, results]
  );

  // ─── RENDER: RESULTS ───────────────────────────────────────
  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-paper">
        <header className="bg-deep-teal text-ivory py-4 px-6">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <span className="font-display text-lg tracking-wide">MAMS</span>
            <a href="/" className="text-sm text-teal-light hover:text-ivory transition-colors">
              Back to Home
            </a>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.12em] mb-2">
            Your Results
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-deep-teal mb-2">
            Your Top 6 Parts of Town
          </h1>
          <p className="text-teal mb-10">
            Based on your answers, here are the six areas of Greater Richmond that best fit your lifestyle, budget, and priorities. Your best match is #1. Each one has neighborhoods worth exploring.
          </p>

          {/* Top 3 Zone Cards */}
          <div className="space-y-6 mb-12">
            {results.map((r, i) => {
              const z = r.zone;
              const lifeStage = answers.lifeStage || "default";
              const blurb = z.whyFitsYou[lifeStage] || z.whyFitsYou.default;

              return (
                <div
                  key={z.id}
                  className="bg-ivory border border-deep-teal/8 rounded-sm p-6 md:p-8"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-gold text-xs font-semibold uppercase tracking-widest">
                        #{i + 1} Match
                      </span>
                      <h2 className="font-display text-xl md:text-2xl font-normal text-deep-teal mt-1">
                        {z.name}
                      </h2>
                      <p className="text-teal-light text-sm">{z.oneLiner}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-2xl font-display font-medium text-gold">
                        {r.displayScore}
                      </span>
                      <span className="text-xs text-teal-light block">
                        /100
                      </span>
                    </div>
                  </div>

                  {/* Notable Communities */}
                  <div className="mb-4 py-3 border-b border-deep-teal/6">
                    <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold mb-1.5">
                      Neighborhoods to explore
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {z.notableCommunities.map((community) => (
                        <span
                          key={community}
                          className="inline-block px-3 py-1 bg-gold/10 text-deep-teal text-xs font-medium rounded-sm"
                        >
                          {community}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 py-4 border-b border-deep-teal/6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Median Price
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {z.medianPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Walk Score
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {z.walkScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Commute
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {z.commuteMinutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Tax Rate
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        ${z.taxRate.toFixed(2)}/100
                      </p>
                    </div>
                  </div>

                  {/* Why this fits you */}
                  <p className="text-sm text-deep-teal/80 leading-relaxed">
                    {blurb}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Comparison Table: leaders only */}
          <div className="bg-ivory border border-deep-teal/8 rounded-sm p-6 md:p-8 mb-12 overflow-x-auto">
            <h3 className="font-display text-lg text-deep-teal mb-1">
              Your Top 3 Side-by-Side
            </h3>
            <p className="text-teal-light text-xs mb-4">
              Quick comparison of your three strongest matches.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-deep-teal/10">
                  <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    &nbsp;
                  </th>
                  {results.slice(0, 3).map((r) => (
                    <th
                      key={r.zone.id}
                      className="text-left py-2 px-2 font-display font-normal text-deep-teal"
                    >
                      {r.zone.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-deep-teal/80">
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Price
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2">
                      {r.zone.medianPrice}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Walk Score
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2">
                      {r.zone.walkScore}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Commute
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2">
                      {r.zone.commuteMinutes} min
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Tax Rate
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2">
                      ${r.zone.taxRate.toFixed(2)}/100
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Schools
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2">
                      {r.zone.schoolDistrict}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Neighborhoods
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td key={r.zone.id} className="py-2 px-2 text-xs">
                      {r.zone.notableCommunities.join(", ")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Honest Tradeoff
                  </td>
                  {results.slice(0, 3).map((r) => (
                    <td
                      key={r.zone.id}
                      className="py-2 px-2 text-xs text-deep-teal/60"
                    >
                      {r.zone.tradeoff}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lead Capture */}
          {!formSubmitted ? (
            <div className="bg-deep-teal text-ivory rounded-sm p-8 md:p-10">
              {!showLeadForm ? (
                <div className="text-center">
                  <h3 className="font-display text-2xl font-light mb-3">
                    Want the full top 6 breakdown?
                  </h3>
                  <p className="text-teal-light mb-6 max-w-md mx-auto">
                    These three are just the start. Get your full top 6 match report plus the complete Richmond Relocation Guide with the chapters to focus on based on your answers.
                  </p>
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="bg-gold text-deep-teal px-8 py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors"
                  >
                    Send My Full Report
                  </button>
                  <p className="text-teal-light text-xs mt-4">
                    Or skip straight to a conversation:{" "}
                    <a
                      href="https://mamsrealestate.com/consult"
                      className="text-gold hover:text-gold-dark underline"
                    >
                      Book a free consultation with Miles
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="max-w-md mx-auto">
                  <h3 className="font-display text-2xl font-light mb-6 text-center">
                    Where should we send your full report?
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((d) => ({ ...d, firstName: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-teal/30 border border-teal-light/30 rounded-sm text-ivory placeholder:text-teal-light/60 focus:outline-none focus:border-gold"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((d) => ({ ...d, lastName: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-teal/30 border border-teal-light/30 rounded-sm text-ivory placeholder:text-teal-light/60 focus:outline-none focus:border-gold"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, email: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-teal/30 border border-teal-light/30 rounded-sm text-ivory placeholder:text-teal-light/60 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-teal/30 border border-teal-light/30 rounded-sm text-ivory placeholder:text-teal-light/60 focus:outline-none focus:border-gold"
                    />
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 w-4 h-4 rounded border-teal-light/30 bg-teal/30 accent-gold flex-shrink-0"
                      />
                      <span className="text-xs text-teal-light/70 leading-relaxed">
                        By checking this box, I consent to receive transactional and marketing messages including appointment reminders, special offers, and updates. Message frequency may vary. Message &amp; Data rates may apply. Reply HELP for help or STOP to opt-out.
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gold text-deep-teal py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Send My Full Report"}
                    </button>
                    {submitError && (
                      <p className="text-sm text-red-300 text-center mt-2" role="alert">
                        {submitError}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-deep-teal text-ivory rounded-sm p-8 md:p-10 text-center">
              <h3 className="font-display text-2xl font-light mb-3">
                You're in, {formData.firstName}.
              </h3>
              <p className="text-teal-light mb-3">
                Monique from our team is about to text you. She's our concierge and she makes sure every lead gets taken care of.
              </p>
              <p className="text-teal-light mb-6">
                Reply to her quick question and your full top 6 report plus the Richmond Relocation Guide land in your inbox right after.
              </p>
              <a
                href="https://mamsrealestate.com/consult"
                className="inline-block bg-gold text-deep-teal px-8 py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors"
              >
                Book a Free Consultation
              </a>
            </div>
          )}

          {/* Retake */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({
                  lifeStage: null,
                  budget: null,
                  setting: null,
                  homeStyle: null,
                  walkability: 3,
                  commute: null,
                  schoolsTaxes: null,
                  lifestyle: [],
                  weeknight: [],
                  vibe: null,
                });
                setResults([]);
                setShowLeadForm(false);
                setFormSubmitted(false);
              }}
              className="text-teal text-sm hover:text-deep-teal transition-colors underline"
            >
              Retake the quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: QUIZ QUESTIONS ────────────────────────────────
  const currentQuestion = QUESTIONS[step];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-deep-teal text-ivory py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="font-display text-lg tracking-wide">MAMS</span>
          <a href="/" className="text-sm text-teal-light hover:text-ivory transition-colors">
            Back to Home
          </a>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-ivory border-b border-deep-teal/6">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-teal-light font-semibold uppercase tracking-widest">
              {currentQuestion.label}
            </span>
            <span className="text-xs text-teal-light">
              {step + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-deep-teal/6 rounded-full h-1.5">
            <div
              className="bg-gold h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <h2 className="font-display text-2xl md:text-3xl font-light text-deep-teal mb-8 text-center">
            {currentQuestion.question}
          </h2>

          {/* Single Select */}
          {currentQuestion.type === "single" && (
            <div className="space-y-3">
              {currentQuestion.options!.map((opt) => {
                const isSelected =
                  answers[currentQuestion.id as keyof QuizAnswers] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleSelect(currentQuestion.id, opt.value)}
                    className={`w-full text-left px-5 py-4 rounded-sm border transition-all text-sm ${
                      isSelected
                        ? "border-gold bg-gold/10 text-deep-teal font-medium"
                        : "border-deep-teal/10 bg-ivory text-deep-teal/80 hover:border-teal/30 hover:bg-ivory"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Multi Select */}
          {currentQuestion.type === "multi" && (
            <div className="space-y-3">
              <p className="text-center text-teal-light text-xs mb-4">
                Select up to {currentQuestion.maxSelect}
              </p>
              {currentQuestion.options!.map((opt) => {
                const answerKey = currentQuestion.answerKey || "lifestyle";
                const currentSelections = answers[answerKey] as string[];
                const isSelected = currentSelections.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleMultiSelect(
                        answerKey as "lifestyle" | "weeknight",
                        opt.value,
                        currentQuestion.maxSelect!
                      )
                    }
                    className={`w-full text-left px-5 py-4 rounded-sm border transition-all text-sm ${
                      isSelected
                        ? "border-gold bg-gold/10 text-deep-teal font-medium"
                        : "border-deep-teal/10 bg-ivory text-deep-teal/80 hover:border-teal/30 hover:bg-ivory"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {currentQuestion.type === "slider" && (
            <div className="px-2">
              <div className="flex justify-between text-xs text-teal-light mb-6">
                <span className="max-w-[140px]">{currentQuestion.leftLabel}</span>
                <span className="max-w-[140px] text-right">
                  {currentQuestion.rightLabel}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={answers.walkability}
                onChange={(e) => handleSlider(Number(e.target.value))}
                className="w-full h-2 bg-deep-teal/10 rounded-full appearance-none cursor-pointer accent-gold"
              />
              <div className="flex justify-between text-xs text-teal-light mt-2 px-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={
                      answers.walkability === n
                        ? "text-gold font-semibold"
                        : ""
                    }
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`text-sm px-4 py-2 rounded-sm transition-colors ${
                step === 0
                  ? "text-deep-teal/20 cursor-not-allowed"
                  : "text-teal hover:text-deep-teal"
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`px-8 py-3 rounded-sm text-sm font-semibold uppercase tracking-wide transition-all ${
                canAdvance()
                  ? "bg-gold text-deep-teal hover:bg-gold-dark"
                  : "bg-deep-teal/10 text-deep-teal/30 cursor-not-allowed"
              }`}
            >
              {step === totalSteps - 1 ? "See My Results" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
