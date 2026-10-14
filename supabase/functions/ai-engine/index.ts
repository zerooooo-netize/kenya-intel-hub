import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const BOT_PROMPTS: Record<string, string> = {
  recon: "You are Recon Bot for ZERO Intelligence (Kenya), supporting a political campaign. Summarise public mentions, key entities, source breakdown and geographic hotspots.",
  vulnerability: "You are Vulnerability Bot. Identify a candidate's public exposure risks (scandals, controversial statements, leaked data reports, attack lines opponents could use) using only public sources. Never suggest unauthorized access.",
  identity: "You are Identity Bot. Map the candidate's public presence across platforms and media; flag impersonation, fake accounts or coordinated inauthentic behaviour reported in public sources.",
  threat_intel: "You are Threat Intel Bot. Score campaign risk, detect emerging attacks and predict short-term narrative trajectory.",
  brand_protection: "You are Brand Protection Bot. Detect impersonation, defamation and reputation shifts; recommend defensive campaign actions.",
  deep_dive: "You are Deep Dive Bot. Synthesize a complete campaign intelligence dossier: public coverage, exposure risks, online identity, threats, reputation and strategy.",
};

const BOT_QUERY: Record<string, string> = {
  recon: "",
  vulnerability: " scandal OR controversy OR allegations",
  identity: " Twitter OR TikTok OR Facebook account",
  threat_intel: " attack OR criticism OR protest",
  brand_protection: " fake OR impersonation OR defamation OR reputation",
  deep_dive: "",
};

