import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, Brain } from "lucide-react";
import { toast } from "sonner";

const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5-mini",
];
const TONES = ["analytical", "persuasive", "neutral", "bold"];
const LANGS = [
  { v: "en", l: "English" },
  { v: "sw", l: "Kiswahili" },
  { v: "mixed", l: "English + Sheng" },
];

export const AIBehavior = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("ai_settings").select("*").then(({ data }) => {
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => (map[r.key] = r.value));
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const update = (k: string, v: any) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("ai_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key)
    );
    await Promise.all(updates);
    toast.success("AI behavior updated");
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card className="glass border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Behavior Tuning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs">Default Model</Label>
          <select
            className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm"
            value={settings.default_model ?? ""}
            onChange={(e) => update("default_model", e.target.value)}
          >
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Tone</Label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map((t) => (
              <Button key={t} size="sm" variant={settings.tone === t ? "default" : "outline"} onClick={() => update("tone", t)} className="capitalize">
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Output Language</Label>
          <div className="flex gap-2 flex-wrap">
            {LANGS.map((l) => (
              <Button key={l.v} size="sm" variant={settings.language === l.v ? "default" : "outline"} onClick={() => update("language", l.v)}>
                {l.l}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Creativity (Temperature) — {settings.temperature ?? 0.7}</Label>
          <Slider value={[Number(settings.temperature ?? 0.7) * 100]} max={100} step={5} onValueChange={(v) => update("temperature", v[0] / 100)} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Max Output Tokens — {settings.max_tokens ?? 2048}</Label>
          <Slider value={[Number(settings.max_tokens ?? 2048)]} min={256} max={8192} step={128} onValueChange={(v) => update("max_tokens", v[0])} />
        </div>

        <Button onClick={save} className="bg-gradient-primary"><Save className="h-3.5 w-3.5 mr-1" /> Save AI Settings</Button>
      </CardContent>
    </Card>
  );
};

export default AIBehavior;
