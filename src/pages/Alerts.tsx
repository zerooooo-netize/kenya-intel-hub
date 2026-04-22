import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BellRing, CheckCircle2, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";

type Alert = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  source: string | null;
  acknowledged: boolean | null;
  created_at: string;
};

const sevColor: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/40",
  high: "bg-warning/15 text-warning border-warning/40",
  medium: "bg-accent/15 text-accent border-accent/40",
  info: "bg-primary/15 text-primary border-primary/40",
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setAlerts(data ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel("alerts-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const a = payload.new as Alert;
          setAlerts((prev) => [a, ...prev].slice(0, 100));
          toast.message(`🚨 ${a.title}`, { description: a.description ?? "" });
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acknowledge = async (id: string) => {
    const { error } = await supabase.from("alerts").update({ acknowledged: true }).eq("id", id);
    if (error) return toast.error(error.message);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const seedDemo = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const samples = [
      { title: "Trending narrative spike: SHA rollout", severity: "high", source: "X / Twitter", description: "Mentions up 240% in Nairobi over 30min." },
      { title: "Impersonation attempt detected", severity: "critical", source: "Brand Protection Bot", description: "Fake handle @candidate_ke gaining traction." },
      { title: "Sentiment shift detected", severity: "medium", source: "Sentiment Engine", description: "Kisumu sentiment turned negative on Hustler Fund topic." },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const { error } = await supabase.from("alerts").insert(pick);
    if (error) toast.error(error.message);
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Realtime Operations"
          title="Live signal"
          highlight="feed."
          icon={BellRing}
          description="Streaming intelligence pushed via WebSocket from bots, sentiment engines, and brand monitors — the moment something moves, you know."
          actions={
            <>
              <Badge variant="outline" className={live ? "border-success/40 text-success" : "border-muted"}>
                <Radio className={`h-3 w-3 mr-1 ${live ? "animate-pulse" : ""}`} /> {live ? "LIVE" : "Connecting…"}
              </Badge>
              <Button variant="outline" size="sm" onClick={seedDemo}>Simulate Alert</Button>
            </>
          }
        />

        {loading ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : alerts.length === 0 ? (
          <Card className="glass border-border/60">
            <CardContent className="text-center py-12 text-sm text-muted-foreground">
              No alerts yet. Use "Simulate Alert" to test the realtime pipeline, or wait for bots to trigger.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <Card key={a.id} className={`glass border-border/60 ${a.acknowledged ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${sevColor[a.severity] ?? sevColor.info}`}>
                    {a.severity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{a.title}</div>
                    {a.description && <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>}
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> {a.source ?? "system"} · {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!a.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => acknowledge(a.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Alerts;
