'use client';

import Image from 'next/image';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import Nav from '@/components/nav';
import { Marquee } from '@/components/ui/3d-testimonials';
import { Card, CardContent } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';
import { useLucideDrawerAnimation } from '@/components/ui/lucide-icon-drawer';
import { MapPin, Building2, Heart } from 'lucide-react';

const testimonials = [
  { name: 'Client 1', body: 'Miles is the best thing that could have happened to us. He was always available and quick to respond, guided us through the entire home buying process, and full of knowledge. From coffee to electricians, Miles\u2019 abundant excitement and energy made the stressful process enjoyable.', img: '/images/testimonials/testimonial-01.png' },
  { name: 'Client 2', body: 'Miles has been super helpful during our buying process. He went out of his way to do multiple virtual tours, as we were living outside Richmond. Many things changed along our home buying process, BUT we finally found the right home and closed! Miles is still there for us even after closing.', img: '/images/testimonials/testimonial-02.png' },
  { name: 'Client 3', body: 'We moved across the US from the West to the East Coast. Miles worked with us for over 6 months long after the closing to make sure we were able to get into our house and settled. He has been with us and supported us every step of the way and is now considered a friend to our family.', img: '/images/testimonials/testimonial-03.png' },
  { name: 'Client 4', body: 'Miles is the absolute best! My wife and I were first-time home buyers in the wildest market conditions anyone has ever seen, and he guided us through the whole process better than I could have ever asked for. He is passionate, friendly, knowledgeable, and will work HARD for you!', img: '/images/testimonials/testimonial-04.png' },
  { name: 'Client 5', body: 'Miles is amazing!!! He was so knowledgeable about everything and if he didn\u2019t know he would make sure to find out ASAP. The whole process went quickly and he went above and beyond. I highly recommend him and his company. He is truly an amazing person and if you need someone you can trust that will fight for you, look no further.', img: '/images/testimonials/testimonial-05.png' },
  { name: 'Client 6', body: 'Miles Agee was always working for me to find my new home. I was relocating from Northern Virginia to the Richmond VA area. It helped to have someone available online and I wanted to see it. Miles always made himself available. He is very knowledgeable of the area which helped me since I did not know the area.', img: '/images/testimonials/testimonial-06.png' },
  { name: 'Client 7', body: 'Miles excellently navigated us through the home buying process from searching to closing. His great attitude paired with his great negotiation skills were a wonderful blend with ideal terms. We searched and closed from out of state and Miles rose to the challenge and made the process smooth and easy. I highly recommend Miles.', img: '/images/testimonials/testimonial-07.png' },
  { name: 'Client 8', body: 'Miles was great. Responded to questions that I had about properties and was available after hours and weekends when information was requested. He helped me get out of a home that was not a right fit, and assisted in finding the home I ultimately closed on.', img: '/images/testimonials/testimonial-08.png' },
  { name: 'Client 9', body: 'Miles is the man! He was easy to work with, and very professional! He was so quick to respond to all questions we had throughout the process. We were moving from outside the area, so Miles was also great at explaining the different areas around Richmond, to help us make an informed decision on where to buy.', img: '/images/testimonials/testimonial-09.png' },
  { name: 'Client 10', body: 'We loved working with Miles to buy our new home! He was extremely patient with us as we tried to figure out exactly what we wanted, and responded promptly and thoroughly to any questions. We enjoyed his enthusiasm for the process, and appreciated his availability!', img: '/images/testimonials/testimonial-10.png' },
  { name: 'Client 11', body: 'Miles enthusiasm and personality is incredible. He went above and beyond for us while we were buying our first home. Making this experience informative, enjoyable, and stress free. If you are looking for someone you can trust and that will fight for you, look no further because Miles is your realtor!', img: '/images/testimonials/testimonial-11.png' },
  { name: 'Client 12', body: 'Miles has been super helpful during our buying process. He went out of his way to do multiple virtual tours, as we were living outside Richmond. Many things changed along our home buying process, BUT we finally found the right home and closed! Miles is still there for us even after closing. Thanks, Miles!', img: '/images/testimonials/testimonial-12.png' },
  { name: 'Client 13', body: 'Miles is absolutely fantastic to work with. He helped me purchase my dream condo in Richmond, and from the beginning of my search until the final walk through, he was there for me. Miles went above and beyond for me, helping with references and even making purchasing from a distance a seamless process.', img: '/images/testimonials/testimonial-13.png' },
  { name: 'Client 14', body: 'Miles was amazing! The first night we started looking for a home, I had emailed him and he instantly called me right after! He very patient and super helpful throughout the entire process. He does everything in his power to help us find the perfect first home.', img: '/images/testimonials/testimonial-14.png' },
  { name: 'Client 15', body: 'Miles Agee is an A+ real estate agent who I would recommend to anyone, especially those who feel hesitant or unsure about how to navigate this crazy market. Miles was always available to answer questions and worked tirelessly to get us to see properties as soon as possible. The market is moving SO fast, so having a responsive agent is key.', img: '/images/testimonials/testimonial-15.png' },
  { name: 'Client 16', body: 'I had an excellent time using Miles Agee as my buying agent. Their entire team was with you and all the associated parties to ensure a quick and easy home buying process. Communication was superb.', img: '/images/testimonials/testimonial-16.png' },
  { name: 'Client 17', img: '/images/testimonials/testimonial-17.png', body: 'Five-star experience from start to finish. Miles made the entire process feel effortless.' },
  { name: 'Client 18', img: '/images/testimonials/testimonial-18.png', body: 'Miles went above and beyond for our family. Could not recommend him more highly.' },
  { name: 'Client 19', img: '/images/testimonials/testimonial-19.png', body: 'Professional, responsive, and genuinely cares about finding you the right home.' },
  { name: 'Client 20', img: '/images/testimonials/testimonial-20.png', body: 'Working with Miles was the best decision we made in our home search.' },
  { name: 'Client 21', img: '/images/testimonials/testimonial-21.png', body: 'Miles made what felt impossible feel completely doable. Grateful for his guidance.' },
  { name: 'Client 22', img: '/images/testimonials/testimonial-22.png', body: 'Incredible attention to detail and always had our best interest at heart.' },
  { name: 'Client 23', img: '/images/testimonials/testimonial-23.png', body: 'From first showing to closing day, Miles was there every step of the way.' },
  { name: 'Client 24', img: '/images/testimonials/testimonial-24.png', body: 'Highly recommend Miles to anyone looking to buy or sell in Richmond.' },
  { name: 'Client 25', img: '/images/testimonials/testimonial-25.png', body: 'Miles\u2019 knowledge of the Greater Richmond area is unmatched. Five stars.' },
  { name: 'Client 26', img: '/images/testimonials/testimonial-26.png', body: 'Best realtor experience we\u2019ve ever had. Miles is the real deal.' },
];

