"use client";

import { useState, useCallback } from "react";
import { neighborhoods, type Neighborhood } from "./neighborhoods";

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

type VibeScenario =
  | "farmers-market-brewery-dinner"
  | "soccer-costco-backyard"
  | "james-river-hike-brunch"
  | "quiet-porch-no-plans"
  | "new-restaurant-live-music";

interface QuizAnswers {
  budget: BudgetRange | null;
  lifeStage: LifeStage | null;
  walkability: number; // 1-5
  commute: CommuteRange | null;
  lifestyle: LifestyleTag[];
  schoolsTaxes: SchoolsTaxes | null;
  vibe: VibeScenario | null;
}

interface ScoredNeighborhood {
  neighborhood: Neighborhood;
  score: number;
}

// ─── SCORING ENGINE ─────────────────────────────────────────
function scoreNeighborhoods(answers: QuizAnswers): ScoredNeighborhood[] {
  return neighborhoods
    .map((n) => {
      let score = 0;

      // Q1: Budget (pass/fail gate)
      if (answers.budget && answers.budget !== "flexible") {
        const ranges: Record<BudgetRange, [number, number]> = {
          "under-400k": [0, 400],
          "400-550k": [400, 550],
          "550-750k": [550, 750],
          "750k-plus": [750, 2000],
          flexible: [0, 2000],
        };
        const [userLow, userHigh] = ranges[answers.budget];
        const overlaps = n.priceLow <= userHigh && n.priceHigh >= userLow;
        if (!overlaps) score -= 50;
      }

      // Q2: Life Stage (+20)
      if (answers.lifeStage && n.personas.includes(answers.lifeStage)) {
        score += 20;
      }

      // Q3: Walkability (+15 scaled)
      // walkability 1 = wants space (low walk score good), 5 = wants walkability (high walk score good)
      const userWalkPref = answers.walkability; // 1-5
      const normalizedWalkScore = n.walkScore / 100; // 0-1
      const userTarget = (userWalkPref - 1) / 4; // 0-1
      const walkDiff = 1 - Math.abs(normalizedWalkScore - userTarget);
      score += Math.round(walkDiff * 15);

      // Q4: Commute (+15 if in range, -10 if exceeds)
      if (answers.commute && answers.commute !== "remote-no-commute") {
        const commuteMaxes: Record<string, number> = {
          "under-10": 10,
          "10-20": 20,
          "20-30": 30,
          "30-plus": 999,
        };
        const maxCommute = commuteMaxes[answers.commute];
        if (n.commuteMinutes <= maxCommute) {
          score += 15;
        } else if (n.commuteMinutes > maxCommute + 10) {
          score -= 10;
        }
      } else if (answers.commute === "remote-no-commute") {
        // No penalty or bonus based on commute
        score += 8; // slight bonus for flexibility
      }

      // Q5: Lifestyle (+10 per match, max 20)
      if (answers.lifestyle.length > 0) {
        let lifestyleMatch = 0;
        for (const tag of answers.lifestyle) {
          if (n.lifestyleTags.includes(tag)) lifestyleMatch += 10;
        }
        score += Math.min(lifestyleMatch, 20);
      }

      // Q6: Schools/Taxes (+15)
      if (answers.schoolsTaxes === "very-important") {
        if (n.taxRate < 0.90) score += 15;
        else score -= 5;
      } else if (answers.schoolsTaxes === "not-a-factor") {
        if (n.region === "city") score += 10;
      } else if (answers.schoolsTaxes === "somewhat") {
        if (n.taxRate < 1.00) score += 5;
      }

      // Q7: Vibe (+15)
      if (answers.vibe && n.vibeTags.includes(answers.vibe)) {
        score += 15;
      }

      return { neighborhood: n, score };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── QUIZ QUESTIONS CONFIG ──────────────────────────────────
const QUESTIONS = [
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
    id: "lifestyle",
    label: "Lifestyle",
    question: "Pick the two that matter most to your daily life.",
    type: "multi" as const,
    maxSelect: 2,
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
  const [step, setStep] = useState(0); // 0-6 = questions, 7 = results
  const [answers, setAnswers] = useState<QuizAnswers>({
    budget: null,
    lifeStage: null,
    walkability: 3,
    commute: null,
    lifestyle: [],
    schoolsTaxes: null,
    vibe: null,
  });
  const [results, setResults] = useState<ScoredNeighborhood[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", email: "", phone: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = QUESTIONS.length;

  const canAdvance = useCallback(() => {
    const q = QUESTIONS[step];
    if (!q) return false;
    switch (q.id) {
      case "budget":
        return answers.budget !== null;
      case "lifeStage":
        return answers.lifeStage !== null;
      case "walkability":
        return true; // slider always has a value
      case "commute":
        return answers.commute !== null;
      case "lifestyle":
        return answers.lifestyle.length >= 1;
      case "schoolsTaxes":
        return answers.schoolsTaxes !== null;
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
      // Score and show results
      const scored = scoreNeighborhoods(answers);
      setResults(scored.slice(0, 3));
      setStep(totalSteps); // results step
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
    (value: LifestyleTag, maxSelect: number) => {
      setAnswers((prev) => {
        const current = prev.lifestyle;
        if (current.includes(value)) {
          return { ...prev, lifestyle: current.filter((v) => v !== value) };
        }
        if (current.length >= maxSelect) {
          return { ...prev, lifestyle: [...current.slice(1), value] };
        }
        return { ...prev, lifestyle: [...current, value] };
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

      const payload = {
        firstName: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        source: "landing-page",
        answers: {
          budget: answers.budget,
          lifeStage: answers.lifeStage,
          walkability: answers.walkability,
          commute: answers.commute,
          lifestyle: answers.lifestyle,
          schoolsTaxes: answers.schoolsTaxes,
          vibe: answers.vibe,
        },
        results: {
          top3: results.map((r) => ({
            name: r.neighborhood.name,
            score: r.score,
          })),
        },
        tags: [
          "quiz-lead",
          "source-landing-page",
          ...results.map((r) => r.neighborhood.tagSlug),
          answers.budget ? `budget-${answers.budget}` : null,
          answers.lifeStage ? `stage-${answers.lifeStage}` : null,
        ].filter(Boolean),
      };

      try {
        await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Fail silently - don't block the user experience
        console.error("Quiz API submission failed");
      }

      setFormSubmitted(true);
      setSubmitting(false);
    },
    [formData, answers, results]
  );

  // ─── RENDER: RESULTS ───────────────────────────────────────
  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-paper">
        {/* Header */}
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
            Your Top 3 Richmond Neighborhoods
          </h1>
          <p className="text-teal mb-10">
            Based on your answers, here are the neighborhoods that fit your lifestyle, budget, and priorities.
          </p>

          {/* Top 3 Cards */}
          <div className="space-y-6 mb-12">
            {results.map((r, i) => {
              const n = r.neighborhood;
              const lifeStage = answers.lifeStage || "default";
              const blurb =
                n.whyFitsYou[lifeStage] || n.whyFitsYou.default;

              return (
                <div
                  key={n.id}
                  className="bg-ivory border border-deep-teal/8 rounded-sm p-6 md:p-8"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-gold text-xs font-semibold uppercase tracking-widest">
                        #{i + 1} Match
                      </span>
                      <h2 className="font-display text-xl md:text-2xl font-normal text-deep-teal mt-1">
                        {n.name}
                      </h2>
                      <p className="text-teal-light text-sm">{n.oneLiner}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-2xl font-display font-medium text-gold">
                        {r.score}
                      </span>
                      <span className="text-xs text-teal-light block">
                        /100
                      </span>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 py-4 border-y border-deep-teal/6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Median Price
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {n.medianPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Walk Score
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {n.walkScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Commute
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        {n.commuteMinutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                        Tax Rate
                      </p>
                      <p className="font-semibold text-deep-teal text-sm">
                        ${n.taxRate.toFixed(2)}/100
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

          {/* Comparison Table */}
          <div className="bg-ivory border border-deep-teal/8 rounded-sm p-6 md:p-8 mb-12 overflow-x-auto">
            <h3 className="font-display text-lg text-deep-teal mb-4">
              Side-by-Side Comparison
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-deep-teal/10">
                  <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    &nbsp;
                  </th>
                  {results.map((r) => (
                    <th
                      key={r.neighborhood.id}
                      className="text-left py-2 px-2 font-display font-normal text-deep-teal"
                    >
                      {r.neighborhood.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-deep-teal/80">
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Price
                  </td>
                  {results.map((r) => (
                    <td key={r.neighborhood.id} className="py-2 px-2">
                      {r.neighborhood.medianPrice}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Walk Score
                  </td>
                  {results.map((r) => (
                    <td key={r.neighborhood.id} className="py-2 px-2">
                      {r.neighborhood.walkScore}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Commute
                  </td>
                  {results.map((r) => (
                    <td key={r.neighborhood.id} className="py-2 px-2">
                      {r.neighborhood.commuteMinutes} min
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Tax Rate
                  </td>
                  {results.map((r) => (
                    <td key={r.neighborhood.id} className="py-2 px-2">
                      ${r.neighborhood.taxRate.toFixed(2)}/100
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-deep-teal/6">
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Schools
                  </td>
                  {results.map((r) => (
                    <td key={r.neighborhood.id} className="py-2 px-2">
                      {r.neighborhood.schoolDistrict}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-[10px] uppercase tracking-widest text-teal-light font-semibold">
                    Honest Tradeoff
                  </td>
                  {results.map((r) => (
                    <td
                      key={r.neighborhood.id}
                      className="py-2 px-2 text-xs text-deep-teal/60"
                    >
                      {r.neighborhood.tradeoff}
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
                    Want the full breakdown?
                  </h3>
                  <p className="text-teal-light mb-6 max-w-md mx-auto">
                    Get your personalized neighborhood report with block-level
                    detail, plus the complete Richmond Relocation Guide.
                  </p>
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="bg-gold text-deep-teal px-8 py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors"
                  >
                    Send My Report
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
                    Where should we send it?
                  </h3>
                  <div className="space-y-4">
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
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gold text-deep-teal py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Send My Report"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-deep-teal text-ivory rounded-sm p-8 md:p-10 text-center">
              <h3 className="font-display text-2xl font-light mb-3">
                Check your inbox, {formData.firstName}.
              </h3>
              <p className="text-teal-light mb-6">
                Your personalized neighborhood report and the complete Richmond
                Relocation Guide are on the way.
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
                  budget: null,
                  lifeStage: null,
                  walkability: 3,
                  commute: null,
                  lifestyle: [],
                  schoolsTaxes: null,
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
      {/* Header */}
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
                const isSelected = answers.lifestyle.includes(
                  opt.value as LifestyleTag
                );
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleMultiSelect(
                        opt.value as LifestyleTag,
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
