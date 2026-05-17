export interface V2Highlight {
  anchor_name: string;
  address?: string;
  walking_minutes?: number;
  tag?: string;
  headline?: string;
  dive?: string;
}

export interface V2Property {
  slug: string;
  name: string;
  address?: string;
  neighborhood?: string;
  district?: string;
  managementCompany?: string;
  insiderRating?: number;
  from_price?: number;
  beds?: string;
  insiderUrl?: string;
  vibes_paragraph?: string;
  highlights?: V2Highlight[];
  addendum?: {
    characterSummary?: string;
    sentimentSummary?: string;
    leaseTrapRedFlags?: string[];
  } | null;
  cross_references?: {
    relocation_guide_section?: string | null;
    mamsnow_seo_page?: string | null;
  } | null;
}

export interface V2Payload {
  version: number;
  generated_at?: string;
  lead?: { firstName?: string };
  property_count?: number;
  properties: V2Property[];
}

export function parseV2(jsonStr?: string): V2Payload | null {
  if (!jsonStr) return null;
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.version === 2 && Array.isArray(parsed.properties)) return parsed as V2Payload;
    return null;
  } catch {
    return null;
  }
}

export function formatPrice(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "?";
  return "$" + Math.round(n).toLocaleString();
}

export function PropertyCardV2({ property }: { property: V2Property }) {
  const hasHighlights = property.highlights && property.highlights.length > 0;
  const hasVibes = !!property.vibes_paragraph;
  const hasAddendum = property.addendum && (property.addendum.characterSummary || property.addendum.sentimentSummary);
  const hasCrossRefs = property.cross_references && (property.cross_references.relocation_guide_section || property.cross_references.mamsnow_seo_page);
  const traps = property.addendum?.leaseTrapRedFlags || [];

  return (
    <article className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8 mb-6 shadow-sm">
      <header className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-display text-xl sm:text-2xl text-deep-teal leading-tight">
            {property.name}
          </h3>
          {property.address ? (
            <p className="text-xs text-deep-teal/60 mt-1">{property.address}</p>
          ) : null}
          <p className="text-xs text-deep-teal mt-2">
            {property.neighborhood}
            {property.managementCompany ? <> · {property.managementCompany}</> : null}
          </p>
        </div>
        <div className="text-right shrink-0">
          {property.insiderRating != null ? (
            <div className="font-display text-lg font-bold text-gold-dark whitespace-nowrap">
              ★ {property.insiderRating}
            </div>
          ) : null}
          <div className="text-xs text-deep-teal/70 mt-1 whitespace-nowrap">
            From {formatPrice(property.from_price)}
          </div>
          {property.beds ? (
            <div className="text-xs text-deep-teal/60 mt-0.5 whitespace-nowrap">
              Beds: {property.beds}
            </div>
          ) : null}
        </div>
      </header>

      {hasVibes ? (
        <p className="text-[15px] text-deep-teal leading-relaxed mt-4">
          {property.vibes_paragraph}
        </p>
      ) : null}

      {hasHighlights ? (
        <section className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.15em] text-gold-dark font-semibold mb-2">
            How life looks here for you
          </p>
          <ul className="space-y-2">
            {property.highlights!.map((h, i) => (
              <li key={i}>
                <details className="group rounded-md border border-deep-teal/10 bg-paper/40 open:bg-paper">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 select-none">
                    <span className="text-sm sm:text-[15px] text-deep-teal font-medium">
                      <span className="text-gold-dark mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                      {h.headline || h.anchor_name}
                    </span>
                    <span className="text-xs text-deep-teal/60 whitespace-nowrap">
                      {h.walking_minutes != null ? `${h.walking_minutes} min walk` : ""}
                    </span>
                  </summary>
                  {h.dive ? (
                    <div className="px-4 pb-4 pt-1 text-sm text-deep-teal/85 leading-relaxed">
                      <p>{h.dive}</p>
                      <p className="mt-2 text-xs text-deep-teal/55">
                        {h.anchor_name}{h.address ? <> · {h.address}</> : null}
                      </p>
                    </div>
                  ) : null}
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasAddendum ? (
        <section className="mt-5 border-t border-deep-teal/10 pt-4 grid sm:grid-cols-2 gap-4">
          {property.addendum?.characterSummary ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-deep-teal/55 font-semibold mb-1">
                Character
              </p>
              <p className="text-sm text-deep-teal/85 leading-relaxed">
                {property.addendum.characterSummary}
              </p>
            </div>
          ) : null}
          {property.addendum?.sentimentSummary ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-deep-teal/55 font-semibold mb-1">
                What residents say
              </p>
              <p className="text-sm text-deep-teal/85 leading-relaxed">
                {property.addendum.sentimentSummary}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {traps.length > 0 ? (
        <section className="mt-5 rounded-md bg-gold/10 border border-gold-dark/20 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold-dark font-semibold mb-2">
            Worth knowing before you sign
          </p>
          <ul className="text-sm text-deep-teal/85 space-y-1.5 list-disc pl-5">
            {traps.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      ) : null}

      {hasCrossRefs ? (
        <section className="mt-5 border-t border-deep-teal/10 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {property.cross_references?.relocation_guide_section ? (
            <a
              href="/guide"
              className="text-deep-teal underline decoration-gold-dark/40 hover:decoration-gold-dark"
            >
              {property.neighborhood} in the MAMS Relocation Guide →
            </a>
          ) : null}
          {property.cross_references?.mamsnow_seo_page ? (
            <a
              href={property.cross_references.mamsnow_seo_page}
              className="text-deep-teal underline decoration-gold-dark/40 hover:decoration-gold-dark"
            >
              Read the full {property.neighborhood} guide →
            </a>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
