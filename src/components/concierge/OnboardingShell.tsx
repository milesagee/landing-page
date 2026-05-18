import Image from "next/image";

export function OnboardingHeader({ role }: { role: "Chosen" | "Wendy" }) {
  return (
    <header className="bg-deep-teal text-ivory">
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
              Walkthrough · {role}
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.15em] text-gold-dark/80 hidden sm:inline">
          ~15 min · self-paced
        </span>
      </div>
    </header>
  );
}

export function OnboardingSection({
  number,
  total,
  title,
  children,
}: {
  number: number;
  total: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-8">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[10px] uppercase tracking-[0.15em] text-gold-dark font-semibold whitespace-nowrap">
          {number} of {total}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl text-deep-teal leading-tight">
          {title}
        </h2>
      </div>
      <div className="bg-white rounded-lg border border-deep-teal/10 p-6 sm:p-8 text-[15px] text-deep-teal/90 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-deep-teal text-ivory hover:bg-deep-teal/90 px-4 py-2 rounded-md text-sm font-medium transition mt-2"
    >
      {label} →
    </a>
  );
}

export function OnboardingHero({
  greeting,
  pitch,
  bookmarkUrl,
  bookmarkLabel,
}: {
  greeting: string;
  pitch: string;
  bookmarkUrl: string;
  bookmarkLabel: string;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 pt-10">
      <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold mb-3">
        For your eyes only
      </p>
      <h1 className="font-display text-3xl sm:text-4xl text-deep-teal leading-tight mb-3">
        {greeting}
      </h1>
      <p className="text-base text-deep-teal/80 leading-relaxed">{pitch}</p>
      <div className="mt-5 p-4 rounded-md bg-deep-teal text-ivory">
        <div className="text-[10px] uppercase tracking-[0.15em] text-gold-dark font-semibold mb-1">
          {bookmarkLabel}
        </div>
        <a
          href={bookmarkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ivory underline decoration-gold-dark/40 hover:decoration-gold break-all"
        >
          {bookmarkUrl}
        </a>
      </div>
    </section>
  );
}

export function OnboardingFooter() {
  return (
    <footer className="border-t border-deep-teal/10 bg-paper mt-10">
      <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-deep-teal/60 leading-relaxed">
        <p className="mb-2">
          Internal MAMS reference. Don&rsquo;t forward this page outside the team.
        </p>
        <p>
          Anything missing or unclear? Tell Miles and the next pass adds it. The whole tool gets sharper the more you use it.
        </p>
      </div>
    </footer>
  );
}
