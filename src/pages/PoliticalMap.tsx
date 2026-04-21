import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import AppShell from "@/components/AppShell";
import { generateSeats, PoliticalSeat, SEAT_COLORS, SEAT_RADIUS, SeatLevel } from "@/data/politicalSeats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, TrendingUp, Map as MapIcon, Filter } from "lucide-react";

const GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/kenya/kenya-counties.json";

const LEVEL_LABEL: Record<SeatLevel, string> = {
  president: "President",
  governor: "Governors",
  senator: "Senators",
  mp: "MPs",
  mca: "MCAs",
};

const PoliticalMap = () => {
  const [geo, setGeo] = useState<any>(null);
  const [seats] = useState<PoliticalSeat[]>(generateSeats);
  const [activeLevels, setActiveLevels] = useState<Record<SeatLevel, boolean>>({
    president: true, governor: true, senator: true, mp: true, mca: false,
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PoliticalSeat | null>(null);

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then(setGeo).catch(() => setGeo(null));
  }, []);

  const filtered = useMemo(() => {
    return seats.filter((s) => activeLevels[s.level] && (search === "" || s.title.toLowerCase().includes(search.toLowerCase()) || s.region.toLowerCase().includes(search.toLowerCase())));
  }, [seats, activeLevels, search]);

  const counts = useMemo(() => {
    const c: Record<SeatLevel, number> = { president: 0, governor: 0, senator: 0, mp: 0, mca: 0 };
    seats.forEach((s) => c[s.level]++);
    return c;
  }, [seats]);

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <MapIcon className="h-7 w-7 text-primary" /> Kenya Political Map
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time sentiment & influence simulation across every elected seat — from MCA to President.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(activeLevels) as SeatLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevels((a) => ({ ...a, [lvl]: !a[lvl] }))}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-smooth ${
                  activeLevels[lvl] ? "border-primary/60 bg-primary/15 text-foreground" : "border-border/60 text-muted-foreground"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ background: SEAT_COLORS[lvl] }} />
                {LEVEL_LABEL[lvl]} ({counts[lvl]})
              </button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3 glass border-border/60 overflow-hidden">
            <CardContent className="p-0 relative aspect-[4/3]">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 2400, center: [37.9062, 0.0236] }}
                width={600} height={460}
                style={{ width: "100%", height: "100%" }}
              >
                {geo && (
                  <Geographies geography={geo}>
                    {({ geographies }) =>
                      geographies.map((g: any) => (
                        <Geography
                          key={g.rsmKey}
                          geography={g}
                          style={{
                            default: { fill: "hsl(250 30% 12%)", stroke: "hsl(265 80% 55% / 0.4)", strokeWidth: 0.5, outline: "none" },
                            hover: { fill: "hsl(265 70% 22%)", stroke: "hsl(265 95% 70%)", strokeWidth: 0.8, outline: "none" },
                            pressed: { fill: "hsl(265 70% 25%)", outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                )}
                {filtered.map((s) => (
                  <Marker key={s.id} coordinates={s.coords} onClick={() => setSelected(s)}>
                    <circle
                      r={SEAT_RADIUS[s.level]}
                      fill={SEAT_COLORS[s.level]}
                      fillOpacity={0.8}
                      stroke="white"
                      strokeWidth={0.4}
                      style={{ cursor: "pointer" }}
                    />
                    {s.level === "president" && (
                      <text textAnchor="middle" y={-18} style={{ fontSize: 9, fill: "hsl(230 30% 96%)", fontWeight: 700, paintOrder: "stroke", stroke: "hsl(240 25% 4%)", strokeWidth: 2 }}>
                        H.E. President
                      </text>
                    )}
                  </Marker>
                ))}
              </ComposableMap>
              <div className="absolute top-3 left-3 glass-strong rounded-lg px-3 py-2 text-[10px] space-y-1">
                <div className="font-semibold flex items-center gap-2"><Filter className="h-3 w-3" /> Showing {filtered.length} seats</div>
                <div className="text-muted-foreground">Click a marker for details</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="glass border-border/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Search seats</CardTitle></CardHeader>
              <CardContent>
                <Input placeholder="county, name, role…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </CardContent>
            </Card>

            {selected ? (
              <Card className="glass-strong border-primary/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEAT_COLORS[selected.level] }} />
                    <Badge variant="outline" className="capitalize">{selected.level}</Badge>
                    <Badge variant="secondary">{selected.party}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{selected.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="Region" value={selected.region} />
                  <Row label="Mentions" value={selected.mentions} />
                  <Row label="Influence" value={`${selected.influence}/100`} />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.abs(selected.sentiment)}%`,
                            background: selected.sentiment >= 0 ? "hsl(150 85% 55%)" : "hsl(0 85% 62%)",
                            marginLeft: selected.sentiment < 0 ? `${50 - Math.abs(selected.sentiment) / 2}%` : "50%",
                          }}
                        />
                      </div>
                      <span className={selected.sentiment >= 0 ? "text-success font-mono text-xs" : "text-destructive font-mono text-xs"}>
                        {selected.sentiment > 0 ? "+" : ""}{selected.sentiment}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {selected.trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                    Trending {selected.trend}
                  </div>
                  <Button size="sm" className="w-full bg-gradient-primary">Generate AI briefing</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-border/60">
                <CardContent className="p-6 text-xs text-muted-foreground text-center">
                  Click a seat on the map to see real-time intelligence.
                </CardContent>
              </Card>
            )}

            <Card className="glass border-border/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top influencers</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[...filtered].sort((a, b) => b.influence - a.influence).slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: SEAT_COLORS[s.level] }} />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <span className="font-mono text-muted-foreground shrink-0">{s.influence}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default PoliticalMap;
