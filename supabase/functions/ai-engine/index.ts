import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_PROMPTS: Record<string, string> = {
  recon: "You are Recon Bot for ZERO Intelligence (Kenya). Aggregate and summarise public mentions, key entities, source breakdown and geographic hotspots.",
  vulnerability: "You are Vulnerability Bot. Identify exposure risks (leaked credentials, exposed surfaces) using only public/compliant data signals. Never suggest unauthorized access.",
  identity: "You are Identity Bot. Correlate handles and personas across platforms; flag possible coordinated inauthentic behaviour.",
  threat_intel: "You are Threat Intel Bot. Score risk, detect anomalies and predict short-term narrative trajectory.",
  brand_protection: "You are Brand Protection Bot. Detect impersonation, defamation patterns and reputation shifts; recommend defensive actions.",
  deep_dive: "You are Deep Dive Bot. Synthesize a complete intelligence dossier combining recon, vulnerability, identity, threat intel and brand protection.",
};

const MODE_INSTRUCTIONS: Record<string, string> = {
  analysis: "Produce a concise multi-section analysis with: Summary, Key Signals, Risks, Opportunities, Recommended Actions.",
  narrative: "Identify the dominant narratives, who is pushing them, sentiment direction, and likely 48-hour trajectory.",
  briefing: "Write a press-ready intelligence briefing for a Kenyan political/campaign principal: 1-paragraph executive summary, 4 bullets of key facts, 2 quotable lines, and 3 recommended messaging angles.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bot, mode, topic, model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const system = BOT_PROMPTS[bot] ?? BOT_PROMPTS.recon;
    const instr = MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.analysis;
    const useModel = model ?? "google/gemini-3-flash-preview";

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: "system", content: `${system}\n\nContext: Kenya political & brand intelligence platform. Be specific, factual-sounding, and structured.` },
          { role: "user", content: `Topic / Entity: ${topic}\n\nTask: ${instr}` },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Top up workspace usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `AI error ${resp.status}: ${t}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
