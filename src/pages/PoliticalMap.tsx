import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import AppShell from "@/components/AppShell";
import CountyDemographics from "@/components/CountyDemographics";
import CountyTurnout from "@/components/CountyTurnout";
import ElectoralStructure from "@/components/ElectoralStructure";
import NationalEthnicity from "@/components/NationalEthnicity";
import { WARDS_PER_COUNTY, WARD_SOURCE, wardColor } from "@/data/wardCounts";
import { normalizeCounty } from "@/data/countyDemographics";
import PageHeader from "@/components/PageHeader";
import { generateSeats, PoliticalSeat, SEAT_COLORS, SEAT_RADIUS, SeatLevel } from "@/data/politicalSeats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, TrendingUp, Map as MapIcon, Filter, Plus, Minus, RotateCcw } from "lucide-react";
import { useCountyTurnout, turnoutColor } from "@/hooks/useCountyTurnout";

const GEO_URL = "https://raw.githubusercontent.com/mikelmaron/kenya-election-data/master/data/counties.geojson";
const CONST_URL = "https://raw.githubusercontent.com/mikelmaron/kenya-election-data/master/data/constituencies.geojson";
const HOME = { center: [37.9062, 0.0236] as [number, number], zoom: 1 };

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Bounding-box centre of a GeoJSON feature, used to zoom onto a county.
function centerOf(feature: any): [number, number] {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const walk = (c: any) => {
    if (typeof c[0] === "number") {
      minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]);
    } else c.forEach(walk);
  };
  walk(feature.geometry.coordinates);
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

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
  const [county, setCountyState] = useState("Nairobi");
  const [constituency, setConstituency] = useState<string | null>(null);
  const [constGeo, setConstGeo] = useState<any>(null);
  const [view, setView] = useState<{ center: [number, number]; zoom: number }>(HOME);
  const setCounty = (name: string) => { setCountyState(name); setConstituency(null); };
  const [shade, setShade] = useState<"turnout" | "wards" | "none">("turnout");
  const shadeTurnout = shade === "turnout";
  const [showPins, setShowPins] = useState(false);
  const [wardGeo, setWardGeo] = useState<any>(null);
  const wardsByCounty = useMemo(() => {
    const m = new Map<string, number>();
    Object.entries(WARDS_PER_COUNTY).forEach(([k, v]) => m.set(normalizeCounty(k), v));
    return m;
  }, []);
  const { data: turnout } = useCountyTurnout();

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then(setGeo).catch(() => setGeo(null));
    fetch("/geo/wards.geojson").then((r) => r.json()).then(setWardGeo).catch(() => setWardGeo(null));
    fetch(CONST_URL).then((r) => r.json()).then(setConstGeo).catch(() => setConstGeo(null));
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
      <div className="space-y-7">
        <PageHeader
          eyebrow="Kenya Political Map"
          title="Every seat,"
          highlight="every signal."
          icon={MapIcon}
          description="Real-time sentiment & influence simulation across every elected position in Kenya — from Member of County Assembly to President."
          actions={
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(activeLevels) as SeatLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevels((a) => ({ ...a, [lvl]: !a[lvl] }))}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-smooth ${
                    activeLevels[lvl] ? "border-primary/60 bg-primary/15 text-foreground" : "border-border/60 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ background: SEAT_COLORS[lvl] }} />
                  {LEVEL_LABEL[lvl]} ({counts[lvl]})
                </button>
              ))}
            </div>
          }
        />

        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3 glass border-border/60 overflow-hidden">
            <CardContent className="p-0 relative aspect-[4/3]">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 2400, center: [37.9062, 0.0236] }}
                width={600} height={460}
                style={{ width: "100%", height: "100%" }}
              >
                <ZoomableGroup center={view.center} zoom={view.zoom} minZoom={1} maxZoom={24} onMoveEnd={(p) => setView({ center: p.coordinates as [number, number], zoom: p.zoom })}>
                {geo && (
                  <Geographies geography={geo}>
                    {({ geographies }) =>
                      geographies.map((g: any) => {
                        const name = normalizeCounty(g.properties.COUNTY_NAM ?? "");
                        const active = name === county && view.zoom > 1.5;
                        const t = shadeTurnout ? turnout?.get(name) : undefined;
                        const w = wardsByCounty.get(name);
                        const base = shade === "wards" ? (w ? wardColor(w) : "hsl(250 10% 18%)") : shadeTurnout ? (t ? turnoutColor(t.turnout_pct) : "hsl(250 10% 18%)") : active ? "hsl(265 70% 22%)" : "hsl(250 30% 12%)";
                        return (
                        <Geography
                          key={g.rsmKey}
                          geography={g}
                          onClick={() => {
                            if (!name) return;
                            setCounty(name);
                            setView({ center: centerOf(g), zoom: 5 });
                          }}
                          style={{
                            default: { fill: base, stroke: active ? "hsl(265 95% 75%)" : "hsl(265 80% 55% / 0.5)", strokeWidth: (active ? 1.2 : 0.5) / view.zoom, outline: "none" },
                            hover: { fill: shade !== "none" ? base : "hsl(265 70% 22%)", stroke: "hsl(265 95% 70%)", strokeWidth: 0.8 / view.zoom, outline: "none", cursor: "pointer" },
                            pressed: { fill: shade !== "none" ? base : "hsl(265 70% 25%)", outline: "none" },
                          }}
                        />
                      );})
                    }
                  </Geographies>
                )}
                {constGeo && view.zoom > 1.5 && (
                  <Geographies geography={constGeo}>
                    {({ geographies }) =>
                      geographies.filter((g: any) => normalizeCounty(g.properties.COUNTY_NAM ?? "") === county).map((g: any) => (
                        <Geography
                          key={g.rsmKey}
                          geography={g}
                          onClick={() => setConstituency(titleCase(g.properties.CONSTITUEN ?? ""))}
                          style={{
                            default: { fill: titleCase(g.properties.CONSTITUEN ?? "") === constituency ? "hsl(205 100% 65% / 0.35)" : "hsl(205 100% 65% / 0.06)", stroke: "hsl(205 100% 70% / 0.8)", strokeWidth: 0.3 / view.zoom, outline: "none" },
                            hover: { fill: "hsl(205 100% 65% / 0.25)", stroke: "hsl(205 100% 75%)", strokeWidth: 0.5 / view.zoom, outline: "none", cursor: "pointer" },
                            pressed: { fill: "hsl(205 100% 65% / 0.4)", outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                )}
                {wardGeo && view.zoom > 1.5 && (
                  <Geographies geography={wardGeo}>
                    {({ geographies }) =>
                      geographies
                        .filter((g: any) => normalizeCounty(g.properties.c ?? "") === county && (!constituency || titleCase(g.properties.k ?? "") === constituency))
                        .map((g: any) => (
                          <Geography
                            key={g.rsmKey}
                            geography={g}
                            style={{
                              default: { fill: "transparent", stroke: "hsl(45 95% 65% / 0.7)", strokeWidth: 0.2 / view.zoom, outline: "none", pointerEvents: "none" },
                              hover: { fill: "transparent", outline: "none", pointerEvents: "none" },
                              pressed: { fill: "transparent", outline: "none" },
                            }}
                          />
                        ))
                    }
                  </Geographies>
                )}
                {showPins && filtered.map((s) => (
                  <Marker key={s.id} coordinates={s.coords} onClick={() => setSelected(s)}>
                    <circle
                      r={SEAT_RADIUS[s.level] / Math.sqrt(view.zoom)}
                      fill={SEAT_COLORS[s.level]}
                      fillOpacity={0.8}
                      stroke="white"
                      strokeWidth={0.4 / view.zoom}
                      style={{ cursor: "pointer" }}
                    />
                    {s.level === "president" && view.zoom < 2 && (
                      <text textAnchor="middle" y={-18} style={{ fontSize: 9, fill: "hsl(230 30% 96%)", fontWeight: 700, paintOrder: "stroke", stroke: "hsl(240 25% 4%)", strokeWidth: 2 }}>
                        H.E. President
                      </text>
                    )}
                  </Marker>
                ))}
                </ZoomableGroup>
              </ComposableMap>
              <div className="absolute top-3 left-3 glass-strong rounded-lg px-3 py-2 text-[10px] space-y-1">
                <button onClick={() => setShowPins((v) => !v)} className="font-semibold flex items-center gap-2 hover:underline"><Filter className="h-3 w-3" /> {showPins ? `Simulated pins on (${filtered.length})` : "Show simulated seat pins"}</button>
                {showPins && <div className="text-warning">Pins are illustrative, not real officeholders</div>}
                <div className="text-muted-foreground">{view.zoom > 1.5 ? `${county}${constituency ? ` · ${constituency}` : ""} · tap a constituency` : "Tap a county to zoom in"}</div>
              </div>
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                <Button size="icon" variant="secondary" aria-label="Zoom in" onClick={() => setView((v) => ({ ...v, zoom: Math.min(v.zoom * 1.6, 24) }))}><Plus /></Button>
                <Button size="icon" variant="secondary" aria-label="Zoom out" onClick={() => setView((v) => ({ ...v, zoom: Math.max(v.zoom / 1.6, 1) }))}><Minus /></Button>
                <Button size="icon" variant="secondary" aria-label="Reset map" onClick={() => { setView(HOME); setConstituency(null); }}><RotateCcw /></Button>
              </div>
              <div className="absolute bottom-3 left-3 glass-strong rounded-lg px-3 py-2 text-[10px] space-y-1.5">
                <div className="flex gap-1">
                  {(["turnout", "wards", "none"] as const).map((m) => (
                    <button key={m} onClick={() => setShade(m)} className={`rounded px-1.5 py-0.5 capitalize ${shade === m ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{m === "none" ? "Off" : m}</button>
                  ))}
                </div>
                {shade === "wards" && (
                  <>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      10<span className="h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${wardColor(10)}, ${wardColor(47)}, ${wardColor(85)})` }} />85 wards
                    </div>
                    <a href={WARD_SOURCE.url} target="_blank" rel="noreferrer" className="block text-muted-foreground underline">{WARD_SOURCE.title}</a>
                    <a href={WARD_SOURCE.outlinesUrl} target="_blank" rel="noreferrer" className="block text-muted-foreground underline">{WARD_SOURCE.outlines}</a>
                  </>
                )}
                {shadeTurnout && (
                  <>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      40%<span className="h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${turnoutColor(40)}, ${turnoutColor(62)}, ${turnoutColor(85)})` }} />85%
                    </div>
                    <div className="text-muted-foreground">IEBC Form 34C · 15 Aug 2022{turnout ? ` · ${turnout.size}/47 counties` : ""}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <ElectoralStructure
              county={county || null}
              constituency={constituency}
              constGeo={constGeo}
              onCounty={(c) => { setCounty(c ?? ""); if (!c) setView(HOME); }}
              onConstituency={setConstituency}
            />
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
        <NationalEthnicity />
        <CountyDemographics county={county} onCountyChange={setCounty} />
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
