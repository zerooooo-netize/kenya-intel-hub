import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const UsageAnalytics = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("usage_events").select("event_type, created_at, resource").order("created_at", { ascending: false }).limit(1000)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const byType = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.event_type] = (acc[r.event_type] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const byDay = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).reverse().slice(0, 14).reverse();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="glass border-border/60 md:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Total Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-bold text-primary">{rows.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Last 1,000 records</div>
        </CardContent>
      </Card>

      <Card className="glass border-border/60 md:col-span-2">
        <CardHeader><CardTitle className="text-base">Events / Day</CardTitle></CardHeader>
        <CardContent style={{ height: 220 }}>
          {byDay.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">No usage logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-border/60 md:col-span-3">
        <CardHeader><CardTitle className="text-base">Events by Type</CardTitle></CardHeader>
        <CardContent style={{ height: 240 }}>
          {byType.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">No usage logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={140} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;
