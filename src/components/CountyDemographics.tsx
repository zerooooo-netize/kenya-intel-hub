import { useRef, useState } from "react";
import { Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
import { CountyDemographic, demographicColor, parseDemographicCsv } from "@/data/countyDemographics";
import { useAuth } from "@/hooks/useAuth";

type Props = { county: string; onCountyChange: (county: string) => void };

export default function CountyDemographics({ county, onCountyChange }: Props) {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState<CountyDemographic[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const rows = records.filter((record) => record.county === county).sort((a, b) => b.percentage - a.percentage);
  const total = rows.reduce((sum, row) => sum + row.percentage, 0);

  return (
    <section aria-labelledby="demographics-title" className="border-t border-border pt-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="demographics-title" className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> County communities</h2>
          <p className="text-sm text-muted-foreground mt-1">Ethnic-group population shares · demographic context only</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="demographic-county" className="sr-only">Demographic county</label>
          <select id="demographic-county" className="h-10 rounded-md border border-input bg-background px-3 text-sm max-w-full" value={county} onChange={(event) => onCountyChange(event.target.value)}>
            {KENYA_COUNTIES.map((name) => <option key={name}>{name}</option>)}
          </select>
          {isAdmin && <>
            <Button variant="outline" onClick={() => input.current?.click()}><Upload /> Import sourced CSV</Button>
            <input ref={input} type="file" accept=".csv,text/csv" className="hidden" aria-label="Import county demographics" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const parsed = parseDemographicCsv(await file.text());
                setRecords(parsed);
                onCountyChange(parsed[0].county);
                toast.success(`Loaded ${parsed.length} demographic records for this session.`);
              } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to read CSV."); }
              event.target.value = "";
            }} />
          </>}
        </div>
      </div>
      {rows.length ? <div className="max-w-3xl space-y-4">
        <div className="flex h-3 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          {rows.map((row) => <span key={row.group} style={{ width: `${row.percentage}%`, backgroundColor: demographicColor(row.group) }} />)}
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {rows.map((row) => <li key={row.group} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: demographicColor(row.group) }} />{row.group}</span>
              <span className="font-mono tabular-nums">{row.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-secondary"><div className="h-full" style={{ width: `${row.percentage}%`, backgroundColor: demographicColor(row.group) }} /></div>
          </li>)}
        </ul>
        {total < 99.95 && <p className="text-xs text-muted-foreground">Unreported share: {(100 - total).toFixed(1)}% · no group inferred</p>}
        <p className="text-xs text-muted-foreground">{rows[0].year} · <a href={rows[0].source} target="_blank" rel="noopener noreferrer" className="text-accent underline">View supplied source</a> · Imported data, not independently verified · Session only</p>
      </div> : <div className="py-6 border-y border-border/60 space-y-2">
        <h3 className="font-medium">{county} · percentages not yet available</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">No verified county-by-ethnicity dataset is connected. Population shares are not estimated from county location or political affiliation.</p>
        <a className="text-sm text-accent underline inline-block" href="https://www.knbs.or.ke/" target="_blank" rel="noopener noreferrer">Kenya National Bureau of Statistics</a>
      </div>}
      {isAdmin && <p className="text-xs text-muted-foreground break-words">CSV columns: county,group,percentage,year,source. One year and HTTPS source per county. Imports remain in this page session.</p>}
    </section>
  );
}