import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ETHNICITY_COLORS, ETHNICITY_SOURCE as S, NATIONAL_ETHNICITY } from "@/data/nationalEthnicity";

/** National tribe breakdown (official). Counties are not shaded: KNBS publishes no county split. */
const NationalEthnicity = () => {
  const total = S.totalPopulation;
  const shown = NATIONAL_ETHNICITY.reduce((a, b) => a + b.population, 0);
  return (
    <Card className="glass border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">National tribe breakdown · 2019 census</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {NATIONAL_ETHNICITY.map((e, i) => (
            <div key={e.name} title={e.name} style={{ width: `${(e.population / total) * 100}%`, background: ETHNICITY_COLORS[i] }} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {NATIONAL_ETHNICITY.map((e, i) => (
            <div key={e.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: ETHNICITY_COLORS[i] }} />{e.name}</span>
              <span className="font-mono text-muted-foreground">{((e.population / total) * 100).toFixed(1)}% · {e.population.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground">
          Other groups, non-Kenyans and not stated: {(((total - shown) / total) * 100).toFixed(1)}%. Share of total population {total.toLocaleString()}.
          County shading by tribe is not shown — KNBS does not publish county-level figures.
        </div>
        <a href={S.url} target="_blank" rel="noreferrer" className="block text-[11px] text-muted-foreground underline">
          Source: {S.title} · published {S.published}
        </a>
      </CardContent>
    </Card>
  );
};

export default NationalEthnicity;
