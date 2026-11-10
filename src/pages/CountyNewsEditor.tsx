import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Bold, Heading2, ImagePlus, Italic, List, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useNewsPost } from "@/hooks/useCountyNews";
import { dashboardCounty } from "@/lib/countyDashboard";
import { newsSchema, NewsForm, NEWS_CATEGORIES } from "@/lib/countyNews";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
import CountyNewsLayout from "@/components/CountyNewsLayout";
import MarkdownView from "@/components/MarkdownView";
import NewsPhoto from "@/components/NewsPhoto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CountyNewsEditor() {
  const { id } = useParams(), [params] = useSearchParams(), navigate = useNavigate(), cache = useQueryClient();
  const { user } = useAuth(), { profile } = useCandidateProfile();
  const { data: post, isLoading, error } = useNewsPost(id);
  const [form, setForm] = useState<NewsForm>({ county: dashboardCounty(params.get("county")), title: "", summary: "", body: "", author_name: "", category: "Governor updates", cover_url: "", source_url: "" });
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null), uploadRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (post) setForm({ county: dashboardCounty(post.county), title: post.title, summary: post.summary, body: post.body, author_name: post.author_name, category: post.category as NewsForm["category"], cover_url: post.cover_url ?? "", source_url: post.source_url ?? "" }); }, [post]);
  useEffect(() => { if (!id && profile) setForm((f) => ({ ...f, author_name: f.author_name || profile.full_name, county: dashboardCounty(params.get("county"), profile.county) })); }, [profile, id, params]);
  const set = (key: keyof NewsForm, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const format = (before: string, after = "") => {
    const field = bodyRef.current;
    if (!field) return;
    const start = field.selectionStart, end = field.selectionEnd;
    set("body", form.body.slice(0, start) + before + form.body.slice(start, end) + after + form.body.slice(end));
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + before.length, end + before.length); });
  };
  const save = async (status: "draft" | "published") => {
    if (!user) return;
    const parsed = newsSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check your article."); return; }
    setBusy(true);
    try {
      const row = { ...parsed.data, status, cover_url: parsed.data.cover_url || null, source_url: parsed.data.source_url || null };
      const result = id ? await supabase.from("county_news_posts").update(row).eq("id", id).select("id").single() : await supabase.from("county_news_posts").insert({ ...row, author_id: user.id }).select("id").single();
      if (result.error) throw result.error;
      await cache.invalidateQueries({ queryKey: ["published-news"] });
      await cache.invalidateQueries({ queryKey: ["news-post"] });
      toast.success(status === "published" ? "Update published" : "Draft saved");
      navigate(status === "published" ? `/news/${result.data.id}` : `/news/edit/${result.data.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save update"); } finally { setBusy(false); }
  };
  const upload = async (file?: File) => {
    if (!file || !user) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Choose a JPG, PNG or WebP photo under 5 MB."); return; }
    setUploading(true);
    try {
      const path = `${user.id}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
      const { error } = await supabase.storage.from("county-news-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("county-news-images").getPublicUrl(path);
      set("cover_url", data.publicUrl);
      toast.success("Photo uploaded");
    } catch { toast.error("Could not upload photo"); } finally { setUploading(false); if (uploadRef.current) uploadRef.current.value = ""; }
  };
  return <CountyNewsLayout county={form.county}>
    {id && (isLoading || error || !post) ? <p>{isLoading ? "Loading draft…" : "Article unavailable."}</p> : <>
      <div className="flex flex-wrap justify-between gap-4 items-center"><h1 className="font-editorial text-3xl">{id ? "Edit update" : "Write update"}</h1><div className="flex gap-2 flex-wrap"><Button disabled={busy || uploading} variant="outline" onClick={() => save("draft")}><Save className="h-4 w-4" />{post?.status === "published" ? "Unpublish & save" : "Save draft"}</Button><Button disabled={busy || uploading} onClick={() => save("published")}><Send className="h-4 w-4" />{busy ? "Saving…" : post?.status === "published" ? "Update published article" : "Publish"}</Button></div></div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
        <div className="space-y-5 min-w-0">
          <div className="space-y-2"><Label htmlFor="headline">Headline</Label><Input id="headline" value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="summary">Summary</Label><Textarea id="summary" value={form.summary} maxLength={500} onChange={(e) => set("summary", e.target.value)} /></div>
          <Tabs defaultValue="write"><TabsList><TabsTrigger value="write">Write</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList><TabsContent value="write"><div className="flex gap-1 border border-border border-b-0 rounded-t-md p-2">{[{ icon: Bold, label: "Bold", before: "**", after: "**" }, { icon: Italic, label: "Italic", before: "*", after: "*" }, { icon: Heading2, label: "Heading", before: "\n## " }, { icon: List, label: "Bullet list", before: "\n- " }].map(({ icon: Icon, label, before, after }) => <Button key={label} size="icon" variant="ghost" title={label} aria-label={label} onClick={() => format(before, after)}><Icon className="h-4 w-4" /></Button>)}</div><Label htmlFor="article-body" className="sr-only">Article body</Label><Textarea ref={bodyRef} id="article-body" className="min-h-[380px] rounded-t-none" value={form.body} maxLength={50000} onChange={(e) => set("body", e.target.value)} /></TabsContent><TabsContent value="preview" className="min-h-[380px] space-y-5 border border-border rounded-md p-6"><h2 className="font-editorial text-3xl break-words">{form.title}</h2><p className="text-muted-foreground break-words">{form.summary}</p>{form.cover_url && <NewsPhoto url={form.cover_url} alt={form.title} className="aspect-video" />}<MarkdownView text={form.body} className="break-words" /></TabsContent></Tabs>
        </div>
        <aside className="space-y-5 min-w-0">
          <div className="space-y-2"><Label>County</Label><Select value={form.county} onValueChange={(v) => set("county", v)}><SelectTrigger aria-label="Article county"><SelectValue /></SelectTrigger><SelectContent>{KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger aria-label="Article category"><SelectValue /></SelectTrigger><SelectContent>{NEWS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="byline">Byline</Label><Input id="byline" value={form.author_name} maxLength={120} onChange={(e) => set("author_name", e.target.value)} /></div>
          <div className="space-y-3"><Label>Cover photo</Label>{form.cover_url && <NewsPhoto url={form.cover_url} alt="Cover photo" className="aspect-video rounded-md" />}<input type="file" accept="image/jpeg,image/png,image/webp" ref={uploadRef} className="hidden" aria-label="Upload cover photo" onChange={(e) => upload(e.target.files?.[0])} /><Button variant="outline" disabled={uploading} onClick={() => uploadRef.current?.click()}><ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Upload photo"}</Button>{form.cover_url && <Button size="icon" variant="ghost" aria-label="Remove cover photo" onClick={() => set("cover_url", "")}><Trash2 className="h-4 w-4" /></Button>}</div>
          <div className="space-y-2"><Label htmlFor="source-url">Supporting source (optional)</Label><Input id="source-url" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://" /></div>
          <Button asChild variant="ghost"><Link to={`/news/manage?county=${encodeURIComponent(form.county)}`}>Back to posts</Link></Button>
        </aside>
      </div>
    </>}
  </CountyNewsLayout>;
}