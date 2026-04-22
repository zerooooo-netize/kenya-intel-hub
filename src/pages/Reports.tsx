import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateReportPDF } from "@/lib/pdf";

const TEMPLATES = [
  { key: "weekly_brief", name: "Weekly Intelligence Brief", desc: "Executive summary of mentions, narratives & sentiment." },
  { key: "threat_report", name: "Threat & Risk Report", desc: "Detailed threat scoring, anomalies & impersonation." },
  { key: "competitor_scan", name: "Competitor Scan", desc: "Share-of-voice, positioning, and narrative comparison." },
  { key: "press_briefing", name: "Press Briefing", desc: "Journalist-ready talking points & Q&A prep." },
  { key: "campaign_strategy", name: "Campaign Strategy", desc: "Narrative recommendations & target counties." },
];

const Reports = () => {
  const [topic, setTopic] = useState("Healthcare reform — SHA rollout sentiment");
  const [audience, setAudience] = useState("Campaign principal");
  const [template, setTemplate] = useState(TEMPLATES[0].key);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setHistory(data ?? []));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const tmpl = TEMPLATES.find((t) => t.key === template)!;
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: {
          mode: "briefing",
          bot: "deep_dive",
          topic,
          audience,
          template: tmpl.name,
        },
      });
      if (error) throw error;

      const sections = parseSections(data?.text ?? data?.output ?? "No content generated.");
      generateReportPDF({
        title: tmpl.name,
        subtitle: topic,
        author: audience,
        sections,
        table: {
          columns: ["Source", "Severity", "Signal"],
          rows: history.slice(0, 8).map((a) => [a.source ?? "—", a.severity, a.title]),
        },
      });

      // log usage
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("usage_events").insert({
          user_id: u.user.id,
          event_type: "report_generated",
          resource: template,
          metadata: { topic },
        });
      }
      toast.success("Report PDF generated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Reports Studio"
          title="Intelligence"
          highlight="briefings."
          icon={FileText}
          description="Compose journalist-ready PDF briefings powered by ZERO AI from live signals — designed like an editorial dossier, ready in seconds."
        />

        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <Card className="glass border-border/60">
            <CardHeader><CardTitle className="text-base">Configure Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">Template</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTemplate(t.key)}
                      className={`text-left p-3 rounded-lg border transition-smooth ${
                        template === t.key
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-secondary/30 hover:border-primary/40"
                      }`}
                    >
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Topic / Brief</Label>
                <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Audience</Label>
                <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>

              <Button disabled={generating} onClick={generate} className="w-full bg-gradient-primary">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate PDF Report
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-border/60">
            <CardHeader><CardTitle className="text-base">Recent Signals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No signals yet — bots are idle.</div>
              ) : history.slice(0, 6).map((a) => (
                <div key={a.id} className="text-xs p-2 rounded bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{a.title}</span>
                    <Badge variant="outline" className="text-[9px] capitalize ml-2">{a.severity}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{a.source ?? "system"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

const parseSections = (raw: string): { heading: string; body: string }[] => {
  // Split on markdown-like headings or fallback to single section
  const blocks = raw.split(/\n(?=#{1,3} )/g);
  if (blocks.length <= 1) {
    return [{ heading: "Executive Summary", body: raw.trim() }];
  }
  return blocks.map((b) => {
    const m = b.match(/^#{1,3}\s+(.+?)\n([\s\S]*)$/);
    if (m) return { heading: m[1].trim(), body: m[2].trim() };
    return { heading: "Section", body: b.trim() };
  });
};

export default Reports;
