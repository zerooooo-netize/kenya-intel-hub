import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";

export const SystemSettings = () => {
  const [s, setS] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("system_settings").select("*").then(({ data }) => {
      const m: Record<string, any> = {};
      (data ?? []).forEach((r: any) => (m[r.key] = r.value));
      setS(m);
      setLoading(false);
    });
  }, []);

  const update = (k: string, v: any) => setS((p) => ({ ...p, [k]: v }));

  const save = async () => {
    await Promise.all(
      Object.entries(s).map(([key, value]) =>
        supabase.from("system_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key)
      )
    );
    toast.success("System settings updated");
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card className="glass border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <Label className="text-xs">Platform Name</Label>
          <Input value={s.platform_name ?? ""} onChange={(e) => update("platform_name", e.target.value)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-secondary/30">
          <div>
            <div className="text-sm font-medium">Realtime Alerts</div>
            <div className="text-xs text-muted-foreground">Push WebSocket alerts to dashboards.</div>
          </div>
          <Switch checked={!!s.alerts_enabled} onCheckedChange={(v) => update("alerts_enabled", v)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Polling Interval (seconds)</Label>
          <Input type="number" value={s.realtime_polling_seconds ?? 30} onChange={(e) => update("realtime_polling_seconds", Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Data Retention (days)</Label>
          <Input type="number" value={s.data_retention_days ?? 90} onChange={(e) => update("data_retention_days", Number(e.target.value))} />
        </div>
        <Button onClick={save} className="bg-gradient-primary"><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
