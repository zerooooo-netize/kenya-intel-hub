import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useOfficeholders, OFFICE_LABEL } from "@/hooks/useOfficeholders";
import { useCountyTurnout } from "@/hooks/useCountyTurnout";
import { normalizeCounty } from "@/data/countyDemographics";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
import { WARDS_PER_COUNTY, WARD_SOURCE } from "@/data/wardCounts";
import { dashboardCounty } from "@/lib/countyDashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, MapPin, Newspaper, Users, Vote, UserCircle2 } from "lucide-react";

const POSITION: Record<string, string> = {
  president: "President", deputy_president: "Deputy President", governor: "Governor", senator: "Senator",
  woman_representative: "Woman Representative", mp: "MP", mca: "MCA",
};
const fmt = (n: number) => n.toLocaleString("en-KE");

const CountyDashboard = () => {
  const { profile, loading } = useCandidateProfile();
  const [params, setParams] = useSearchParams();
  const county = dashboardCounty(params.get("county"), profile?.county);
  const key = normalizeCounty(county) || county;
  const { data: people = [], isLoading: peopleLoading, error: peopleError } = useOfficeholders();
  const { data: turnout, isLoading: turnoutLoading, error: turnoutError } = useCountyTurnout();
  const [q, setQ] = useState("");

  const inCounty = useMemo(() => people.filter((p) => p.county && (normalizeCounty(p.county) || p.county) === key), [people, key]);
  const leaders = inCounty.filter((p) => ["governor", "senator", "woman_rep"].includes(p.level));
  const mps = inCounty.filter((p) => p.level === "mp");
  const mcas = inCounty
    .filter((p) => p.level === "mca")
    .filter((p) => !q || `${p.full_name} ${p.ward} ${p.constituency} ${p.party ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.constituency ?? "").localeCompare(b.constituency ?? "") || (a.ward ?? "").localeCompare(b.ward ?? ""));
  const t = turnout?.get(key);
  const allMcas = inCounty.filter((p) => p.level === "mca");
  const electedWards = new Set(allMcas.filter((p) => p.ward).map((p) => p.ward?.toLowerCase().trim())).size;
  const expectedWards = Object.entries(WARDS_PER_COUNTY).find(([c]) => normalizeCounty(c) === key)?.[1];

  const { data: news = [], isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ["county-news", county],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("id,title,description,source,metadata,created_at")
        .order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const c = county.toLowerCase();
      return (data ?? []).filter((a: any) => {
        const url = a.metadata?.url;
        return typeof url === "string" && /^https?:\/\//.test(url) &&
          `${a.title} ${a.description ?? ""} ${a.metadata?.area ?? ""}`.toLowerCase().includes(c);
      }).slice(0, 12);
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader eyebrow="County dashboard" title={`${county} County`} icon={Building2}
          actions={<>
            <Select value={county} onValueChange={(c) => { setParams({ county: c }); setQ(""); }}>
              <SelectTrigger aria-label="Select county" className="w-[210px]"><SelectValue /></SelectTrigger>
              <SelectContent>{KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button asChild variant="outline"><Link to={`/political-map?county=${encodeURIComponent(county)}`}><MapPin className="h-4 w-4" />County map</Link></Button>
          </>} />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserCircle2 className="h-4 w-4" />Campaign profile</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {loading ? <p className="text-muted-foreground">Loading…</p> : !profile ? (
                <p className="text-muted-foreground">No campaign profile yet. <Link className="text-primary underline" to="/onboarding">Create one</Link> — showing Nairobi for now.</p>
              ) : (<>
                <p className="text-2xl font-display">{profile.full_name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{POSITION[profile.aspired_position] ?? profile.aspired_position}</Badge>
                  <Badge variant="outline">{profile.county ?? "National"}</Badge>
                  <Badge variant="outline">{profile.party || "No party set"}</Badge>
                </div>
                {normalizeCounty(profile.county ?? "") !== key && <p className="text-xs text-muted-foreground">Your campaign remains {POSITION[profile.aspired_position] ?? profile.aspired_position} · {profile.county ?? "Kenya"}.</p>}
                {profile.campaign_slogan && <p className="italic text-muted-foreground">“{profile.campaign_slogan}”</p>}
                {!!profile.campaign_topics?.length && (
                  <div className="flex flex-wrap gap-1">{profile.campaign_topics.map((x) => <Badge key={x} variant="secondary">{x}</Badge>)}</div>
                )}
                <Button asChild size="sm" variant="outline"><Link to="/onboarding">Edit profile</Link></Button>
              </>)}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Vote className="h-4 w-4" />2022 turnout</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {turnoutLoading ? <p className="text-muted-foreground">Loading turnout…</p> : turnoutError ? <p className="text-destructive">Could not load turnout. Please try again.</p> : !t ? <p className="text-muted-foreground">Data unavailable — no verified source.</p> : (<>
                <p className="text-4xl font-display">{t.turnout_pct.toFixed(1)}%</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${t.turnout_pct}%` }} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-muted-foreground text-xs">Registered</p><p className="font-semibold">{fmt(t.registered_voters)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Votes cast</p><p className="font-semibold">{fmt(t.votes_cast)}</p></div>
                </div>
                <a href={t.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline">
                  {t.source_title}{t.published_on ? ` · ${t.published_on}` : ""}<ExternalLink className="h-3 w-3" /></a>
              </>)}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />County leaders</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{mps.length} MPs · {allMcas.length} MCAs on record</p>
              {peopleError && <p className="text-destructive">Could not load officeholders. Please try again.</p>}
              {leaders.length === 0 && <p className="text-muted-foreground">No verified governor, senator or woman rep stored.</p>}
              {leaders.map((p) => (
                <a key={p.id} href={p.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:opacity-80">
                  {p.photo_url ? <img src={p.photo_url} alt={p.full_name} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-muted" />}
                  <div><p className="font-medium">{p.full_name}</p><p className="text-xs text-muted-foreground">{OFFICE_LABEL[p.level]}{p.party ? ` · ${p.party}` : ""}</p></div>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="glass lg:col-span-3">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base">Members of the County Assembly ({mcas.length})</CardTitle>
              <Input aria-label="Search MCAs" placeholder="Search name, ward…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-[220px]" />
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">{electedWards} of {expectedWards ?? "—"} elected wards on record · <a href={WARD_SOURCE.url} target="_blank" rel="noreferrer" className="underline">IEBC ward count</a></p>
              {peopleLoading ? <p className="text-sm text-muted-foreground">Loading MCAs…</p> : peopleError ? <p className="text-sm text-destructive">Could not load MCAs. Please try again.</p> : mcas.length === 0 ? <p className="text-sm text-muted-foreground">{q ? "No MCAs match your search." : `No sourced MCAs stored for ${county} yet.`}</p> : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {mcas.map((p) => (
                    <a key={p.id} href={p.source_url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg border border-border/50 p-2 hover:bg-muted/40">
                      {p.photo_url ? <img src={p.photo_url} alt={p.full_name} loading="lazy" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-muted" />}
                      <div className="min-w-0"><p className="text-sm font-medium break-words">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground break-words">{p.ward ?? "Nominated"}{p.constituency ? ` · ${p.constituency}` : ""}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground break-words">{p.source_title}{p.verified_on ? ` · checked ${p.verified_on}` : ""}</p></div>
                    </a>
                  ))}
                </div>
              )}
              {mcas[0] && <p className="mt-3 text-xs text-muted-foreground">Source: {mcas[0].source_title}{mcas[0].verified_on ? ` · verified ${mcas[0].verified_on}` : ""}</p>}
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Newspaper className="h-4 w-4" />Latest news</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {newsLoading ? <p className="text-sm text-muted-foreground">Loading news…</p> : newsError ? <p className="text-sm text-destructive">Could not load news. Please try again.</p> : news.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sourced news collected for {county} yet.</p>
              ) : news.map((n: any) => (
                <div key={n.id} className="border-b border-border/40 pb-2 last:border-0">
                  {n.metadata?.url ? <a href={n.metadata.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary">{n.title}</a>
                    : <p className="text-sm font-medium">{n.title}</p>}
                  <p className="text-xs text-muted-foreground">{n.source ?? "Alert"} · {new Date(n.created_at).toLocaleDateString("en-KE")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default CountyDashboard;
