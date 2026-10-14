import { Vote } from "lucide-react";
import { useCountyTurnout } from "@/hooks/useCountyTurnout";

// National figure published by IEBC for the 9 August 2022 presidential election.
const NATIONAL_2022 = { registered: 22120458, turnoutPct: 64.76, date: "15 Aug 2022" };

export default function CountyTurnout({ county }: { county: string }) {
  const { data } = useCountyTurnout();
  const row = data?.get(county);
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
          <div className="text-xs text-muted-foreground">{county} County · presidential</div>
          {row ? (
            <>
              <div className="text-3xl font-semibold tabular-nums">{row.turnout_pct}%</div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${row.turnout_pct}%` }} /></div>
              <p className="text-xs text-muted-foreground">
                {row.votes_cast.toLocaleString()} of {row.registered_voters.toLocaleString()} registered ·{" "}
                <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-accent underline">{row.source_title}</a>
                {row.published_on ? `, ${row.published_on}` : ""}
              </p>
            </>
          ) : (
            <>
              <div className="text-base font-medium">Data unavailable — no verified source</div>
              <p className="text-xs text-muted-foreground">No verified IEBC county total is stored for this county, so no estimate is shown.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