const MODE_INSTRUCTIONS: Record<string, string> = {
  analysis: "Produce a multi-section analysis: Summary, Key Signals, Risks, Opportunities, Recommended Campaign Actions.",
  narrative: "Identify the dominant narratives, who is pushing them, sentiment direction, likely 48-hour trajectory, and counter-messaging.",
  briefing: "Write a press-ready briefing for a Kenyan campaign principal: executive summary paragraph, 4 key-fact bullets, 2 quotable lines, 3 messaging angles.",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Source = { kind: string; title: string; url: string; snippet: string };

const LABELS: Record<string, string> = {
  president: "President", deputy_president: "Deputy President", governor: "Governor", senator: "Senator",
  woman_representative: "Woman Representative", mp: "Member of Parliament", mca: "MCA",
};

// Each position only looks at its own electoral area.
function scopeFor(p: any) {
  const pos = p?.aspired_position ?? "president";
  const label = LABELS[pos] ?? "President";
  if (pos === "president" || pos === "deputy_president")
    return { label, area: "Kenya", instruction: `National ${label} race: cover all 47 counties, every level from President down to MCA where it affects the national campaign.` };
  if (pos === "mp" && p?.constituency)
    return { label, area: `${p.constituency} constituency ${p.county ?? ""}`.trim(), instruction: `Only the ${p.constituency} constituency MP race. Ignore other constituencies and other offices unless they directly affect this seat.` };
  if (pos === "mca" && p?.ward)
    return { label, area: `${p.ward} ward ${p.county ?? ""}`.trim(), instruction: `Only the ${p.ward} ward MCA race. Ignore other wards and offices unless they directly affect this seat.` };
  if (p?.county)
    return { label, area: `${p.county} county`, instruction: `Only the ${p.county} County ${label} race. Ignore other counties and other offices unless they directly affect this seat.` };
  return { label, area: "Kenya", instruction: `${label} race; electoral area not set in the campaign profile.` };
}

async function crawl(query: string, lovableKey: string, kind: string, recent = true): Promise<{ sources: Source[]; note?: string }> {
  const fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (!fc) return { sources: [], note: "Web crawler not configured." };
  try {
    const r = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": fc, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 5, country: "KE", ...(recent ? { tbs: "qdr:m" } : {}), scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
      signal: AbortSignal.timeout(45000),
    });
    if (!r.ok) return { sources: [], note: `${kind} search error ${r.status}.` };
    const d = await r.json();
    const items = Array.isArray(d.data) ? d.data : (d.data?.web ?? []);
    return {
      sources: items.filter((i: any) => i.url).map((i: any) => ({
        kind,
        title: i.title ?? i.metadata?.title ?? i.url,
        url: i.url,
        snippet: String(i.markdown ?? i.description ?? "").replace(/\s+/g, " ").slice(0, 1200),
      })),
    };
  } catch (e) {
    return { sources: [], note: `Web crawler failed: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { bot, mode, model } = body;
    let topic: string = typeof body.topic === "string" ? body.topic.trim() : "";
    if (topic.length > 500) return json({ error: "Topic too long (max 500 characters)." }, 400);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    // Load the signed-in candidate's campaign profile to scope the run.
    let profile: any = null;
    const auth = req.headers.get("Authorization");
    if (auth) {
      const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
      const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
      if (u?.user) {
        const { data } = await db.from("candidate_profiles").select("full_name, aspired_position, party, county, constituency, ward, campaign_topics").eq("user_id", u.user.id).maybeSingle();
        profile = data;
      }
    }
    const scope = scopeFor(profile);
    if (!topic) topic = profile?.full_name ?? "";
    if (!topic) return json({ error: "Enter a topic or complete your campaign profile." }, 400);

    const system = BOT_PROMPTS[bot] ?? BOT_PROMPTS.recon;
    const instr = MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.analysis;
    const useModel = model ?? "google/gemini-3-flash-preview";

    const base = `${topic} ${scope.area}${BOT_QUERY[bot] ?? ""}`.trim();
    const runs = await Promise.all([
      crawl(`${base} news`, LOVABLE_API_KEY, "News"),
      crawl(`${topic} ${scope.area} site:go.ke OR site:iebc.or.ke OR site:parliament.go.ke OR site:cog.go.ke`, LOVABLE_API_KEY, "Official", false),
      crawl(`${base} blog opinion`, LOVABLE_API_KEY, "Blog"),
    ]);
    const seen = new Set<string>();
    const sources = runs.flatMap((r) => r.sources).filter((s) => !seen.has(s.url) && seen.add(s.url)).slice(0, 14);
    const note = runs.map((r) => r.note).filter(Boolean).join(" ") || undefined;
    const evidence = sources.length
      ? sources.map((s, i) => `[${i + 1}] (${s.kind}) ${s.title} (${s.url})\n${s.snippet}`).join("\n\n")
      : "NO LIVE SOURCES FOUND.";
    const campaign = profile
      ? `Client campaign: ${profile.full_name}, aspiring ${scope.label}${profile.party ? `, ${profile.party}` : ""}. Electoral area: ${scope.area}. Priority topics: ${(profile.campaign_topics ?? []).join(", ") || "none set"}.`
      : "No campaign profile set; treat scope as national.";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: "system", content: `${system}\n\n${campaign}\nScope: ${scope.instruction}\n\nRules: Cite live evidence like [1]. You may add background from your own general knowledge, but put it in a separate section titled "Background (AI knowledge — verify before use)" and never cite it as a source. Never invent statistics, percentages, polls, or quotes. If no evidence exists for a section, say "No public evidence found". Label strategy as recommendations.` },
          { role: "user", content: `Topic / Entity: ${topic}\n\nTask: ${instr}\n\nEvidence (crawled from the public web in the last month):\n${evidence}` },
        ],
      }),
    });

    if (resp.status === 429) return json({ error: "Rate limit reached, try again shortly." }, 429);
    if (resp.status === 402) return json({ error: "AI credits exhausted. Top up workspace usage." }, 402);
    if (!resp.ok) return json({ error: `AI error ${resp.status}: ${await resp.text()}` }, resp.status === 403 ? 403 : 500);

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return json({ text, sources: sources.map(({ title, url }) => ({ title, url })), note });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
