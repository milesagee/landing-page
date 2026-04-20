// Personalized Richmond Relocation Guide map generator.
// Takes quiz answers + top 6 zones and produces a three-block HTML snippet
// that renders inside the quiz results email template.
//
// Block 1: Your match chapters (top 6 zones mapped to guide chapters)
// Block 2: Focus based on your answers (dynamic callouts from answer patterns)
// Block 3: Don't skip (universal must-reads)

interface QuizAnswersInput {
  lifeStage: string | null;
  budget: string | null;
  setting: string | null;
  homeStyle: string | null;
  walkability: number;
  commute: string | null;
  schoolsTaxes: string | null;
  lifestyle: string[];
  weeknight: string[];
  vibe: string | null;
}

interface TopZoneInput {
  id: string;
  name: string;
  score: number;
  region: "city" | "suburb" | "outer";
}

// Maps each quiz zone id to its chapter(s) in the relocation guide.
const ZONE_TO_CHAPTER: Record<string, string> = {
  "fan-museum": "The Fan & Museum District",
  "church-hill-east": "Church Hill",
  "scotts-jackson": "Scott's Addition & Jackson Ward",
  "southside-city": "Manchester",
  "northside-city": "Laburnum Park & Northside",
  "carytown-near-west": "Byrd Park & Carytown",
  "west-end-city": "More City Neighborhoods",
  "short-pump": "Short Pump & Glen Allen",
  "glen-allen": "Short Pump & Glen Allen",
  "river-road": "Short Pump & Glen Allen",
  "midlothian": "Midlothian & Moseley",
  "moseley": "Midlothian & Moseley",
  "southern-chesterfield": "Midlothian & Moseley",
  "mechanicsville": "Mechanicsville & Hanover",
  "ashland": "Mechanicsville & Hanover",
  "goochland": "Exploring Further Out",
  "powhatan": "Exploring Further Out",
  "new-kent": "Exploring Further Out",
};

function chapterFor(zoneId: string): string {
  return ZONE_TO_CHAPTER[zoneId] || "More City Neighborhoods";
}

// Shared inline styles kept consistent with email-template.html.
const GOLD = "#D4AF37";
const DEEP_TEAL = "#003F3F";
const TEAL = "#005F5F";
const BODY_TEAL = "#2a3a3a";
const MUTED = "#888888";

function eyebrow(label: string): string {
  return `<p style="margin:0 0 12px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;color:${TEAL};">${label}</p>`;
}

function callout(text: string): string {
  return `<tr><td style="border-left:2px solid ${GOLD};padding:4px 0 4px 16px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${BODY_TEAL};">${text}</td></tr><tr><td style="height:12px;line-height:12px;font-size:12px;">&nbsp;</td></tr>`;
}

