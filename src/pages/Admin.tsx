import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Save, Shield, Database, Cog, FileWarning, Users, Brain, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import AIBehavior from "./admin/AIBehavior";
import SystemSettings from "./admin/SystemSettings";
import UsageAnalytics from "./admin/UsageAnalytics";

type Conn = {
  id: string;
  provider: string;
  category: string;
  display_name: string;
  api_key: string | null;
  api_secret: string | null;
  enabled: boolean;
  rate_limit_per_min: number | null;
  status: string;
};
type Module = {
  id: string;
  module_key: string;
  display_name: string;
  enabled: boolean;
  ai_model: string;
};

const Admin = () => {
  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Mission Operations"
          title="Admin"
          highlight="control panel."
          icon={Shield}
          description="Manage data sources, users, modules, AI behavior and system logs — everything ZERO touches, in one place."
          actions={<Badge variant="outline" className="border-success/40 text-success">RBAC Enforced</Badge>}
        />

        <Tabs defaultValue="connections" className="space-y-4">
          <TabsList className="bg-secondary/40 flex-wrap h-auto">
            <TabsTrigger value="connections"><Database className="h-4 w-4 mr-2" />API Connections</TabsTrigger>
            <TabsTrigger value="modules"><Cog className="h-4 w-4 mr-2" />Modules</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="h-4 w-4 mr-2" />AI Behavior</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Users & Roles</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="h-4 w-4 mr-2" />System Settings</TabsTrigger>
            <TabsTrigger value="usage"><BarChart3 className="h-4 w-4 mr-2" />Usage Analytics</TabsTrigger>
            <TabsTrigger value="logs"><FileWarning className="h-4 w-4 mr-2" />System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="connections"><ApiConnections /></TabsContent>
          <TabsContent value="modules"><ModulesPanel /></TabsContent>
          <TabsContent value="ai"><AIBehavior /></TabsContent>
          <TabsContent value="users"><UsersPanel /></TabsContent>
          <TabsContent value="settings"><SystemSettings /></TabsContent>
          <TabsContent value="usage"><UsageAnalytics /></TabsContent>
          <TabsContent value="logs"><LogsPanel /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

const CATEGORY_LABEL: Record<string, string> = {
  social: "Social Media",
  news: "News & Media",
  osint: "OSINT & Dark Web",
  ai: "AI Providers (BYO)",
  comms: "Communications",
};

const ApiConnections = () => {
  const [conns, setConns] = useState<Conn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("api_connections").select("*").order("category").order("display_name");
    if (error) toast.error(error.message);
    setConns(data ?? []);
    setLoading(false);
  };

  const update = async (id: string, patch: Partial<Conn>) => {
    setConns((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const save = async (c: Conn) => {
    const status = c.api_key ? "configured" : "unconfigured";
    const { error } = await supabase
      .from("api_connections")
      .update({
        api_key: c.api_key,
        api_secret: c.api_secret,
        enabled: c.enabled,
        rate_limit_per_min: c.rate_limit_per_min,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(`${c.display_name} saved`);
    load();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const grouped = conns.reduce<Record<string, Conn[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, list]) => (
        <Card key={cat} className="glass border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {CATEGORY_LABEL[cat] ?? cat}
              <Badge variant="secondary" className="text-[10px]">{list.length} providers</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {list.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{c.display_name}</div>
                    <Badge variant={c.status === "configured" ? "default" : "outline"} className="text-[10px] capitalize">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Enabled</span>
                    <Switch checked={c.enabled} onCheckedChange={(v) => update(c.id, { enabled: v })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">API Key</Label>
                    <Input
                      type="password"
                      placeholder="paste key…"
                      value={c.api_key ?? ""}
                      onChange={(e) => update(c.id, { api_key: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">API Secret (optional)</Label>
                    <Input
                      type="password"
                      placeholder="paste secret…"
                      value={c.api_secret ?? ""}
                      onChange={(e) => update(c.id, { api_secret: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rate limit / min</Label>
                    <Input
                      type="number"
                      value={c.rate_limit_per_min ?? 60}
                      onChange={(e) => update(c.id, { rate_limit_per_min: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => save(c)} className="bg-gradient-primary">
                    <Save className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AI_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5-mini",
];

const ModulesPanel = () => {
  const [mods, setMods] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("module_settings").select("*").order("display_name").then(({ data, error }) => {
      if (error) toast.error(error.message);
      setMods(data ?? []);
      setLoading(false);
    });
  }, []);

  const update = (id: string, patch: Partial<Module>) =>
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const save = async (m: Module) => {
    const { error } = await supabase
      .from("module_settings")
      .update({ enabled: m.enabled, ai_model: m.ai_model, updated_at: new Date().toISOString() })
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success(`${m.display_name} updated`);
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {mods.map((m) => (
        <Card key={m.id} className="glass border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {m.display_name}
              <Switch checked={m.enabled} onCheckedChange={(v) => update(m.id, { enabled: v })} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">AI Model</Label>
              <select
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm"
                value={m.ai_model}
                onChange={(e) => update(m.id, { ai_model: e.target.value })}
              >
                {AI_MODELS.map((mod) => <option key={mod} value={mod}>{mod}</option>)}
              </select>
            </div>
            <Button size="sm" onClick={() => save(m)} className="w-full bg-gradient-primary">
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const UsersPanel = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const merged = (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
    setRows(merged);
    setLoading(false);
  };

  const setRole = async (userId: string, role: "admin" | "analyst" | "viewer", current: string[]) => {
    if (current.includes(role)) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role });
    }
    toast.success("Role updated");
    load();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card className="glass border-border/60">
      <CardHeader><CardTitle className="text-base">Users</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name ?? u.id.slice(0, 8)}</TableCell>
                <TableCell className="space-x-1">
                  {u.roles.map((r: string) => <Badge key={r} className="capitalize">{r}</Badge>)}
                  {u.roles.length === 0 && <span className="text-xs text-muted-foreground">no role</span>}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {(["admin", "analyst", "viewer"] as const).map((r) => (
                    <Button key={r} size="sm" variant={u.roles.includes(r) ? "default" : "outline"} onClick={() => setRole(u.id, r, u.roles)} className="capitalize text-xs">
                      {r}
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const LogsPanel = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setLogs(data ?? []));
  }, []);

  return (
    <Card className="glass border-border/60">
      <CardHeader><CardTitle className="text-base">Recent System Logs</CardTitle></CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">No logs yet. They'll appear as bots run.</div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {logs.map((l) => (
              <div key={l.id} className="flex gap-3 p-2 rounded bg-secondary/40">
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
                <Badge variant="outline" className="uppercase">{l.level}</Badge>
                <span className="text-primary">{l.source}</span>
                <span className="flex-1">{l.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Admin;
