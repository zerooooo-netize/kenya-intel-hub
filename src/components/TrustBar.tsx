const trustBadges = [
  { label: "WINNER", title: "Cybersecurity Excellence Awards 2024" },
  { label: "GOLD", title: "Global InfoSec Awards 2024" },
  { label: "TOP 10", title: "AI in GovTech Solutions 2024" },
  { label: "WINNER", title: "Innovation in Politics Award 2024" },
  { label: "EXCELLENCE", title: "Data Intelligence Award 2024" },
];

const TrustBar = () => {
  return (
    <div className="glass rounded-2xl px-6 py-5 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Trusted by mission-driven teams across Kenya & East Africa
        </p>
        <div className="flex flex-wrap items-center gap-6 lg:gap-10">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-2 group cursor-default">
              <Laurel />
              <div className="text-center leading-tight">
                <div className="text-[9px] font-bold tracking-[0.15em] text-primary-glow">{b.label}</div>
                <div className="text-[9px] text-muted-foreground max-w-[100px] mt-0.5">{b.title}</div>
              </div>
              <Laurel mirror />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Laurel = ({ mirror }: { mirror?: boolean }) => (
  <svg width="22" height="32" viewBox="0 0 22 32" fill="none" className={`text-primary/60 ${mirror ? "scale-x-[-1]" : ""}`}>
    <path d="M11 2 C 4 8, 4 22, 11 30" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M9 7 C 6 8, 5 10, 6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 12 C 5 13, 4 15, 5 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 18 C 5 19, 4 21, 5 23" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9 24 C 6 25, 5 27, 6 29" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default TrustBar;
