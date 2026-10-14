import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

type Source = { title: string; url: string; snippet: string };

async function crawl(query: string, lovableKey: string): Promise<{ sources: Source[]; note?: string }> {
  const fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (!fc) return { sources: [], note: "Web crawler not configured." };
  try {
    const r = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": fc, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 8, country: "KE", tbs: "qdr:m", scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
      signal: AbortSignal.timeout(45000),
    });
    if (!r.ok) return { sources: [], note: `Web crawler error ${r.status}: ${(await r.text()).slice(0, 200)}` };
    const d = await r.json();
    const items = Array.isArray(d.data) ? d.data : (d.data?.web ?? []);
    return {
      sources: items.filter((i: any) => i.url).map((i: any) => ({
        title: i.title ?? i.metadata?.title ?? i.url,
        url: i.url,
        snippet: String(i.markdown ?? i.description ?? "").replace(/\s+/g, " ").slice(0, 1500),
      })),
    };
  } catch (e) {
    return { sources: [], note: `Web crawler failed: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { bot, mode, topic, model } = await req.json();
    if (typeof topic !== "string" || !topic.trim() || topic.length > 500) return json({ error: "Topic is required (max 500 characters)." }, 400);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const system = BOT_PROMPTS[bot] ?? BOT_PROMPTS.recon;
    const instr = MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.analysis;
    const useModel = model ?? "google/gemini-3-flash-preview";

    const { sources, note } = await crawl(`${topic} Kenya${BOT_QUERY[bot] ?? ""}`, LOVABLE_API_KEY);
    const evidence = sources.length
      ? sources.map((s, i) => `[${i + 1}] ${s.title} (${s.url})\n${s.snippet}`).join("\n\n")
      : "NO LIVE SOURCES FOUND.";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: "system", content: `${system}\n\nRules: Base factual claims ONLY on the numbered evidence and cite them like [1]. Never invent statistics, percentages, polls, or quotes. If evidence is missing for a section, say "No public evidence found" for it. Strategy recommendations may be your own judgement but must be labelled as recommendations.` },
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
