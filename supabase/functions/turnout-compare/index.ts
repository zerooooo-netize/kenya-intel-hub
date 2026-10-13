// Builds a county turnout comparison from verified records only.
// Counties without a verified IEBC record or analyst-submitted cited result are flagged unavailable
// before the model is called, so the model never sees (or invents) figures for them.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  election: z.string().min(1).max(60),
  counties: z.array(z.string().min(1).max(40)).min(1).max(47),
});
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("Authorization") ?? "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
  if (!u?.user) return json({ error: "Please sign in." }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Choose an election and at least one county." }, 400);
  const { election, counties } = parsed.data;

  const [{ data: official }, { data: analyst }] = await Promise.all([
    db.from("turnout_results").select("*").eq("election", election).eq("scope", "county").eq("verified", true).in("county", counties),
    db.from("analyst_results").select("*").eq("election", election).in("county", counties).order("created_at", { ascending: false }),
  ]);

  type Ev = { id: string; county: string; registered: number; cast: number; pct: number; source: string; url: string; date: string | null; origin: string };
  const evidence: Ev[] = [];
  (official ?? []).forEach((r: any) => evidence.push({ id: "", county: r.county, registered: r.registered_voters, cast: r.votes_cast, pct: Number(r.turnout_pct), source: r.source_title, url: r.source_url, date: r.published_on, origin: "IEBC (auto-collected)" }));
  (analyst ?? []).forEach((r: any) => evidence.push({ id: "", county: r.county, registered: r.registered_voters, cast: r.votes_cast, pct: Number(r.turnout_pct), source: r.source_title, url: r.source_url, date: r.published_on, origin: "Analyst-provided" }));
  evidence.forEach((e, i) => (e.id = `S${i + 1}`));
  const covered = new Set(evidence.map((e) => e.county));
  const unavailable = counties.filter((c) => !covered.has(c));

  if (!evidence.length) {
    const report = `No verified turnout data is available for ${counties.join(", ")} in ${election}. Add a cited result to enable a comparison.`;
    return json({ report, evidence, unavailable });
  }

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "AI is not configured." }, 500);

  const instructions = `You are an electoral analyst for Kenya. Compare county-level voter turnout using ONLY the evidence rows provided.
Rules: cite every figure with its evidence id in square brackets, e.g. [S2]. Never estimate, infer or introduce numbers not in the evidence.
If two sources disagree for a county, point out the discrepancy and cite both. Do not speculate about ethnicity or voting preference.
For these counties write exactly "Data unavailable — no verified source" and nothing else about them: ${unavailable.join(", ") || "none"}.
Structure (markdown): ## Summary, ## County comparison (table: County | Turnout | Registered | Votes cast | Source), ## Notable differences, ## Data gaps.`;
  const input = `Election: ${election}\nEvidence:\n${evidence.map((e) => `[${e.id}] ${e.county}: ${e.pct}% turnout, ${e.cast} votes cast of ${e.registered} registered. Source: ${e.source} (${e.origin}${e.date ? ", published " + e.date : ""}) ${e.url}`).join("\n")}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: "openai/gpt-6-astra", instructions, input, stream: true, store: false, reasoning: { effort: "low" } }),
    signal: req.signal,
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    let msg = "The AI service could not complete the comparison.";
    try { msg = JSON.parse(t)?.error?.message ?? JSON.parse(t)?.message ?? msg; } catch { /* keep default */ }
    if (res.status === 429) msg = "Too many requests right now — try again in a minute.";
    return json({ error: msg }, res.status === 403 || res.status === 402 || res.status === 429 ? res.status : 502);
  }

  // Consume the SSE stream and collect output text.
  let report = "", buf = "";
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") report += ev.delta;
        if (ev.type === "response.failed" || ev.type === "error") return json({ error: ev.response?.error?.message ?? ev.message ?? "AI request failed." }, 502);
      } catch { /* partial line */ }
    }
  }
  if (!report.trim()) return json({ error: "The AI returned no comparison for this request." }, 502);

  await db.from("turnout_comparisons").insert({ created_by: u.user.id, election, counties, report, unavailable });
  return json({ report, evidence, unavailable });
});
