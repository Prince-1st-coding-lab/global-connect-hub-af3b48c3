export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative flex h-12 w-12 items-center justify-center rounded-md border border-gold/70">
      <div className="absolute inset-1 rounded-sm border border-gold/40" />
      <span className="font-display text-xl font-semibold tracking-tight text-gold">NS</span>
    </div>
    <div className="leading-tight">
      <div className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-gold">
        Noble Spaces
      </div>
      <div className="font-script text-[0.7rem] text-gold/80">your space, our passion</div>
    </div>
  </div>
);
