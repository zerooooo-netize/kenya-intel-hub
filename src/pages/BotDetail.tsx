import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Radar, Shield, Eye, AlertTriangle, Lock, Brain, Loader2, Sparkles, ArrowLeft, FileText } from "lucide-react";

const BOT_META: Record<string, { name: string; icon: any; color: string; tagline: string; capabilities: string[] }> = {
  recon: {
    name: "Recon Bot", icon: Radar, color: "hsl(265 95% 66%)",
    tagline: "Public data aggregation across social, news, and OSINT sources.",
    capabilities: ["Mention scraping", "Entity discovery", "Geo-tagging", "Source diversity scoring"],
  },
  vulnerability: {
    name: "Vulnerability Bot", icon: Shield, color: "hsl(0 85% 62%)",
    tagline: "Detects exposure and digital risk via public-only data.",
    capabilities: ["Leaked credential detection (HIBP)", "Domain exposure", "Surface-area mapping", "Risk scoring"],
  },
  identity: {
    name: "Identity Bot", icon: Eye, color: "hsl(205 100% 65%)",
    tagline: "Cross-platform identity correlation and entity resolution.",
    capabilities: ["Handle correlation", "Persona graphing", "Coordinated activity detection"],
  },
  threat_intel: {
    name: "Threat Intel Bot", icon: AlertTriangle, color: "hsl(38 95% 60%)",
    tagline: "Anomaly detection, narrative scoring, predictive risk.",
    capabilities: ["Spike detection", "Narrative classification", "Predictive trend modeling"],
  },
  brand_protection: {
    name: "Brand Protection Bot", icon: Lock, color: "hsl(150 85% 55%)",
    tagline: "Impersonation, defamation, and reputation monitoring.",
    capabilities: ["Impersonation alerts", "Brand mention triage", "Sentiment shift alerts"],
  },
  deep_dive: {
    name: "Deep Dive Bot", icon: Brain, color: "hsl(290 80% 70%)",
    tagline: "Combines all modules into a comprehensive AI report.",
    capabilities: ["Multi-source synthesis", "Press briefing builder", "Strategy recommendations"],
  },
};

const BotDetail = () => {
  const { botKey } = useParams<{ botKey: string }>();
  const meta = BOT_META[botKey ?? ""];
  const [moduleCfg, setModuleCfg] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [note, setNote] = useState<string | undefined>();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!botKey) return;
    supabase.from("module_settings").select("*").eq("module_key", botKey).maybeSingle().then(({ data }) => setModuleCfg(data));
    supabase.from("api_connections").select("provider, display_name, category, enabled, status").then(({ data }) => setConnections(data ?? []));
  }, [botKey]);

  if (!meta) return <AppShell><div className="text-center py-20 text-muted-foreground">Unknown bot.</div></AppShell>;

  const Icon = meta.icon;
  const enabledSources = connections.filter((c) => c.enabled);

  const runAnalysis = async (mode: "analysis" | "narrative" | "briefing") => {
    if (!topic.trim()) return toast.error("Enter a topic or entity to analyze");
    setRunning(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { bot: botKey, mode, topic, model: moduleCfg?.ai_model },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data.text ?? "(no output)");
      setSources(data.sources ?? []);
      setNote(data.note);
      await supabase.from("system_logs").insert({
        level: "info", source: `bot:${botKey}`, message: `${mode} run for "${topic}"`,
      });
    } catch (e: any) {
      toast.error(e.message ?? "Run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-smooth">
          <ArrowLeft className="h-3 w-3" /> Back to Dashboard
        </Link>

        <header className="rounded-3xl glass p-7 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(265 95% 70%) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: meta.color }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-[10px] font-semibold tracking-[0.28em] text-primary uppercase">Module · {botKey}</span>
            </div>
            <div className="flex items-start gap-5 flex-wrap">
              <div className="h-16 w-16 rounded-2xl grid place-items-center shrink-0 shadow-glow" style={{ background: `linear-gradient(135deg, ${meta.color}, hsl(265 95% 66%))` }}>
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-3xl lg:text-[40px] font-bold tracking-tight leading-[1.05]">
                  {meta.name.split(" ").slice(0, -1).join(" ")} <span className="font-editorial italic font-medium text-gradient">{meta.name.split(" ").slice(-1)[0]}</span>
                </h1>
                <p className="text-muted-foreground text-sm lg:text-[15px] mt-3 max-w-2xl leading-relaxed">{meta.tagline}</p>
              </div>
              <Badge variant={moduleCfg?.enabled ? "default" : "outline"} className="text-xs">
                {moduleCfg?.enabled ? "● ACTIVE" : "○ DISABLED"}
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 glass border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Analysis Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='e.g. "SHA/SHIF rollout sentiment in Mt Kenya region"'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => runAnalysis("analysis")} disabled={running} className="bg-gradient-primary">
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Analysis"}
                </Button>
                <Button onClick={() => runAnalysis("narrative")} disabled={running} variant="secondary">
                  Detect Narrative
                </Button>
                <Button onClick={() => runAnalysis("briefing")} disabled={running} variant="outline">
                  <FileText className="h-3.5 w-3.5 mr-1" /> AI Briefing
                </Button>
              </div>
              <div className="rounded-xl bg-secondary/40 border border-border/60 p-4 min-h-[260px] text-sm whitespace-pre-wrap">
                {running ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Crawling public sources and synthesising…</div>
                ) : output ? output : (
                  <span className="text-muted-foreground text-xs">Output will appear here. Each run searches the public web, then AI analyses what it finds.</span>
                )}
              </div>
              {!running && output && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold">Sources ({sources.length})</div>
                  {sources.length === 0 && <div className="text-xs text-muted-foreground">{note ?? "No public sources found for this topic."}</div>}
                  {sources.map((s, i) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline truncate">[{i + 1}] {s.title}</a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="glass border-border/60">
              <CardHeader><CardTitle className="text-sm">Capabilities</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  {meta.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass border-border/60">
              <CardHeader><CardTitle className="text-sm">Connected Sources</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {enabledSources.length === 0 && (
                  <div className="text-xs text-muted-foreground">No sources enabled. Ask an admin to configure API keys in the Admin Panel.</div>
                )}
                {enabledSources.map((c) => (
                  <div key={c.provider} className="flex items-center justify-between text-xs">
                    <span>{c.display_name}</span>
                    <Badge variant="outline" className="text-[9px] uppercase">{c.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default BotDetail;
