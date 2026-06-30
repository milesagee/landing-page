import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getHomeDnaByToken, type Candidate } from "@/lib/home-dna-data";
import { FacadeClashCheck } from "@/components/home-dna/FacadeClashCheck";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ contactId: string }>;
type Search = Promise<{ t?: string }>;

export const metadata: Metadata = {
  title: "Your Home DNA | MAMS Buyer Concierge",
  robots: { index: false, follow: false },
};

export default async function HomeDnaPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { contactId } = await params;
  const { t } = await searchParams;

  if (!t) notFound();
  const data = getHomeDnaByToken(contactId, t);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-paper text-deep-teal">
      <header className="bg-deep-teal text-ivory">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <Image
            src="/images/mams-logo.png"
            alt="MAMS"
            width={48}
            height={48}
            className="h-10 w-10 rounded-full border border-gold/30 object-cover"
            priority
          />
          <div>
            <div className="font-display text-ivory text-lg leading-none">MAMS</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gold-dark mt-0.5">
              Buyer Concierge
            </div>
          </div>
        </div>
      </header>

      {/* 1. You-frame hero */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Built for {data.firstName}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight">
          {data.firstName}, your two non-negotiables are the two a search bar can&rsquo;t find.
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.bigTwo.map((b) => (
            <span
              key={b}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-deep-teal bg-gold/20 px-3 py-1.5 rounded-md"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Miles's read */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <div className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
          <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
            <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
              Miles&rsquo;s read on your search
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-base text-ivory/90 leading-relaxed">{data.milesRead}</p>
          </div>
        </div>
      </section>

      {/* 2. Home DNA card */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="px-6 sm:px-8 py-4 bg-deep-teal/[0.04] border-b border-deep-teal/10 flex items-baseline justify-between gap-4 flex-wrap">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold">
              Your Home DNA
            </p>
            <p className="text-xs text-deep-teal/55">
              {data.budgetLabel} &middot; {data.configLabel}
            </p>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-4">
            {data.dnaPoints.map((p) => (
              <div key={p.label} className="border-l-2 border-gold/40 pl-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
                  {p.label}
                </p>
                <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">{p.value}</p>
              </div>
            ))}
            <div className="border-l-2 border-gold/40 pl-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
                The one hard line
              </p>
              <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
                {data.facadeDealbreaker}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The MAMS edge: Natural Light Score */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          The edge nobody else gives you
        </p>
        <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-deep-teal/10">
            <h2 className="font-display text-2xl text-deep-teal leading-tight mb-2">
              Natural Light Score
            </h2>
            <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
              {data.lightScoreIntro}
            </p>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-4">
            {data.lightFactors.map((f, i) => (
              <div key={f.name} className="flex gap-4">
                <span className="font-display text-lg text-gold-dark leading-none mt-0.5 w-5 shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-base text-deep-teal leading-tight">{f.name}</p>
                  <p className="text-sm text-deep-teal/75 leading-relaxed mt-0.5">{f.topMark}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 sm:px-8 py-5 bg-gold/10 border-t border-gold/20">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
              The veto that protects you
            </p>
            <p className="text-sm text-deep-teal/85 leading-relaxed">{data.lightVeto}</p>
          </div>
        </div>
      </section>

      {/* 3b. The MAMS edge: Facade Clash Check + calibration proof */}
      <section className="max-w-3xl mx-auto px-6 pb-10 space-y-4">
        <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-deep-teal/10">
            <h2 className="font-display text-2xl text-deep-teal leading-tight mb-2">
              Facade Clash Check
            </h2>
            <p className="text-sm sm:text-base text-deep-teal/85 leading-relaxed">
              {data.facadeIntro}
            </p>
          </div>
          <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-2 gap-4">
            {data.facadeRules.map((r) => (
              <div
                key={r.label}
                className={`rounded-lg p-4 ${
                  r.verdict === "FLAG"
                    ? "bg-red-50 ring-1 ring-red-100"
                    : "bg-emerald-50 ring-1 ring-emerald-100"
                }`}
              >
                <p
                  className={`text-[10px] uppercase tracking-[0.16em] font-bold mb-1 ${
                    r.verdict === "FLAG" ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {r.label}
                </p>
                <p className="text-sm text-deep-teal/85 leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Calibration proof (interactive, Tupper Branch FLAG) */}
        <FacadeClashCheck examples={data.facadeExamples} />
      </section>

      {/* 4. Area Intelligence */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
          Area intelligence
        </p>
        <div className="bg-deep-teal text-ivory rounded-lg p-6 sm:p-8 mb-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold font-semibold mb-2">
            The verdict on your Big Two
          </p>
          <p className="text-sm sm:text-base text-ivory/90 leading-relaxed">{data.verdict}</p>
        </div>

        <div className="space-y-4">
          {data.areaReads.map((a) => (
            <div
              key={a.name}
              className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden"
            >
              <div className="flex items-baseline justify-between gap-4 px-6 sm:px-8 py-4 bg-deep-teal/[0.04] border-b border-deep-teal/10">
                <h3 className="font-display text-xl text-deep-teal leading-tight">{a.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark font-semibold whitespace-nowrap">
                  {a.rankLabel}
                </span>
              </div>
              <div className="px-6 sm:px-8 py-5 space-y-4">
                <Read label="What your budget gets" body={a.budgetReality} />
                <Read
                  label={`Facade match (your clash: ${a.facadePrevalence.toLowerCase()})`}
                  body={a.facadeRead}
                />
                <Read label="The light read" body={a.lightRead} />
                <Read label="Hardwood and kitchens" body={a.renoRead} />
                <Read label="Getting around" body={a.livabilityRead} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4b. Scored candidate shortlist (renders only when PC scoring populated it) */}
      {data.candidates.length > 0 &&
        (() => {
          const cleared = data.candidates.filter((c) => c.cleared);
          const watch = data.candidates.filter((c) => !c.cleared);
          return (
            <section className="max-w-3xl mx-auto px-6 pb-10">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
                Your scored shortlist
              </p>
              <div className="bg-deep-teal text-ivory rounded-lg p-6 sm:p-8 mb-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold font-semibold mb-2">
                  14 screened &middot; {cleared.length} cleared &middot; {watch.length} on watch
                </p>
                <p className="text-sm sm:text-base text-ivory/90 leading-relaxed">
                  {data.candidatesIntro}
                </p>
              </div>

              {cleared.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-display text-xl text-deep-teal">Cleared for your tour list</h3>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-1 rounded-md font-bold">
                      Light 7+
                    </span>
                  </div>
                  <div className="space-y-5">
                    {cleared.map((c) => (
                      <CandidateCard key={c.address} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {watch.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl text-deep-teal">On your watch list</h3>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-gold-dark bg-gold/15 ring-1 ring-gold/30 px-2.5 py-1 rounded-md font-bold">
                      One point short
                    </span>
                  </div>
                  <p className="text-sm text-deep-teal/70 leading-relaxed mb-4">
                    Strong on everything but the light, so they are not tour-ready yet. I am tracking each one in case the price moves or a better photo set tells a different story.
                  </p>
                  <div className="space-y-5">
                    {watch.map((c) => (
                      <CandidateCard key={c.address} c={c} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })()}

      {/* What happens next */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl text-deep-teal mb-3">What happens next</h2>
          <ol className="space-y-3 text-sm sm:text-base text-deep-teal/80 leading-relaxed list-decimal pl-5">
            <li>
              I run every home that fits your range through the Light Score and the Facade Check
              before it ever reaches you. You only see 7-and-up.
            </li>
            <li>
              When one earns a tour, you get the score, the facade verdict, and the honest trade-off
              in plain language. No surprises at the curb.
            </li>
            <li>
              Reply to the email this came in on with the area you want to start in, or the home that
              caught your eye. I hold the read on all of it.
            </li>
          </ol>
        </div>
      </section>

      {/* Sources */}
      {data.sources.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <details className="bg-white rounded-lg border border-deep-teal/10 p-4">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-deep-teal/60 font-semibold hover:text-deep-teal">
              Sources ({data.sources.length})
            </summary>
            <ul className="mt-3 space-y-2 text-xs text-deep-teal/70 leading-relaxed">
              {data.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gold-dark"
                  >
                    {s.description}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <footer className="border-t border-deep-teal/10 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
          <p className="mb-2">
            Built for {data.firstName}. The link is tied to you, so please keep it to yourself.
          </p>
          <p>
            Miles direct:{" "}
            <a href="mailto:miles@mamsnow.com" className="underline hover:text-gold-dark">
              miles@mamsnow.com
            </a>{" "}
            &middot; Miles Agee, Realtor, OneSouth Realty Team powered by Samson Properties.
          </p>
        </div>
      </footer>
    </main>
  );
}

// Small labeled paragraph used inside each area card.
function Read({ label, body }: { label: string; body: string }) {
  return (
    <div className="border-l-2 border-gold/40 pl-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-1">
        {label}
      </p>
      <p className="text-sm text-deep-teal/80 leading-relaxed">{body}</p>
    </div>
  );
}

// Light Score badge. Tiered color: 9-10 reads as exceptional, 7-8 as strong.
// Only 7+ homes make the shortlist, so the low tier rarely shows, but it is
// handled honestly when a teaching example is included.
function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 9
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 7
        ? "bg-gold/15 text-gold-dark ring-gold/30"
        : "bg-amber-50 text-amber-700 ring-amber-200";
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ${tier}`}>
      <span className="font-display text-2xl leading-none">{score}</span>
      <div className="leading-tight">
        <span className="block text-[15px] font-display leading-none">/10</span>
        <span className="block text-[9px] uppercase tracking-[0.14em] font-semibold opacity-80">
          Light
        </span>
      </div>
    </div>
  );
}

// One scored candidate. Photo is rendered as a background layer (no next/image
// domain config needed) with a teal gradient + multiply tint per the brand
// treatment; falls back to a branded band when no photo is available.
function CandidateCard({ c }: { c: Candidate }) {
  const flagged = c.facadeVerdict === "FLAG";
  const meta = [
    c.beds != null ? `${c.beds} bed` : null,
    c.baths != null ? `${c.baths} bath` : null,
    c.sqft != null ? `${c.sqft.toLocaleString()} sqft` : null,
    c.yearBuilt != null ? `Built ${c.yearBuilt}` : null,
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-lg border border-deep-teal/10 overflow-hidden shadow-[0_18px_40px_-24px_rgba(0,63,63,0.45)]">
      {/* Photo band */}
      <div className="relative h-44 bg-deep-teal">
        {c.photoUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90"
            style={{ backgroundImage: `url(${c.photoUrl})` }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/85 via-deep-teal/20 to-transparent" />
        {c.rankLabel && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.16em] font-bold text-deep-teal bg-gold px-2.5 py-1 rounded-md">
            {c.rankLabel}
          </span>
        )}
        <span className="absolute top-3 right-3 text-[9px] uppercase tracking-[0.14em] font-semibold text-ivory/90 bg-deep-teal/60 px-2.5 py-1 rounded-md">
          {c.areaLabel}
        </span>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <h3 className="font-display text-xl text-ivory leading-tight drop-shadow-sm">
            {c.address}
          </h3>
          <span className="font-display text-xl text-gold whitespace-nowrap drop-shadow-sm">
            ${c.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 sm:px-6 py-5 space-y-4">
        {meta.length > 0 && (
          <p className="text-xs text-deep-teal/60 font-medium tracking-wide">
            {meta.join("  ·  ")}
          </p>
        )}

        {/* Scores row */}
        <div className="flex items-stretch gap-3">
          <ScoreBadge score={c.lightScore} />
          <div
            className={`flex items-center rounded-lg px-3 py-2 ring-1 ${
              flagged
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}
          >
            <div className="leading-tight">
              <span className="block font-display text-base leading-none">
                Facade {c.facadeVerdict}
              </span>
              <span className="block text-[9px] uppercase tracking-[0.14em] font-semibold opacity-80 mt-0.5">
                Your hard line
              </span>
            </div>
          </div>
        </div>

        <Read label="The light read" body={c.lightReason} />
        <Read label="The facade read" body={c.facadeReason} />

        <a
          href={c.listingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-semibold text-deep-teal/70 hover:text-gold-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          View the listing
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </div>
  );
}
