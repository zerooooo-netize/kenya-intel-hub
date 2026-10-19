import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { NATIONAL_STRUCTURE as N, STRUCTURE_SOURCE, seatsAt } from "@/data/electoralStructure";
import { normalizeCounty } from "@/data/countyDemographics";
import { WARDS_PER_COUNTY } from "@/data/wardCounts";

const tc = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

type Props = {
  county: string | null;
  constituency: string | null;
  constGeo: any;
  onCounty: (c: string | null) => void;
  onConstituency: (c: string | null) => void;
};

/** Drill-down: Kenya → county → constituency, with official seat counts at each level. */
const ElectoralStructure = ({ county, constituency, constGeo, onCounty, onConstituency }: Props) => {
  const list = useMemo(() => {
    if (!county || !constGeo) return [];
    const seen = new Map<number, string>();
    constGeo.features.forEach((f: any) => {
      const p = f.properties;
      if (normalizeCounty(p.COUNTY_NAM ?? "") === normalizeCounty(county)) seen.set(p.CONST_CODE, tc(p.CONSTITUEN));
    });
    return [...seen.values()].sort();
  }, [county, constGeo]);

  const level = constituency ? "constituency" : county ? "county" : "national";
  const seats = seatsAt(level, list.length);

  return (
    <Card className="glass border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Electoral structure</CardTitle>
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground pt-1">
          <button className="hover:text-foreground" onClick={() => { onCounty(null); onConstituency(null); }}>Kenya</button>
          {county && (<><ChevronRight className="h-3 w-3" /><button className="hover:text-foreground" onClick={() => onConstituency(null)}>{county}</button></>)}
          {constituency && (<><ChevronRight className="h-3 w-3" /><span className="text-foreground">{constituency}</span></>)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          {seats.map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/40 p-2">
              <div className="text-muted-foreground">{s.label}</div>
              <div className="font-mono text-base">{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {level === "national" && (
          <div className="space-y-1 text-muted-foreground">
            <div>{N.counties} counties · {N.constituencies} constituencies · {N.wards.toLocaleString()} wards</div>
            <div>National Assembly {N.nationalAssembly.total}: {N.nationalAssembly.constituencyMPs} MPs + {N.nationalAssembly.womenReps} Woman Reps + {N.nationalAssembly.nominated} nominated</div>
            <div>Senate {N.senate.total}: {N.senate.elected} elected + {N.senate.nominatedWomen} women + {N.senate.youth} youth + {N.senate.disability} disability (nominated)</div>
            <div>Speakers of both houses sit ex officio.</div>
            <div className="pt-1">Click a county on the map to narrow down.</div>
          </div>
        )}

        {level === "county" && (
          <div>
            <div className="text-muted-foreground mb-1">{list.length || "—"} constituencies in {county}</div>
            <div className="max-h-48 overflow-auto space-y-1">
              {list.map((c) => (
                <button key={c} onClick={() => onConstituency(c)} className="w-full text-left px-2 py-1 rounded hover:bg-secondary/50">{c}</button>
              ))}
              {!constGeo && <div className="text-muted-foreground">Loading boundaries…</div>}
            </div>
            <div className="text-muted-foreground mt-2">
              {(() => { const n = Object.entries(WARDS_PER_COUNTY).find(([k]) => normalizeCounty(k) === normalizeCounty(county!))?.[1]; return n ? `${n} wards → ${n} elected MCAs (IEBC)` : "Ward count: data unavailable"; })()}
            </div>
          </div>
        )}

        {level === "constituency" && (
          <div className="text-muted-foreground">Voters here elect 1 MP, plus their county's Governor, Senator and Woman Rep, the President, and one MCA per ward.</div>
        )}

        <a href={STRUCTURE_SOURCE.url} target="_blank" rel="noreferrer" className="block text-[11px] text-muted-foreground underline">
          Source: {STRUCTURE_SOURCE.title}
        </a>
        <Badge variant="outline" className="text-[10px]">Seat pins are simulated and hidden by default; counts above are official</Badge>
      </CardContent>
    </Card>
  );
};

export default ElectoralStructure;
