// Daily background job: searches the last day's news for each campaign profile's
// candidate and seat area, and adds new articles to Alerts (deduplicated by link).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const JOB = "news-refresh";
const MAX_PROFILES = 10;
const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function area(p: any) {
  if (["president", "deputy_president"].includes(p.aspired_position)) return "Kenya";
  if (p.aspired_position === "mca" && p.ward) return `${p.ward} ward ${p.county ?? ""}`;
  if (p.aspired_position === "mp" && p.constituency) return `${p.constituency} ${p.county ?? ""}`;
  return p.county ? `${p.county} county` : "Kenya";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (!lovable || !fc) return json({ error: "Web crawler not configured" }, 500);

  const { data: last } = await db.from("job_runs").select("status, started_at").eq("job", JOB).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - new Date(last.started_at).getTime() < MIN_INTERVAL_MS) return json({ skipped: true, reason: "Already ran today." });
  const { data: run } = await db.from("job_runs").insert({ job: JOB }).select("id").single();
  const finish = (status: string, message: string) =>
    db.from("job_runs").update({ status, message, finished_at: new Date().toISOString() }).eq("id", run!.id);

  try {
    const { data: profiles } = await db.from("candidate_profiles").select("full_name, aspired_position, county, constituency, ward").eq("onboarded", true).limit(MAX_PROFILES);
    let added = 0;
    for (const p of profiles ?? []) {
      const where = area(p);
      const r = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": fc, "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${p.full_name} ${where} news`, limit: 8, country: "KE", tbs: "qdr:d" }),
        signal: AbortSignal.timeout(45000),
      });
      if (r.status === 402 || r.status === 403) { await finish("paused", `Crawler denied (${r.status}).`); return json({ error: `Crawler ${r.status}` }, r.status); }
      if (!r.ok) continue;
      const d = await r.json();
      const items: any[] = Array.isArray(d.data) ? d.data : (d.data?.web ?? []);
      for (const i of items.filter((x) => x.url)) {
        const { data: dup } = await db.from("alerts").select("id").eq("metadata->>url", i.url).limit(1).maybeSingle();
        if (dup) continue;
        await db.from("alerts").insert({
          severity: "info",
          title: String(i.title ?? i.url).slice(0, 200),
          description: String(i.description ?? "").slice(0, 500),
          source: "Daily news refresh",
          metadata: { url: i.url, candidate: p.full_name, area: where },
        });
        added++;
      }
    }
    await finish("success", `${added} new articles from ${profiles?.length ?? 0} profiles.`);
    return json({ added, profiles: profiles?.length ?? 0 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await finish("failed", msg);
    return json({ error: msg }, 500);
  }
});
