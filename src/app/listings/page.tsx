'use client';

import { useState } from 'react';
import Image from 'next/image';
import Nav from '@/components/nav';
import { Marquee } from '@/components/ui/3d-testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import {
  activeListings,
  comingSoonListings,
  listings,
  formatPrice,
  bathLabel,
  type Listing,
} from '@/lib/listings';

const reviewImgs = Array.from(
  { length: 26 },
  (_, i) => `/images/testimonials/testimonial-${String(i + 1).padStart(2, '0')}.png`,
);

function ReviewCard({ img }: { img: string }) {
  return (
    <Card className="w-96 bg-paper border-deep-teal/6" style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.04), 0 8px 24px rgba(0,63,63,0.03)' }}>
      <CardContent className="p-3">
        <div className="rounded-lg overflow-hidden">
          <Image
            src={img}
            alt="Verified client review from Zillow"
            width={380}
            height={180}
            className="w-full h-auto object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ListingCard({ l, onAsk }: { l: Listing; onAsk: (slug: string) => void }) {
  return (
    <div
      className="group bg-ivory border border-deep-teal/8 rounded-sm overflow-hidden flex flex-col w-full max-w-md"
      style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.05), 0 18px 44px rgba(0,63,63,0.08)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={l.hero}
          alt={`${l.address}, ${l.city} ${l.state}`}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/55 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-sm text-[11px] font-bold tracking-[0.12em] uppercase bg-gold text-deep-teal">
          {l.badge}
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-3xl font-light text-ivory leading-none" style={{ fontVariationSettings: "'opsz' 96" }}>
            {formatPrice(l.price)}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="font-display text-xl text-deep-teal italic leading-tight mb-1" style={{ fontVariationSettings: "'opsz' 40" }}>
          {l.address}
        </p>
        <p className="text-sm text-deep-teal/55 font-medium mb-4">
          {l.city}, {l.state}
        </p>

        <div className="flex items-center gap-4 text-sm text-deep-teal/70 font-medium mb-4 pb-4 border-b border-deep-teal/8">
          <span>{l.beds} bed</span>
          <span className="w-px h-4 bg-deep-teal/15" />
          <span>{bathLabel(l.baths)} bath</span>
          <span className="w-px h-4 bg-deep-teal/15" />
          <span>{l.sqft.toLocaleString('en-US')} sqft</span>
        </div>

        <p className="text-sm text-deep-teal/70 leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
          {l.hook}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {l.angles.map((a) => (
            <span key={a} className="px-3 py-1.5 bg-deep-teal/5 border border-deep-teal/8 rounded-sm text-xs font-medium text-deep-teal/70">
              {a}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {l.breakdownUrl && (
            <a
              href={l.breakdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary w-full text-center px-6 py-3.5 rounded-sm text-sm font-semibold tracking-wide"
            >
              View full breakdown
            </a>
          )}
          <button
            type="button"
            onClick={() => onAsk(l.slug)}
            className="cta-secondary w-full text-center px-6 py-3.5 rounded-sm text-sm font-medium tracking-wide"
            style={{ borderColor: 'rgba(0,63,63,0.18)', color: '#003F3F' }}
          >
            Ask about this home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [selectedSlug, setSelectedSlug] = useState('');
  const active = activeListings();
  const coming = comingSoonListings();
  const formOptions = listings.map((l) => ({ slug: l.slug, label: `${l.address}, ${l.city}` }));

  const askAbout = (slug: string) => {
    setSelectedSlug(slug);
    const el = document.getElementById('inquire');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#inquire');
    }
  };

  const scrollToInquire = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('inquire');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#inquire');
    }
  };

  return (
    <main className="bg-paper">
      <Nav />
      <div className="h-[72px] sm:h-[88px]" />

      {/* HERO */}
      <section className="bg-deep-teal text-ivory pt-16 pb-20 md:pt-20 md:pb-28 px-6 relative grain overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ top: '-15%', right: '-10%', width: '520px', height: '520px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
          <div className="absolute rounded-full" style={{ bottom: '-25%', left: '-10%', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(0,95,95,0.4) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-[0.22em] uppercase text-gold mb-5">Active Listings</p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Your next move,<br /><em className="text-gold">fully broken down.</em>
          </h1>
          <p className="text-lg text-ivory/75 leading-relaxed max-w-2xl mx-auto mb-4" style={{ lineHeight: '1.7' }}>
            Most agents post a listing and wait. Every home here gets its own page, its own numbers, and a clear answer to why it is worth your move.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-12">
            <a href="#inquire" onClick={scrollToInquire} className="cta-primary px-9 py-4 rounded-sm text-base font-semibold tracking-wide inline-block">
              Tell me what you&apos;re looking for
            </a>
            <a href="/quiz" className="cta-secondary px-9 py-4 rounded-sm text-base font-medium tracking-wide inline-block" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
              Not sure where to look? Take the quiz
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-ivory/10 max-w-xl mx-auto">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-gold"><CountUp end={60} suffix="+" duration={2500} delay={300} /></p>
              <p className="text-[11px] text-ivory/50 font-medium tracking-wide uppercase mt-1">Families Served</p>
            </div>
            <div className="w-px h-10 bg-ivory/15" />
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-gold"><CountUp end={23} prefix="$" suffix="M+" duration={2500} delay={500} /></p>
              <p className="text-[11px] text-ivory/50 font-medium tracking-wide uppercase mt-1">In Transactions</p>
            </div>
            <div className="w-px h-10 bg-ivory/15" />
            <div>
              <p className="font-display text-2xl sm:text-3xl font-light text-gold"><CountUp end={5} suffix=".0" duration={1500} delay={700} /></p>
              <p className="text-[11px] text-ivory/50 font-medium tracking-wide uppercase mt-1">Client Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE LISTINGS */}
      <section className="bg-paper py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">On the market now</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight" style={{ fontVariationSettings: "'opsz' 96" }}>
              {active.length === 1 ? 'The home that is live right now.' : 'Homes that are live right now.'}
            </h2>
          </div>

          {active.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {active.map((l) => (
                <ListingCard key={l.slug} l={l} onAsk={askAbout} />
              ))}
            </div>
          ) : (
            <p className="text-center text-deep-teal/55">Fresh listings are loading into the pipeline. Get on the early-access list below.</p>
          )}
        </div>
      </section>

      {/* COMING SOON / EARLY ACCESS (second CTA into inquire) */}
      <section className="bg-deep-teal text-ivory py-20 md:py-24 px-6 relative grain overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ top: '-20%', right: '15%', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">In the pipeline</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight tracking-tight mb-3" style={{ fontVariationSettings: "'opsz' 96" }}>
              The best homes move before they hit Zillow.
            </h2>
            <p className="text-base text-ivory/70 max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
              New listings get worked here first. Tell me what you want and you hear about the right one before the crowd does.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {coming.length > 0 ? (
              coming.map((l) => (
                <div key={l.slug} className="bg-ivory/5 border border-ivory/12 rounded-sm p-6">
                  <span className="inline-block px-3 py-1 rounded-sm text-[11px] font-bold tracking-[0.12em] uppercase bg-gold/20 text-gold mb-3">{l.badge}</span>
                  <p className="font-display text-xl text-ivory mb-1">{l.city}, {l.state}</p>
                  <p className="text-sm text-ivory/60">{l.hook}</p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-ivory/5 border border-ivory/12 rounded-sm p-6">
                  <span className="inline-block px-3 py-1 rounded-sm text-[11px] font-bold tracking-[0.12em] uppercase bg-gold/20 text-gold mb-3">Coming Soon</span>
                  <p className="font-display text-xl text-ivory mb-1">Greater Richmond</p>
                  <p className="text-sm text-ivory/60">New buyer and seller representations land here first. Be the early call.</p>
                </div>
                <div className="bg-ivory/5 border border-ivory/12 rounded-sm p-6">
                  <span className="inline-block px-3 py-1 rounded-sm text-[11px] font-bold tracking-[0.12em] uppercase bg-gold/20 text-gold mb-3">Coming Soon</span>
                  <p className="font-display text-xl text-ivory mb-1">Northern Virginia</p>
                  <p className="text-sm text-ivory/60">Off-market and pre-list opportunities, shared with the people on the list.</p>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-10">
            <a href="#inquire" onClick={scrollToInquire} className="cta-primary px-9 py-4 rounded-sm text-base font-semibold tracking-wide inline-block">
              Get on the early-access list
            </a>
          </div>
        </div>
      </section>

      {/* SOLD PROOF (reused reviews marquee) */}
      <section className="bg-ivory py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">After closing day</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight" style={{ fontVariationSettings: "'opsz' 96" }}>
              What it feels like to work with Miles.
            </h2>
          </div>

          <div className="relative flex h-[650px] w-full flex-row items-center justify-center overflow-hidden gap-1.5 [perspective:500px]">
            <div className="flex flex-row items-center gap-6" style={{ transform: 'translateX(-60px) translateY(0px) translateZ(-50px) rotateX(14deg) rotateY(-6deg) rotateZ(14deg)' }}>
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:60s]">
                {reviewImgs.slice(0, 9).map((img) => (<ReviewCard key={img} img={img} />))}
              </Marquee>
              <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:60s]">
                {reviewImgs.slice(9, 18).map((img) => (<ReviewCard key={img} img={img} />))}
              </Marquee>
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:60s]">
                {reviewImgs.slice(18).map((img) => (<ReviewCard key={img} img={img} />))}
              </Marquee>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ivory" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ivory" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-ivory" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-ivory" />
            </div>
          </div>

          <p className="text-center text-xs text-deep-teal/40 mt-8 font-medium">All reviews from verified clients on Zillow.</p>
        </div>
      </section>

      {/* INQUIRE / WISHLIST (the Apply beat) */}
      <section id="inquire" className="bg-deep-teal text-ivory py-20 md:py-28 px-6 relative grain scroll-mt-24">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">Your real estate wishlist</p>
            <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight tracking-tight mb-3" style={{ fontVariationSettings: "'opsz' 96" }}>
              Tell me what you&apos;re looking for.
            </h2>
            <p className="text-base text-ivory/70 max-w-lg mx-auto" style={{ lineHeight: '1.7' }}>
              Buying, selling, or just thinking about it. Send the picture you have and I build the shortlist around it. This goes straight to Miles.
            </p>
          </div>

          <LeadCaptureForm
            listings={formOptions}
            selectedSlug={selectedSlug}
            onSelectChange={setSelectedSlug}
            submitLabel="Send it to Miles"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-deep-teal border-t border-gold/20 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Image src="/images/mams-logo.png" alt="MAMS" width={48} height={48} className="h-12 w-12 rounded-full border border-gold/20 object-cover" />
                <span className="font-display text-ivory text-base font-light">MAMS</span>
              </div>
              <p className="text-xs text-ivory/40 leading-relaxed">
                Richmond, Virginia real estate.<br />
                Buyer and seller representation.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold/60 mb-3">Follow Along</p>
              <div className="flex flex-col gap-1.5">
                <a href="https://www.instagram.com/milesaminutesolutions/" target="_blank" rel="noopener noreferrer" className="text-sm text-ivory/50 font-medium hover:text-gold" style={{ transition: 'color 0.2s ease' }}>Instagram</a>
                <a href="https://www.tiktok.com/@milesaminutemedia" target="_blank" rel="noopener noreferrer" className="text-sm text-ivory/50 font-medium hover:text-gold" style={{ transition: 'color 0.2s ease' }}>TikTok</a>
                <a href="https://www.youtube.com/@RVALifewithMiles" target="_blank" rel="noopener noreferrer" className="text-sm text-ivory/50 font-medium hover:text-gold" style={{ transition: 'color 0.2s ease' }}>YouTube</a>
                <a href="https://www.zillow.com/profile/milesRVA" target="_blank" rel="noopener noreferrer" className="text-sm text-ivory/50 font-medium hover:text-gold" style={{ transition: 'color 0.2s ease' }}>Zillow</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold/60 mb-3">Contact</p>
              <p className="text-sm text-ivory/50 mb-1">miles@mamssolutions.com</p>
              <a href="tel:+18048098340" className="text-sm text-ivory/50 hover:text-gold" style={{ transition: 'color 0.2s ease' }}>(804) 809-8340</a>
            </div>
          </div>
          <div className="border-t border-ivory/8 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-ivory/30">2026 MAMS. All rights reserved.</p>
            <p className="text-xs text-ivory/20">Licensed in the Commonwealth of Virginia.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
