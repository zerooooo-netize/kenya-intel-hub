import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const COUNTIES = ["Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"];
const ELECTIONS = ["2022-presidential", "2017-presidential", "2013-presidential"];

const ResultSchema = z.object({
  county: z.string().min(1, "Pick a county"),
  registered_voters: z.coerce.number().int().positive("Registered voters must be above 0"),
  votes_cast: z.coerce.number().int().min(0),
  source_title: z.string().trim().min(3, "Name the source document").max(200),
  source_url: z.string().trim().url("Enter the link to the published source"),
  published_on: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine((v) => v.votes_cast <= v.registered_voters, { message: "Votes cast cannot exceed registered voters", path: ["votes_cast"] });

type Evidence = { id: string; county: string; pct: number; registered: number; cast: number; source: string; url: string; date: string | null; origin: string };

export default function Turnout() {
  const { user, isAnalyst } = useAuth();
  const [election, setElection] = useState(ELECTIONS[0]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ county: "", registered_voters: "", votes_cast: "", source_title: "", source_url: "", published_on: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ report: string; evidence: Evidence[]; unavailable: string[] } | null>(null);

  const load = () => supabase.from("analyst_results").select("*").eq("election", election).order("county").then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); setResult(null); }, [election]);

  const save = async () => {
    const p = ResultSchema.safeParse(form);
    if (!p.success) return toast.error(p.error.issues[0].message);
    setSaving(true);
    const { error } = await supabase.from("analyst_results").insert({ ...p.data, published_on: p.data.published_on || null, notes: p.data.notes || null, election, submitted_by: user!.id } as any);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${p.data.county} result saved`);
    setForm({ county: "", registered_voters: "", votes_cast: "", source_title: "", source_url: "", published_on: "", notes: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("analyst_results").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const compare = async () => {
    if (!picked.length) return toast.error("Pick at least one county");
    setRunning(true); setResult(null);
    const { data, error } = await supabase.functions.invoke("turnout-compare", { body: { election, counties: picked } });
    setRunning(false);
    if (error || data?.error) {
      let msg = data?.error;
      try { msg ??= (await (error as any).context?.json())?.error; } catch { /* ignore */ }
      return toast.error(msg ?? "Comparison failed");
    }
    setResult(data);
  };

  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const set = (k: keyof typeof form) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader eyebrow="Electoral evidence" title="County" highlight="turnout" icon={BarChart3}
          description="Record published results with their sources, then compare counties. Anything without a verified source is shown as unavailable — never estimated."
          actions={
            <Select value={election} onValueChange={setElection}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>{ELECTIONS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          } />

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="glass lg:col-span-2">
            <CardHeader><CardTitle className="font-display">Add a verified result</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!isAnalyst ? (
                <p className="text-sm text-muted-foreground">Only analysts and admins can add results. You can still run comparisons.</p>
              ) : (
                <>
                  <div><Label>County</Label>
                    <Select value={form.county} onValueChange={(v) => setForm({ ...form, county: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose county" /></SelectTrigger>
                      <SelectContent>{COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Registered voters</Label><Input inputMode="numeric" value={form.registered_voters} onChange={set("registered_voters")} /></div>
                    <div><Label>Votes cast</Label><Input inputMode="numeric" value={form.votes_cast} onChange={set("votes_cast")} /></div>
                  </div>
                  <div><Label>Source document</Label><Input placeholder="e.g. IEBC Form 34B, Nakuru" value={form.source_title} onChange={set("source_title")} /></div>
                  <div><Label>Source link</Label><Input placeholder="https://www.iebc.or.ke/..." value={form.source_url} onChange={set("source_url")} /></div>
                  <div><Label>Published on</Label><Input type="date" value={form.published_on} onChange={set("published_on")} /></div>
                  <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={set("notes")} /></div>
                  <Button onClick={save} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save result</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-3">
            <CardHeader><CardTitle className="font-display">Recorded results · {rows.length}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {rows.length === 0 ? <p className="text-sm text-muted-foreground">No analyst results for this election yet.</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead>County</TableHead><TableHead>Turnout</TableHead><TableHead>Source</TableHead><TableHead /></TableRow></TableHeader>
                  <TableBody>{rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.county}</TableCell>
                      <TableCell>{Number(r.turnout_pct).toFixed(2)}%<div className="text-xs text-muted-foreground">{Number(r.votes_cast).toLocaleString()} / {Number(r.registered_voters).toLocaleString()}</div></TableCell>
                      <TableCell><a href={r.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">{r.source_title}</a>{r.published_on && <div className="text-xs text-muted-foreground">{r.published_on}</div>}</TableCell>
                      <TableCell>{r.submitted_by === user?.id && <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>}</TableCell>
                    </TableRow>))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="font-display">Compare counties</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPicked([])}>Clear</Button>
              <Button onClick={compare} disabled={running}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate comparison</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {COUNTIES.map((c) => (
                <button key={c} onClick={() => toggle(c)} className={`rounded-full border px-3 py-1 text-xs transition ${picked.includes(c) ? "border-primary bg-primary/20 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
              ))}
            </div>

            {result && (
              <div className="space-y-4">
                {result.unavailable.length > 0 && (
                  <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                    <span className="font-semibold">Data unavailable — no verified source:</span> {result.unavailable.join(", ")}
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed rounded-xl bg-muted/30 p-4">{result.report}</pre>
                {result.evidence.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Evidence</div>
                    <ul className="space-y-1 text-sm">{result.evidence.map((e) => (
                      <li key={e.id}><Badge variant="outline" className="mr-2">{e.id}</Badge>{e.county} · {e.pct}% · <a className="text-primary hover:underline" href={e.url} target="_blank" rel="noreferrer">{e.source}</a> <span className="text-muted-foreground">({e.origin}{e.date ? `, ${e.date}` : ""})</span></li>
                    ))}</ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
