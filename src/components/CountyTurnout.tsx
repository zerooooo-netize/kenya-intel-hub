import { Vote } from "lucide-react";

// National figure published by IEBC for the 9 August 2022 presidential election.
const NATIONAL_2022 = { registered: 22120458, turnoutPct: 64.76, date: "15 Aug 2022" };

export default function CountyTurnout({ county }: { county: string }) {
  return (
    <section aria-labelledby="turnout-title" className="border-t border-border pt-6 space-y-4">
      <div>
        <h2 id="turnout-title" className="text-lg font-semibold flex items-center gap-2"><Vote className="h-5 w-5 text-accent" /> Voter turnout</h2>
        <p className="text-sm text-muted-foreground mt-1">2022 General Election · official results only</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Kenya · presidential</div>
          <div className="text-3xl font-semibold tabular-nums">{NATIONAL_2022.turnoutPct}%</div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-accent" style={{ width: `${NATIONAL_2022.turnoutPct}%` }} /></div>
          <p className="text-xs text-muted-foreground">{NATIONAL_2022.registered.toLocaleString()} registered voters · IEBC declaration, {NATIONAL_2022.date}</p>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{county} County</div>
          <div className="text-base font-medium">Not yet loaded</div>
          <p className="text-xs text-muted-foreground">County turnout comes from IEBC Form 34B tallies. It will show here once an official results feed is connected — no estimate is shown in the meantime.</p>
          <a href="https://forms.iebc.or.ke/" target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">IEBC results portal</a>
        </div>
      </div>
    </section>
  );
}
