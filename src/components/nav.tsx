'use client';

import Image from 'next/image';

function scrollToId(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
}

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-teal/95 backdrop-blur-sm border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-3 focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-4"
          aria-label="MAMS Home"
        >
          <Image
            src="/images/mams-logo.png"
            alt="MAMS"
            width={60}
            height={60}
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-full border border-gold/30 object-cover"
          />
          <span className="font-display text-ivory text-lg tracking-tight font-light hidden sm:block">
            Miles a Minute Solutions
          </span>
        </a>
        <div className="flex items-center gap-2 md:gap-8">
          <a
            href="#how-it-works"
            onClick={(e) => scrollToId(e, 'how-it-works')}
            className="nav-link text-sm font-medium tracking-wide hidden md:block"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToId(e, 'about')}
            className="nav-link text-sm font-medium tracking-wide hidden md:block"
          >
            About
          </a>
          <a
            href="#testimonials"
            onClick={(e) => scrollToId(e, 'testimonials')}
            className="nav-link text-sm font-medium tracking-wide hidden md:block"
          >
            Results
          </a>
          <a
            href="/quiz"
            className="cta-secondary px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-sm text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap"
            style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }}
          >
            Take the Quiz
          </a>
          <a
            href="#guide"
            onClick={(e) => scrollToId(e, 'guide')}
            className="cta-primary px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-sm text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap"
          >
            <span className="sm:hidden">Free Guide</span>
            <span className="hidden sm:inline">Get the Free Guide</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