function TestimonialCard({ img }: { img: string; name: string; body: string }) {
  return (
    <Card className="w-96 bg-paper border-deep-teal/6" style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.04), 0 8px 24px rgba(0,63,63,0.03)' }}>
      <CardContent className="p-3">
        <div className="rounded-lg overflow-hidden">
          <Image
            src={img}
            alt="Client testimonial from Zillow"
            width={380}
            height={180}
            className="w-full h-auto object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const iconDrawerRef = useLucideDrawerAnimation();
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/images/kitchen-push-in.mp4"
      bgImageSrc="/images/kitchen-hero.png"
      titleLine1="Find your neighborhood"
      titleLine2="Not just a house."
      scrollToExpand="Scroll to explore"
      textBlend
    >
      {/* NAV */}
      <Nav />

      {/* HERO */}
      <section className="relative bg-deep-teal text-ivory overflow-hidden grain min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute rounded-full"
            style={{
              top: '-30%',
              right: '-15%',
              width: '700px',
              height: '700px',
              background: 'radial-gradient(circle, rgba(0,95,95,0.4) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: '-20%',
              left: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-32 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Copy */}
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-8 fade-up fade-up-1">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs text-ivory/60 font-semibold">5-star on Google & Zillow</span>
                </div>
                <div className="w-px h-4 bg-ivory/15" />
                <p className="text-sm text-ivory/60 font-medium">Trusted by Richmond homeowners since 2022</p>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.95] tracking-tight mb-6 fade-up fade-up-2"
                style={{ fontVariationSettings: "'opsz' 144" }}
              >
                Richmond real estate,<br />
                <span className="text-gold">built around you.</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-ivory/78 leading-relaxed mb-8 max-w-lg fade-up fade-up-3"
                style={{ lineHeight: '1.7' }}
              >
                Neighborhood expertise, market transparency, and a genuine love for this city. Whether you&apos;re buying your first home or selling the one you&apos;ve outgrown, you deserve someone who knows every block.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10 fade-up fade-up-4">
                <a
                  href="#guide"
                  className="cta-primary px-8 py-4 rounded-sm text-base font-semibold tracking-wide text-center"
                >
                  Get the Richmond Relocation Guide
                </a>
                <a
                  href="https://api.leadconnectorhq.com/widget/booking/OGeuwB3XL6klvQFHG5Bj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-secondary px-8 py-4 rounded-sm text-base font-medium tracking-wide text-center"
                  style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }}
                >
                  Book a Free Consultation
                </a>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-ivory/10 fade-up fade-up-4">
                <div>
                  <p className="font-display text-2xl font-light text-gold">
                    <CountUp end={60} suffix="+" duration={2500} delay={300} />
                  </p>
                  <p className="text-xs text-ivory/50 font-medium tracking-wide uppercase">Families Served</p>
                </div>
                <div className="w-px h-10 bg-ivory/15" />
                <div>
                  <p className="font-display text-2xl font-light text-gold">
                    <CountUp end={23} prefix="$" suffix="M+" duration={2500} delay={500} />
                  </p>
                  <p className="text-xs text-ivory/50 font-medium tracking-wide uppercase">In Transactions</p>
                </div>
                <div className="w-px h-10 bg-ivory/15" />
                <div>
                  <p className="font-display text-2xl font-light text-gold">
                    <CountUp end={5} suffix=".0" duration={1500} delay={700} />
                  </p>
                  <p className="text-xs text-ivory/50 font-medium tracking-wide uppercase">Client Rating</p>
                </div>
              </div>
            </div>

            {/* Right: Miles photo */}
            <div className="relative flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl border border-gold/15" />
                <div className="absolute -inset-8 rounded-3xl border border-teal/10" />
                <Image
                  src="/images/miles-hero.jpg"
                  alt="Miles Agee, Richmond Realtor"
                  width={448}
                  height={560}
                  className="relative rounded-xl w-full max-w-md object-cover shadow-2xl"
                  style={{
                    aspectRatio: '4/5',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1)',
                  }}
                  priority
                />
                <div
                  className="absolute -bottom-4 -left-4 bg-ivory text-deep-teal px-5 py-3 rounded-sm"
                  style={{ boxShadow: '0 8px 24px -4px rgba(0,63,63,0.2), 0 0 0 1px rgba(0,63,63,0.06)' }}
                >
                  <p className="text-xs font-semibold tracking-widest uppercase text-teal mb-0.5">Licensed Realtor</p>
                  <p className="font-display text-sm font-medium">Richmond, Virginia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/30" />
      </section>

      {/* MANIFESTO RIBBON */}
      <section className="bg-teal text-ivory py-8 px-6 border-y border-gold/25">
        <p
          className="font-display italic font-light text-center text-base sm:text-lg leading-relaxed max-w-4xl mx-auto"
          style={{ fontVariationSettings: "'opsz' 36", lineHeight: '1.6' }}
        >
          Every neighborhood has a story. We know them well enough to turn yours into the right strategy, and the right deal.
        </p>
      </section>

      {/* VIDEO INTRO */}
      <section className="bg-paper py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-3">Watch first</p>
            <h2
              className="font-display text-2xl sm:text-3xl font-light text-deep-teal tracking-tight"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              34 seconds with Miles.
            </h2>
          </div>
          <div
            className="relative rounded-lg overflow-hidden bg-deep-teal mx-auto"
            style={{
              maxWidth: '400px',
              aspectRatio: '9/16',
              boxShadow: '0 20px 60px -12px rgba(0,63,63,0.2), 0 0 0 1px rgba(0,63,63,0.06)',
            }}
          >
            <video
              src="/images/intro-video.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* PROBLEM / AGITATE */}
      <section className="bg-paper py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">The reality</p>
          <h2
            className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight mb-8"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Most agents work a zip code.<br />
            <span className="text-teal">We work every block.</span>
          </h2>
          <div className="w-12 h-px bg-gold mx-auto mb-8" />
          <p className="text-base sm:text-lg text-deep-teal/75 leading-relaxed max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
            You&apos;ve talked to the agent who sends you listings in neighborhoods that don&apos;t match your life. The one who prices your home off a city average instead of what your actual street sells for. The one who can&apos;t explain why two homes less than a mile apart are valued completely differently. That gap between what your agent knows and what the market demands is where deals fall apart, and where money gets left on the table.
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="bg-ivory py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">The MAMS difference</p>
            <h2
              className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              Neighborhood-level expertise.<br />Real data. No fluff.
            </h2>
          </div>

          <div ref={iconDrawerRef} className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div
              className="group p-8 bg-paper border border-deep-teal/8 rounded-sm relative"
              style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.04), 0 8px 24px rgba(0,63,63,0.03)' }}
            >
              <div className="w-14 h-14 rounded-full bg-teal/8 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-teal" strokeWidth={1.5} />
              </div>
              <h3
                className="font-display text-xl font-medium text-deep-teal mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                For Buyers
              </h3>
              <div className="gold-line mb-4" />
              <p className="text-sm text-deep-teal/70 leading-relaxed" style={{ lineHeight: '1.7' }}>
                We match your lifestyle and values to the right Richmond neighborhood first, budget second. Whether you&apos;re relocating or moving across town, you&apos;ll see homes that actually fit your life.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="group p-8 bg-paper border border-deep-teal/8 rounded-sm relative"
              style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.04), 0 8px 24px rgba(0,63,63,0.03)' }}
            >
              <div className="w-14 h-14 rounded-full bg-teal/8 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-teal" strokeWidth={1.5} />
              </div>
              <h3
                className="font-display text-xl font-medium text-deep-teal mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                For Sellers
              </h3>
              <div className="gold-line mb-4" />
              <p className="text-sm text-deep-teal/70 leading-relaxed" style={{ lineHeight: '1.7' }}>
                You get the real numbers for your specific block, not a county average. We show you what comparable homes actually sold for, price with precision, and execute a marketing strategy that maximizes your return.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="group p-8 bg-paper border border-deep-teal/8 rounded-sm relative"
              style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.04), 0 8px 24px rgba(0,63,63,0.03)' }}
            >
              <div className="w-14 h-14 rounded-full bg-teal/8 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-teal" strokeWidth={1.5} />
              </div>
              <h3
                className="font-display text-xl font-medium text-deep-teal mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                Greater Richmond Experts
              </h3>
              <div className="gold-line mb-4" />
              <p className="text-sm text-deep-teal/70 leading-relaxed" style={{ lineHeight: '1.7' }}>
                From The Fan to Short Pump, Church Hill to Midlothian, Chesterfield to Henrico. We know the Greater Richmond area at the block level. $23M+ in transactions means we&apos;re not guessing. We&apos;re in these neighborhoods every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEIGHBORHOOD QUIZ TEASER */}
      <section id="quiz" className="bg-ivory py-16 md:py-20 px-6 border-y border-deep-teal/6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">2-minute quiz</p>
          <h2
            className="font-display text-2xl sm:text-3xl font-light text-deep-teal leading-tight tracking-tight mb-4"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Which Richmond neighborhood matches your lifestyle?
          </h2>
          <p className="text-base text-deep-teal/60 leading-relaxed mb-8 max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
            Answer 7 quick questions about how you live and we&apos;ll match you with the Richmond neighborhoods that actually fit. Personalized results with real market data.
          </p>
          <a href="/quiz" className="cta-primary px-8 py-4 rounded-sm text-base font-semibold tracking-wide inline-block">
            Take the Quiz
          </a>
          <p className="text-xs text-deep-teal/35 mt-4">Takes about 2 minutes. No account needed.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-deep-teal text-ivory py-20 md:py-28 px-6 relative grain">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute rounded-full"
            style={{
              top: '-20%',
              left: '-10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">How it works</p>
            <h2
              className="font-display text-3xl sm:text-4xl font-light leading-tight tracking-tight"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              Three steps. Zero uncertainty.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                <span className="font-display text-4xl font-light text-gold/40">01</span>
              </div>
              <h3
                className="font-display text-xl font-medium mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                Book a Consultation
              </h3>
              <div className="w-8 h-px bg-gold/40 mb-4 mx-auto md:mx-0" />
              <p className="text-sm text-ivory/65 leading-relaxed" style={{ lineHeight: '1.7' }}>
                A 20-minute conversation about what you&apos;re looking for, what matters to you, and where you are in the process. No pitch. Just clarity.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                <span className="font-display text-4xl font-light text-gold/40">02</span>
              </div>
              <h3
                className="font-display text-xl font-medium mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                Get Your Strategy
              </h3>
              <div className="w-8 h-px bg-gold/40 mb-4 mx-auto md:mx-0" />
              <p className="text-sm text-ivory/65 leading-relaxed" style={{ lineHeight: '1.7' }}>
                Whether you&apos;re buying or selling, you&apos;ll walk away with a clear, data-backed plan tailored to your specific situation and Richmond&apos;s current market.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                <span className="font-display text-4xl font-light text-gold/40">03</span>
              </div>
              <h3
                className="font-display text-xl font-medium mb-3 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                Close With Confidence
              </h3>
              <div className="w-8 h-px bg-gold/40 mb-4 mx-auto md:mx-0" />
              <p className="text-sm text-ivory/65 leading-relaxed" style={{ lineHeight: '1.7' }}>
                From contract to close, every detail is handled. You always know what&apos;s happening, what&apos;s next, and exactly where you stand. No surprises.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <a href="https://api.leadconnectorhq.com/widget/booking/OGeuwB3XL6klvQFHG5Bj" target="_blank" rel="noopener noreferrer" className="cta-primary px-10 py-4 rounded-sm text-base font-semibold tracking-wide inline-block">
              Start With a Free Consultation
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT MILES */}
      <section id="about" className="bg-paper py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative flex justify-center">
              <div className="relative">
                <Image
                  src="/images/miles-about.jpg"
                  alt="Miles Agee"
                  width={448}
                  height={560}
                  className="rounded-xl w-full max-w-md object-cover"
                  style={{
                    aspectRatio: '4/5',
                    boxShadow: '0 20px 40px -8px rgba(0,63,63,0.12), 0 0 0 1px rgba(0,63,63,0.04)',
                  }}
                />
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t border-l border-gold/30" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b border-r border-gold/30" />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">Meet Miles</p>
              <h2
                className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight mb-6"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                Built on Richmond.<br />Driven by results.
              </h2>
              <div className="w-12 h-px bg-gold mb-6" />
              <p className="text-base text-deep-teal/75 leading-relaxed mb-6" style={{ lineHeight: '1.7' }}>
                I don&apos;t just work in Richmond. I&apos;m from here. I know where the growth corridors are heading, which pockets are quietly appreciating before anyone else notices, and the neighborhood details that never show up on Zillow.
              </p>
              <p className="text-base text-deep-teal/75 leading-relaxed mb-8" style={{ lineHeight: '1.7' }}>
                MAMS was built on the belief that real estate should be transparent, neighborhood-specific, and personal. Every client gets the same thing: direct answers, real data, and someone in their corner who actually knows this market and the opportunities inside it.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 bg-ivory border border-deep-teal/6 rounded-sm"
                  style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.03)' }}
                >
                  <p className="font-display text-lg font-medium text-teal">Licensed Realtor</p>
                  <p className="text-xs text-deep-teal/50 font-medium uppercase tracking-wide">Commonwealth of Virginia</p>
                </div>
                <div
                  className="p-4 bg-ivory border border-deep-teal/6 rounded-sm"
                  style={{ boxShadow: '0 1px 3px rgba(0,63,63,0.03)' }}
                >
                  <p className="font-display text-lg font-medium text-teal">Richmond Native</p>
                  <p className="text-xs text-deep-teal/50 font-medium uppercase tracking-wide">Block-Level Expertise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-ivory py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">Client results</p>
            <h2
              className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              Don&apos;t take our word for it.
            </h2>
          </div>

          <div className="relative flex h-[650px] w-full flex-row items-center justify-center overflow-hidden gap-1.5 [perspective:500px]">
            <div
              className="flex flex-row items-center gap-6"
              style={{
                transform: 'translateX(-60px) translateY(0px) translateZ(-50px) rotateX(14deg) rotateY(-6deg) rotateZ(14deg)',
              }}
            >
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:60s]">
                {testimonials.slice(0, 9).map((review) => (
                  <TestimonialCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:60s]">
                {testimonials.slice(9, 18).map((review) => (
                  <TestimonialCard key={review.name} {...review} />
                ))}
              </Marquee>
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:60s]">
                {testimonials.slice(18).map((review) => (
                  <TestimonialCard key={review.name} {...review} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ivory" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ivory" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-ivory" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-ivory" />
            </div>
          </div>

          <p className="text-center text-xs text-deep-teal/40 mt-8 font-medium">
            All reviews from verified clients on Zillow.
          </p>
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section id="guide" className="bg-deep-teal text-ivory py-20 md:py-28 px-6 relative grain">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute rounded-full"
            style={{
              top: '-15%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Guide preview */}
            <div className="text-center md:text-left">
              <div className="relative inline-block">
                <div
                  className="bg-paper text-deep-teal rounded-sm p-8 md:p-10 max-w-sm mx-auto md:mx-0 transform md:-rotate-2"
                  style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.15)' }}
                >
                  <div className="border border-deep-teal/10 p-6">
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold mb-3">Free Download</p>
                    <p
                      className="font-display text-xl font-medium text-deep-teal leading-tight mb-3"
                      style={{ fontVariationSettings: "'opsz' 60" }}
                    >
                      The Richmond Relocation Guide
                    </p>
                    <div className="w-8 h-px bg-gold mb-3" />
                    <p className="text-xs text-deep-teal/60 leading-relaxed">
                      Neighborhoods. Market data. Schools. Lifestyle. Everything you need before your first showing.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Image
                        src="/images/mams-logo.png"
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full border border-gold/20 object-cover"
                      />
                      <span className="text-[10px] font-medium text-deep-teal/50">MAMS</span>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -bottom-3 -right-3 w-full h-full bg-ivory/80 rounded-sm -z-10 transform rotate-1"
                  style={{ boxShadow: '0 15px 40px -8px rgba(0,0,0,0.15)' }}
                />
              </div>
            </div>

            {/* Right: Copy + Form */}
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">Free guide</p>
              <h2
                className="font-display text-3xl sm:text-4xl font-light leading-tight tracking-tight mb-2"
                style={{ fontVariationSettings: "'opsz' 96" }}
              >
                Moving to Richmond?<br />Start here.
              </h2>
              <p className="font-display text-lg text-gold font-medium mb-4" style={{ fontVariationSettings: "'opsz' 60" }}>
                Over 70+ pages of value
              </p>
              <div className="w-12 h-px bg-gold/40 mb-6" />
              <ul className="space-y-3 mb-8">
                {[
                  '20+ neighborhoods broken down: city, suburban, and everything in between',
                  'Side-by-side comparisons with price, schools, vibe, and commute times',
                  'James River access points, best parks, and lifestyle highlights',
                  'A how-to-use section based on where you are in your search',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-ivory/70" style={{ lineHeight: '1.6' }}>{item}</p>
                  </li>
                ))}
              </ul>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="guide-first" className="text-xs text-ivory/60 font-medium mb-1 block">First Name *</label>
                    <input
                      id="guide-first"
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                      style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guide-last" className="text-xs text-ivory/60 font-medium mb-1 block">Last Name *</label>
                    <input
                      id="guide-last"
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                      style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="guide-phone" className="text-xs text-ivory/60 font-medium mb-1 block">Phone *</label>
                  <input
                    id="guide-phone"
                    type="tel"
                    placeholder="Phone"
                    className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                    style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="guide-email" className="text-xs text-ivory/60 font-medium mb-1 block">Email *</label>
                  <input
                    id="guide-email"
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-ivory/10 border border-ivory/15 rounded-sm text-sm text-ivory placeholder-ivory/35 focus:outline-none focus:border-gold/50 focus:bg-ivory/15"
                    style={{ transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    required
                  />
                </div>

                <p className="text-xs text-gold/70 italic">
                  We will never share your info or spam you. Unfortunately because some people are just looking to steal our hard work, if we can&apos;t verify you&apos;re a real person your request will be denied.
                </p>

                <button type="submit" className="cta-primary w-full px-8 py-4 rounded-sm text-base font-semibold tracking-wide">
                  Submit
                </button>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-ivory/30 bg-ivory/10 text-gold accent-gold flex-shrink-0"
                  />
                  <span className="text-xs text-ivory/50 leading-relaxed">
                    By checking this box, I consent to receive transactional and marketing messages related to my account, including appointment reminders, order confirmations, special offers, discounts, and new product updates. Message frequency may vary. Message &amp; Data rates may apply. Reply HELP for help or STOP to opt-out.
                  </span>
                </label>

                <div className="flex justify-center gap-2 pt-2">
                  <a href="#" className="text-xs text-ivory/30 hover:text-gold" style={{ transition: 'color 0.2s ease' }}>Privacy Policy</a>
                  <span className="text-xs text-ivory/20">|</span>
                  <a href="#" className="text-xs text-ivory/30 hover:text-gold" style={{ transition: 'color 0.2s ease' }}>Terms of Service</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>



      {/* NEIGHBORHOODS */}
      <section className="bg-paper py-20 md:py-28 px-6 border-t border-deep-teal/6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-4">Our market</p>
          <h2
            className="font-display text-3xl sm:text-4xl font-light text-deep-teal leading-tight tracking-tight mb-12"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            We know Greater Richmond at the block level.
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'The Fan', 'Church Hill', "Scott's Addition", 'Manchester', 'Carytown',
              'Museum District', 'Midlothian', 'Short Pump', 'Jackson Ward', 'Oregon Hill',
              'Shockoe Bottom', 'Glen Allen', 'Chesterfield', 'Henrico', 'Mechanicsville',
            ].map((hood) => (
              <span
                key={hood}
                className="px-5 py-2.5 bg-ivory border border-deep-teal/8 rounded-sm text-sm font-medium text-deep-teal/70"
                style={{ boxShadow: '0 1px 2px rgba(0,63,63,0.03)' }}
              >
                {hood}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="bg-deep-teal text-ivory py-20 md:py-28 px-6 relative grain">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute rounded-full"
            style={{
              bottom: '-30%',
              right: '-15%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(0,95,95,0.35) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '-20%',
              left: '20%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/images/mams-logo.png"
              alt="MAMS"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-gold/30 mx-auto mb-6 object-cover"
            />
          </div>
          <h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-tight mb-6"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Ready to make your move?
          </h2>
          <p className="text-lg text-ivory/70 leading-relaxed mb-10 max-w-xl mx-auto" style={{ lineHeight: '1.7' }}>
            Whether you&apos;re buying, selling, or just starting to think about it, a 20-minute conversation with Miles will give you clarity on your next step. No pressure, no pitch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="#guide" className="cta-primary px-10 py-4 rounded-sm text-lg font-semibold tracking-wide inline-block">
              Get the Relocation Guide
            </a>
            <a
              href="https://api.leadconnectorhq.com/widget/booking/OGeuwB3XL6klvQFHG5Bj"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary px-10 py-4 rounded-sm text-lg font-medium tracking-wide inline-block"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
            >
              Book a Consultation
            </a>
          </div>
          <p className="text-sm text-ivory/40">
            Or call directly:{' '}
            <a
              href="tel:+18048098340"
              className="text-gold/70 font-medium hover:text-gold focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-2"
              style={{ transition: 'color 0.2s ease' }}
            >
              (804) 809-8340
            </a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-deep-teal border-t border-gold/20 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src="/images/mams-logo.png"
                  alt="MAMS"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border border-gold/20 object-cover"
                />
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
    </ScrollExpandMedia>
  );
}
