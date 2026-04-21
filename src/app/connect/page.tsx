'use client';

import { useState } from 'react';
import Nav from '@/components/nav';

type Intent = 'buying-local' | 'selling' | 'moving' | 'watching';

const INTENTS: { id: Intent; label: string; sub: string }[] = [
  { id: 'buying-local', label: 'Buying in Richmond', sub: 'Already here, house hunting' },
  { id: 'selling', label: 'Selling a place', sub: 'Moving on from your current spot' },
  { id: 'moving', label: 'Moving to Richmond', sub: 'Relocating from another city' },
  { id: 'watching', label: 'Watching the market', sub: 'Studying before you make a move' },
];

const SUCCESS_MESSAGES: Record<Intent, { title: string; body: string }> = {
  'buying-local': {
    title: 'Got it.',
    body: "Best next step is the neighborhood quiz. Ten questions, two minutes, tells you which Richmond neighborhoods actually fit how you live. I'll also send the relocation guide to your email.",
  },
  'selling': {
    title: 'Noted.',
    body: "Selling is a different conversation than buying. I'll reach out personally within 24 hours. If it's urgent, text the number at the bottom of the page.",
  },
  'moving': {
    title: 'Welcome in advance.',
    body: "The relocation guide is on the way. Open it tonight, not tomorrow. Your move is a different animal than the people already here, so text me when you have a question the guide doesn't answer.",
  },
  'watching': {
    title: "You're in.",
    body: "Guide is sent. Market notes go out when something actually matters, not weekly noise. Respect the play of studying before swinging.",
  },
};

export default function Connect() {
  const [intent, setIntent] = useState<Intent | ''>('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedIntent, setSubmittedIntent] = useState<Intent | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) {
      setError('Pick one of the options above so I know what to send.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, intent }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedIntent(intent);
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-teal text-ivory">
      <Nav />

      <section className="relative grain min-h-screen flex items-start pt-28 md:pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute rounded-full"
            style={{
              top: '-20%',
              right: '-10%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(0,95,95,0.35) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: '-20%',
              left: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto relative z-10 w-full">
          {submitted && submittedIntent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1
                className="font-display text-4xl md:text-5xl font-light text-ivory mb-4"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                {SUCCESS_MESSAGES[submittedIntent].title}
              </h1>
              <p className="text-ivory/75 text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-8">
                {SUCCESS_MESSAGES[submittedIntent].body}
              </p>
              {submittedIntent === 'buying-local' && (
                <a
                  href="/quiz"
                  className="cta-primary inline-block px-8 py-4 rounded-sm text-base font-semibold tracking-wide"
                >
                  Take the neighborhood quiz
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-4">Direct line</p>
                <h1
                  className="font-display text-4xl md:text-5xl font-light text-ivory mb-4"
                  style={{ fontVariationSettings: "'opsz' 60", letterSpacing: '-0.02em' }}
                >
                  Tell me what brought you here
                </h1>
                <p className="text-ivory/70 max-w-md mx-auto leading-relaxed">
                  Richmond hits different depending on what you&apos;re chasing. Two minutes here and I&apos;ll send the right thing back, not a generic blast.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs text-ivory/60 font-medium mb-3 block uppercase tracking-wider">
                    Which one are you? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {INTENTS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setIntent(opt.id)}
                        className={`text-left p-4 rounded-sm border ${
                          intent === opt.id
                            ? 'border-gold bg-gold/10'
                            : 'border-ivory/15 bg-ivory/5 hover:border-gold/40'
                        }`}
                        style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                      >
                        <div className="text-sm font-medium text-ivory">{opt.label}</div>
                        <div className="text-xs text-ivory/55 mt-1">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="connect-first" className="text-xs text-ivory/60 font-medium mb-1 block">
                      First Name *
                    </label>
                    <input
                      id="connect-first"
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                      style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="connect-last" className="text-xs text-ivory/60 font-medium mb-1 block">
                      Last Name *
                    </label>
                    <input
                      id="connect-last"
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                      style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="connect-email" className="text-xs text-ivory/60 font-medium mb-1 block">
                    Email *
                  </label>
                  <input
                    id="connect-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                    style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="connect-phone" className="text-xs text-ivory/60 font-medium mb-1 block">
                    Phone *
                  </label>
                  <input
                    id="connect-phone"
                    type="tel"
                    placeholder="(804) 555-0100"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                    style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="connect-notes" className="text-xs text-ivory/60 font-medium mb-1 block">
                    Anything else worth knowing? <span className="text-ivory/40 normal-case">(optional)</span>
                  </label>
                  <textarea
                    id="connect-notes"
                    placeholder={
                      intent === 'selling'
                        ? 'Property address and when you want to be out.'
                        : intent === 'buying-local'
                        ? 'Neighborhoods you\'re eyeing, budget, timing.'
                        : 'What you\'re hoping to find or avoid.'
                    }
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15 resize-none"
                    style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                  />
                </div>

                {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-primary w-full px-8 py-4 rounded-sm text-base font-semibold tracking-wide disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send it over'}
                </button>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-ivory/30 bg-ivory/10 text-gold accent-gold flex-shrink-0"
                  />
                  <span className="text-xs text-ivory/50 leading-relaxed">
                    By checking this box, I consent to receive transactional and marketing messages from MAMS, including appointment reminders, guide delivery, and market updates. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt-out.
                  </span>
                </label>

                <div className="flex justify-center gap-2 pt-2">
                  <a href="/privacy" className="text-xs text-ivory/30 hover:text-gold" style={{ transition: 'color 0.2s ease' }}>
                    Privacy Policy
                  </a>
                  <span className="text-xs text-ivory/20">|</span>
                  <a href="/terms" className="text-xs text-ivory/30 hover:text-gold" style={{ transition: 'color 0.2s ease' }}>
                    Terms of Service
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
