// Daily public-web scrapers. Call with body {"job": "news" | "government" | "social" | "mca"}.
// news/government/social → new items saved to Alerts (deduplicated by link).
// mca → finds a county assembly's official member list and saves MCAs to officeholders, each with its source page.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const GW = "https://connector-gateway.lovable.dev/firecrawl/v2";
const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000;
const MCA_COUNTIES_PER_RUN = 3;
const COUNTIES = ["Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"];

const SITES = {
  news: "(site:nation.africa OR site:standardmedia.co.ke OR site:the-star.co.ke OR site:citizen.digital OR site:tuko.co.ke)",
  government: "(site:go.ke OR site:iebc.or.ke OR site:parliament.go.ke OR site:kenyalaw.org)",
  social: "(site:x.com OR site:facebook.com OR site:tiktok.com OR site:youtube.com)",
};
const LABEL = { news: "Kenyan news scraper", government: "Government & IEBC scraper", social: "Social media scraper" };

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

class Denied extends Error { constructor(public status: number) { super(`Web crawler refused the request (${status}) — likely out of credit.`); } }

function area(p: any) {
  if (["president", "deputy_president"].includes(p.aspired_position)) return "Kenya";
  if (p.aspired_position === "mca" && p.ward) return `${p.ward} ward ${p.county ?? ""}`;
  if (p.aspired_position === "mp" && p.constituency) return `${p.constituency} ${p.county ?? ""}`;
  return p.county ? `${p.county} county` : "Kenya";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const job = (await req.json().catch(() => ({})))?.job;
  if (!["news", "government", "social", "mca"].includes(job)) return json({ error: "job must be news, government, social or mca" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const lovable = Deno.env.get("LOVABLE_API_KEY"), fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (!lovable || !fc) return json({ error: "Web crawler not configured" }, 500);
  const fcPost = async (path: string, body: unknown) => {
    const r = await fetch(`${GW}/${path}`, {
      method: "POST", body: JSON.stringify(body), signal: AbortSignal.timeout(90000),
      headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": fc, "Content-Type": "application/json" },
    });
    if (r.status === 402 || r.status === 403) throw new Denied(r.status);
    if (!r.ok) { console.error(path, r.status, await r.text()); return null; }
    return r.json();
  };

  const name = `scraper-${job}`;
  // Single-flight + once-a-day guard (also skips while a run is in progress).
  const { data: last } = await db.from("job_runs").select("status, started_at").eq("job", name).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - new Date(last.started_at).getTime() < MIN_INTERVAL_MS && last.status !== "failed")
    return json({ skipped: true, reason: `Already ran (${last.status}) in the last 20 hours.` });
  const { data: run } = await db.from("job_runs").insert({ job: name }).select("id").single();
  const finish = (status: string, message: string) =>
    db.from("job_runs").update({ status, message, finished_at: new Date().toISOString() }).eq("id", run!.id);

  try {
    if (job === "mca") {
      const { data: have } = await db.from("officeholders").select("county").eq("level", "mca");
      const done = new Set((have ?? []).map((r: any) => r.county));
      const todo = COUNTIES.filter((c) => !done.has(c)).slice(0, MCA_COUNTIES_PER_RUN);
      const report: string[] = [];
      for (const county of todo) {
        const s = await fcPost("search", { query: `${county} County Assembly members MCAs list site:go.ke`, limit: 3, country: "KE" });
        const hits: any[] = (Array.isArray(s?.data) ? s.data : s?.data?.web ?? []).filter((h: any) => /assembly/i.test(h.url));
        if (!hits.length) { report.push(`${county}: no official assembly page found`); continue; }
        const url = hits[0].url;
        const p = await fcPost("scrape", {
          url, onlyMainContent: true,
          formats: [{ type: "json", prompt: "List every elected Member of the County Assembly (MCA) on this page. Only include people actually listed; never guess.",
            schema: { type: "object", properties: { members: { type: "array", items: { type: "object", properties: {
              name: { type: "string" }, ward: { type: "string" }, party: { type: "string" }, photo_url: { type: "string" } }, required: ["name"] } } } } }],
        });
        const members: any[] = (p?.json ?? p?.data?.json)?.members ?? [];
        const rows = members.filter((m) => m.name && m.ward).map((m) => ({
          level: "mca", full_name: String(m.name).trim().slice(0, 120), ward: String(m.ward).replace(/\s*ward$/i, "").trim(),
          party: m.party || null, photo_url: /^https?:\/\//.test(m.photo_url ?? "") ? m.photo_url : null, county,
          source_title: `${county} County Assembly – Members`, source_url: url, verified_on: new Date().toISOString().slice(0, 10),
        }));
        if (rows.length) await db.from("officeholders").insert(rows);
        report.push(`${county}: ${rows.length} MCAs`);
      }
      await finish("success", report.join("; ") || "All counties already have MCAs.");
      return json({ report });
    }

    const { data: profiles } = await db.from("candidate_profiles").select("full_name, aspired_position, county, constituency, ward").eq("onboarded", true).limit(10);
    let added = 0;
    for (const pr of profiles ?? []) {
      const where = area(pr);
      const s = await fcPost("search", { query: `"${pr.full_name}" OR "${where}" politics ${SITES[job as keyof typeof SITES]}`, limit: 10, country: "KE", tbs: "qdr:w" });
      const items: any[] = (Array.isArray(s?.data) ? s.data : s?.data?.web ?? []).filter((x: any) => x.url);
      for (const i of items) {
        const { data: dup } = await db.from("alerts").select("id").eq("metadata->>url", i.url).limit(1).maybeSingle();
        if (dup) continue;
        await db.from("alerts").insert({
          severity: "info", title: String(i.title ?? i.url).slice(0, 200), description: String(i.description ?? "").slice(0, 500),
          source: LABEL[job as keyof typeof LABEL], metadata: { url: i.url, candidate: pr.full_name, area: where, scraper: job },
        });
        added++;
      }
    }
    await finish("success", `${added} new items for ${profiles?.length ?? 0} profiles.`);
    return json({ added });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await finish(e instanceof Denied ? "paused" : "failed", msg);
    return json({ error: msg }, e instanceof Denied ? e.status : 500);
  }
});
