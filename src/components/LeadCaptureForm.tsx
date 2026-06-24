'use client';

import { useState } from 'react';

export type LeadFormListingOption = { slug: string; label: string };

type Props = {
  /** API endpoint to POST the lead to. */
  endpoint?: string;
  /** Listings shown in the "interested in" select. */
  listings?: LeadFormListingOption[];
  /** Controlled selected listing slug ("" = general). */
  selectedSlug?: string;
  onSelectChange?: (slug: string) => void;
  submitLabel?: string;
};

const INTENTS = ['Buying', 'Selling', 'Both'] as const;

export default function LeadCaptureForm({
  endpoint = '/api/listings',
  listings = [],
  selectedSlug = '',
  onSelectChange,
  submitLabel = 'Send it over',
}: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    intent: 'Buying' as (typeof INTENTS)[number],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedLabel =
    listings.find((l) => l.slug === selectedSlug)?.label || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          intent: form.intent,
          message: form.message,
          listing: selectedLabel,
        }),
      });
      const data = await res.json();
      if (data.success) {
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

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-light text-ivory mb-3" style={{ fontVariationSettings: "'opsz' 60" }}>
          Got it, {form.firstName}.
        </h3>
        <p className="text-sm text-ivory/70 leading-relaxed max-w-sm mx-auto">
          Your note is in. Miles reads these himself and replies personally. Expect a real answer, not an auto-reply.
        </p>
      </div>
    );
  }

  const inputCls =
    'w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15';
  const inputStyle = { transition: 'border-color 0.2s ease, background 0.2s ease' };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lead-first" className="text-xs text-ivory/60 font-medium mb-1 block">First Name *</label>
          <input
            id="lead-first"
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={inputCls}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="lead-last" className="text-xs text-ivory/60 font-medium mb-1 block">Last Name *</label>
          <input
            id="lead-last"
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={inputCls}
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lead-phone" className="text-xs text-ivory/60 font-medium mb-1 block">Phone *</label>
          <input
            id="lead-phone"
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputCls}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="text-xs text-ivory/60 font-medium mb-1 block">Email *</label>
          <input
            id="lead-email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputCls}
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lead-intent" className="text-xs text-ivory/60 font-medium mb-1 block">I&apos;m</label>
          <select
            id="lead-intent"
            value={form.intent}
            onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value as (typeof INTENTS)[number] }))}
            className={inputCls}
            style={inputStyle}
          >
            {INTENTS.map((i) => (
              <option key={i} value={i} className="text-deep-teal">{i}</option>
            ))}
          </select>
        </div>
        {listings.length > 0 && (
          <div>
            <label htmlFor="lead-listing" className="text-xs text-ivory/60 font-medium mb-1 block">Interested in</label>
            <select
              id="lead-listing"
              value={selectedSlug}
              onChange={(e) => onSelectChange?.(e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="" className="text-deep-teal">Not a specific home yet</option>
              {listings.map((l) => (
                <option key={l.slug} value={l.slug} className="text-deep-teal">{l.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="lead-message" className="text-xs text-ivory/60 font-medium mb-1 block">What you&apos;re looking for</label>
        <textarea
          id="lead-message"
          rows={3}
          placeholder="Neighborhoods, price range, must-haves, timeline. The more you tell me, the sharper the shortlist."
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={inputCls + ' resize-none'}
          style={inputStyle}
        />
      </div>

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="cta-primary w-full px-8 py-4 rounded-sm text-base font-semibold tracking-wide disabled:opacity-50"
      >
        {submitting ? 'Sending...' : submitLabel}
      </button>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          className="mt-1 w-4 h-4 rounded border-ivory/30 bg-ivory/10 text-gold accent-gold flex-shrink-0"
        />
        <span className="text-xs text-ivory/50 leading-relaxed">
          By checking this box, I consent to receive transactional and marketing messages related to my inquiry, including appointment reminders and property updates. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt-out.
        </span>
      </label>
    </form>
  );
}