function matchRow(rank: number, zoneName: string, chapter: string): string {
  return `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #ece8de;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="32" valign="top" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${GOLD};font-weight:600;">${rank}.</td>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:${DEEP_TEAL};">
          <strong style="color:${DEEP_TEAL};">${zoneName}</strong><br>
          <span style="color:${MUTED};font-size:12px;">Read: &ldquo;${chapter}&rdquo; chapter</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function buildMatchesBlock(top6: TopZoneInput[]): string {
  const rows = top6
    .map((m, i) => matchRow(i + 1, m.name, chapterFor(m.id)))
    .join("");

  return `
${eyebrow("Start with your matches")}
<p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${BODY_TEAL};">
  Your top 6 parts of town each have a dedicated chapter in the guide. Read them in order. Your best fit is #1.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
  ${rows}
</table>`.trim();
}

// Generates 3-5 dynamic focus callouts based on answer patterns.
function buildFocusCallouts(answers: QuizAnswersInput, top6: TopZoneInput[]): string[] {
  const callouts: string[] = [];
  const regions = new Set(top6.map((t) => t.region));
  const hasCity = regions.has("city");
  const hasSuburb = regions.has("suburb");
  const hasOuter = regions.has("outer");

  // Schools / taxes priority
  if (answers.schoolsTaxes === "very-important") {
    if (hasSuburb || hasOuter) {
      callouts.push(
        `<strong>You flagged schools and taxes as very important.</strong> Read &ldquo;Why the Suburbs Win for Most Families&rdquo; and the Virginia Tax Guide before anything else. Most of your top 6 sit in counties with lower rates than the city.`
      );
    } else {
      callouts.push(
        `<strong>You flagged schools and taxes as very important.</strong> The &ldquo;Schools in Richmond City&rdquo; chapter is required reading. Your top 6 are all city picks, so use that chapter to gut-check which districts actually line up with what you need.`
      );
    }
  }

  // Life stage specifics
  if (answers.lifeStage === "family-young" || answers.lifeStage === "family-teens") {
    callouts.push(
      `<strong>You're moving as a family.</strong> The &ldquo;Best Parks in Richmond City&rdquo; chapter and the &ldquo;Schools&rdquo; section should be on your shortlist. If your top picks include suburbs, the &ldquo;Suburban Comparison&rdquo; side-by-side is the fastest way to see which county fits.`
    );
  } else if (answers.lifeStage === "empty-nester") {
    callouts.push(
      `<strong>You're downsizing or empty-nesting.</strong> Read the &ldquo;Cost of Living Breakdown&rdquo; and &ldquo;Healthcare &amp; Hospitals&rdquo; chapters. Richmond's healthcare system punches above its weight, and cost of living here is one of the reasons people move.`
    );
  } else if (answers.lifeStage === "remote-relocator") {
    callouts.push(
      `<strong>You're relocating for work.</strong> The &ldquo;Your Relocation Checklist,&rdquo; &ldquo;Virginia Tax Guide,&rdquo; and &ldquo;The Personal Property Tax&rdquo; chapters will save you the most surprises. Read them before you pick a timeline.`
    );
  } else if (answers.lifeStage === "single-pro" || answers.lifeStage === "couple-no-kids") {
    callouts.push(
      `<strong>You're moving light.</strong> The &ldquo;Richmond Food &amp; Drink Guide&rdquo; and &ldquo;Annual Events Calendar&rdquo; are where the city earns its reputation. Your weekends will look like these chapters.`
    );
  }

  // Commute signal
  if (answers.commute === "under-10" || answers.commute === "10-20") {
    callouts.push(
      `<strong>You want a short commute.</strong> Read &ldquo;Transportation &amp; Getting Around&rdquo; before locking a neighborhood. Richmond's traffic is gentle compared to most metros, but the difference between a 10-minute and a 25-minute commute here is real.`
    );
  }

  // Setting specifics
  if (answers.setting === "urban-core" && hasCity) {
    callouts.push(
      `<strong>You're drawn to the city.</strong> &ldquo;The James River: Richmond's Greatest Asset&rdquo; chapter is the single best argument for why urban life here isn't a compromise. It's why most locals never leave.`
    );
  } else if (answers.setting === "rural-land" || answers.setting === "new-suburb") {
    callouts.push(
      `<strong>You want space.</strong> &ldquo;Exploring Further Out&rdquo; covers Goochland, Powhatan, and New Kent. Lower taxes, more land, real distance from the city without losing it entirely.`
    );
  }

  // Lifestyle tag signals
  const lifestyleSet = new Set(answers.lifestyle);
  if (lifestyleSet.has("restaurants-nightlife") || lifestyleSet.has("breweries-food")) {
    if (!callouts.some((c) => c.includes("Food &amp; Drink Guide"))) {
      callouts.push(
        `<strong>Food and drink matter to you.</strong> The &ldquo;Richmond Food &amp; Drink Guide&rdquo; chapter is your shortcut. Scott's Addition alone has more breweries per square mile than most cities twice this size.`
      );
    }
  }
  if (lifestyleSet.has("parks-trails")) {
    callouts.push(
      `<strong>You want outdoor access.</strong> Read &ldquo;The James River&rdquo; and &ldquo;Best Parks in Richmond City&rdquo; back to back. Richmond has Class IV whitewater inside the city limits. That's not normal.`
    );
  }

  // Vibe-based callouts (only if we haven't covered the ground already)
  if (
    answers.vibe === "farmers-market-brewery-dinner" &&
    !callouts.some((c) => c.includes("Food &amp; Drink Guide"))
  ) {
    callouts.push(
      `<strong>Your Saturday is farmers market to brewery to dinner.</strong> The &ldquo;Richmond Food &amp; Drink Guide&rdquo; and &ldquo;Annual Events Calendar&rdquo; are where you'll find your rhythm.`
    );
  }
  if (answers.vibe === "soccer-costco-backyard" && hasSuburb) {
    if (!callouts.some((c) => c.includes("Suburban Comparison"))) {
      callouts.push(
        `<strong>Your Saturday is soccer, Costco, and the backyard.</strong> &ldquo;Suburban Comparison: Every Area Side by Side&rdquo; is the chapter to dog-ear. It compares schools, taxes, and commute across every suburb your top 6 touched.`
      );
    }
  }

  // Budget signal
  if (answers.budget === "under-400k") {
    callouts.push(
      `<strong>You're in the under-$400K band.</strong> The &ldquo;Cost of Living Breakdown&rdquo; chapter and &ldquo;More City Neighborhoods&rdquo; deep-dives are where you'll find the zones that still work at your price point.`
    );
  } else if (answers.budget === "750k-plus") {
    callouts.push(
      `<strong>You're shopping above $750K.</strong> Pay close attention to &ldquo;The Fan &amp; Museum District,&rdquo; &ldquo;River Road Corridor,&rdquo; and &ldquo;Short Pump &amp; Glen Allen&rdquo; chapters. That's where Richmond's upper-tier inventory actually lives.`
    );
  }

  // Cap at 5 so the block doesn't dominate the email
  return callouts.slice(0, 5);
}

function buildFocusBlock(answers: QuizAnswersInput, top6: TopZoneInput[]): string {
  const items = buildFocusCallouts(answers, top6);
  if (items.length === 0) {
    // Fallback content if no rules fired (shouldn't happen with 10 answers, but safe)
    items.push(
      `<strong>Read the guide front to back.</strong> Every chapter was written to give you the unvarnished picture. The chapters your top 6 point to are the ones to dog-ear.`
    );
  }
  const rows = items.map(callout).join("");

  return `
${eyebrow("Then focus here, based on what you told us")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
  ${rows}
</table>`.trim();
}

function buildMustReadsBlock(): string {
  const items = [
    `<strong>Virginia Tax Guide + The Personal Property Tax.</strong> Virginia taxes your car every year. It surprises every relocator. Read this before you budget.`,
    `<strong>5 Steps to Finding Your Perfect Place.</strong> The closing chapter. It's the playbook for turning your top 6 into one actual address.`,
  ];
  const rows = items.map(callout).join("");

  return `
${eyebrow("Don't skip these, no matter what")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
  ${rows}
</table>`.trim();
}

// Main entry. Returns the three-block HTML snippet ready to drop into the
// quiz email template's {{contact.quiz_guide_map_html}} merge tag.
export function buildGuideMapHtml(
  answers: QuizAnswersInput,
  top6: TopZoneInput[]
): string {
  return [
    buildMatchesBlock(top6),
    buildFocusBlock(answers, top6),
    buildMustReadsBlock(),
  ].join("\n\n");
}

export { ZONE_TO_CHAPTER };
