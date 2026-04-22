import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Download, Filter, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  source: string | null;
  created_at: string;
};

const DataExplorer = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQ = !q || r.title.toLowerCase().includes(q.toLowerCase()) || (r.description ?? "").toLowerCase().includes(q.toLowerCase()) || (r.source ?? "").toLowerCase().includes(q.toLowerCase());
      const matchesSev = sev === "all" || r.severity === sev;
      return matchesQ && matchesSev;
    });
  }, [rows, q, sev]);

  const exportCsv = () => {
    const header = ["id", "title", "description", "severity", "source", "created_at"];
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        header
          .map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zero-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows`);
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Analyst Workbench"
          title="Data"
          highlight="explorer."
          icon={Database}
          description="Search, filter and export every raw intelligence signal across all your sources — built for the analysts who chase the truth."
          actions={<Button onClick={exportCsv} className="bg-gradient-primary"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>}
        />

        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, source, description…" className="pl-9" />
            </div>
            <Select value={sev} onValueChange={setSev}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Results <Badge variant="secondary">{filtered.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{r.severity}</Badge></TableCell>
                      <TableCell className="text-xs">{r.source ?? "—"}</TableCell>
                      <TableCell className="font-medium text-sm">{r.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md truncate">{r.description ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No matching records.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default DataExplorer;
