export function MarketCommentary({ text }: { text: string }) {
  return (
    <section className="bg-deep-teal text-ivory rounded-lg overflow-hidden">
      <div className="bg-ivory/[0.06] px-6 sm:px-8 py-4 border-b border-ivory/10">
        <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">
          Miles&rsquo;s read on this search
        </p>
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-sm sm:text-base text-ivory/90 leading-relaxed">{text}</p>
      </div>
    </section>
  );
}
