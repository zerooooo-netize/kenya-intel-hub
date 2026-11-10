import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCountyNews } from "@/hooks/useCountyNews";
import { dashboardCounty } from "@/lib/countyDashboard";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
import CountyNewsLayout from "@/components/CountyNewsLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function CountyNewsManage() {
  const [params, setParams] = useSearchParams(), cache = useQueryClient();
  const county = dashboardCounty(params.get("county"));
  const [page, setPage] = useState(0), [remove, setRemove] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const { data, isLoading, error } = useCountyNews(county, page, true);
  const deletePost = async () => {
    if (!remove) return;
    setBusy(true);
    const { error } = await supabase.from("county_news_posts").delete().eq("id", remove);
    if (error) toast.error("Could not delete update"); else { toast.success("Update deleted"); await cache.invalidateQueries({ queryKey: ["published-news"] }); await cache.invalidateQueries({ queryKey: ["news-post"] }); }
    setBusy(false); setRemove(null);
  };
  return <CountyNewsLayout county={county}>
    <div className="flex flex-wrap gap-4 justify-between items-center"><h1 className="font-editorial text-3xl">Your county posts</h1><Button asChild><Link to={`/news/new?county=${encodeURIComponent(county)}`}><Plus className="h-4 w-4" />Write update</Link></Button></div>
    <Select value={county} onValueChange={(c) => { setParams({ county: c }); setPage(0); }}><SelectTrigger aria-label="Manage news county" className="w-52"><SelectValue /></SelectTrigger><SelectContent>{KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
    <div className="divide-y divide-border">{isLoading ? <p>Loading posts…</p> : error ? <p className="text-destructive">Could not load posts.</p> : !data?.posts.length ? <p className="py-10 text-muted-foreground">No posts in {county} yet.</p> : data.posts.map((p) => <div key={p.id} className="py-5 flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge><Link to={`/news/${p.id}`} className="block font-editorial text-xl mt-2 break-words">{p.title}</Link><p className="text-xs text-muted-foreground mt-2">{p.author_name} · {new Date(p.updated_at).toLocaleDateString("en-KE")}</p></div><div className="flex gap-2"><Button asChild size="icon" variant="outline" aria-label={`Edit ${p.title}`}><Link to={`/news/edit/${p.id}`}><Pencil className="h-4 w-4" /></Link></Button><Button size="icon" variant="ghost" aria-label={`Delete ${p.title}`} onClick={() => setRemove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div>
    <div className="flex justify-between"><Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button><Button variant="outline" disabled={(page + 1) * 12 >= (data?.count ?? 0)} onClick={() => setPage((p) => p + 1)}>Next</Button></div>
    <AlertDialog open={!!remove} onOpenChange={(v) => { if (!v && !busy) setRemove(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this update?</AlertDialogTitle><AlertDialogDescription>The article will be permanently removed from county news.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={deletePost}>Delete update</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </CountyNewsLayout>;
}