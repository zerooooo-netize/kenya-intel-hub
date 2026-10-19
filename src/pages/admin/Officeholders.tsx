import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { OFFICE_LABEL, OfficeLevel } from "@/hooks/useOfficeholders";
import { WARDS_PER_COUNTY } from "@/data/wardCounts";

const EMPTY = { level: "governor" as OfficeLevel, full_name: "", party: "", county: "", constituency: "", ward: "", photo_url: "", source_title: "", source_url: "", verified_on: "" };
const isUrl = (u: string) => /^https:\/\/\S+$/.test(u);

const Officeholders = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState(EMPTY);

  const load = async () => {
    const { data, error } = await supabase.from("officeholders").select("*").order("level").order("county");
    if (error) toast.error(error.message);
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const needs = { county: !["president", "deputy_president"].includes(f.level), constituency: ["mp", "mca"].includes(f.level), ward: f.level === "mca" };

  const save = async () => {
    if (!f.full_name.trim()) return toast.error("Name is required");
    if (needs.county && !f.county) return toast.error("County is required for this office");
    if (needs.constituency && !f.constituency.trim()) return toast.error("Constituency is required");
    if (needs.ward && !f.ward.trim()) return toast.error("Ward is required");
    if (!f.source_title.trim() || !isUrl(f.source_url)) return toast.error("Add a source name and an https:// source link");
    if (f.photo_url && !isUrl(f.photo_url)) return toast.error("Photo must be an https:// link");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("officeholders").insert({
      ...f, party: f.party || null, county: needs.county ? f.county : null, constituency: needs.constituency ? f.constituency : null,
      ward: needs.ward ? f.ward : null, photo_url: f.photo_url || null, verified_on: f.verified_on || null, added_by: u.user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Officeholder added");
    setF(EMPTY);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("officeholders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const set = (k: keyof typeof EMPTY) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <Card className="glass border-border/60">
        <CardHeader><CardTitle className="text-base">Add a verified officeholder</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="space-y-1">
            <Label className="text-xs">Office</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={f.level} onChange={set("level")}>
              {Object.entries(OFFICE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label className="text-xs">Full name</Label><Input value={f.full_name} onChange={set("full_name")} /></div>
          <div className="space-y-1"><Label className="text-xs">Party</Label><Input value={f.party} onChange={set("party")} /></div>
          {needs.county && (
            <div className="space-y-1">
              <Label className="text-xs">County</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={f.county} onChange={set("county")}>
                <option value="">Choose…</option>
                {Object.keys(WARDS_PER_COUNTY).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
          {needs.constituency && <div className="space-y-1"><Label className="text-xs">Constituency</Label><Input value={f.constituency} onChange={set("constituency")} /></div>}
          {needs.ward && <div className="space-y-1"><Label className="text-xs">Ward</Label><Input value={f.ward} onChange={set("ward")} /></div>}
          <div className="space-y-1"><Label className="text-xs">Photo link (https)</Label><Input value={f.photo_url} onChange={set("photo_url")} placeholder="official portrait URL" /></div>
          <div className="space-y-1"><Label className="text-xs">Source name</Label><Input value={f.source_title} onChange={set("source_title")} placeholder="e.g. Parliament of Kenya – Senators" /></div>
          <div className="space-y-1"><Label className="text-xs">Source link (https)</Label><Input value={f.source_url} onChange={set("source_url")} /></div>
          <div className="space-y-1"><Label className="text-xs">Verified on</Label><Input type="date" value={f.verified_on} onChange={set("verified_on")} /></div>
          <div className="md:col-span-3 flex justify-end"><Button onClick={save} className="bg-gradient-primary">Add officeholder</Button></div>
        </CardContent>
      </Card>

      <Card className="glass border-border/60">
        <CardHeader><CardTitle className="text-base">On the map ({rows.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rows.length === 0 && <div className="text-muted-foreground text-xs">No officeholders yet — the map shows no pins until verified entries are added.</div>}
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-2">
              {r.photo_url ? <img src={r.photo_url} alt={r.full_name} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-secondary" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.full_name} <span className="text-muted-foreground text-xs">· {OFFICE_LABEL[r.level as OfficeLevel]}</span></div>
                <div className="text-xs text-muted-foreground truncate">{[r.ward, r.constituency, r.county].filter(Boolean).join(", ") || "National"} · <a className="underline" href={r.source_url} target="_blank" rel="noreferrer">{r.source_title}</a></div>
              </div>
              <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Officeholders;
