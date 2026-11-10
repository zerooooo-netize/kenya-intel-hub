import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import CountyNewsLayout from "@/components/CountyNewsLayout";
import NewsPhoto from "@/components/NewsPhoto";
import { useCountyNews } from "@/hooks/useCountyNews";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useAuth } from "@/hooks/useAuth";
import { dashboardCounty } from "@/lib/countyDashboard";
import { NEWS_CATEGORIES } from "@/lib/countyNews";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CountyNews() {
  const [params, setParams] = useSearchParams();
  const { profile } = useCandidateProfile();
  const { isAdmin } = useAuth();
  const county = dashboardCounty(params.get("county"), profile?.county);
  const [page, setPage] = useState(0), [search, setSearch] = useState(""), [category, setCategory] = useState("all");
  const { data, isLoading, error, refetch } = useCountyNews(county, page, false, search, category);
  return <CountyNewsLayout county={county}>
    <section className="border-b border-border pb-8 flex flex-wrap justify-between gap-6 items-end">
      <div><p className="text-xs uppercase text-primary mb-3">County dispatch</p><h1 className="font-editorial text-4xl sm:text-5xl break-words">{county} County</h1><p className="text-muted-foreground mt-3">Governor updates · Campaign trail · County affairs</p></div>
      {isAdmin && <div className="flex gap-2 flex-wrap"><Button asChild variant="outline"><Link to={`/news/manage?county=${encodeURIComponent(county)}`}>Manage posts</Link></Button><Button asChild><Link to={`/news/new?county=${encodeURIComponent(county)}`}><Plus className="h-4 w-4" />Write update</Link></Button></div>}
    </section>
    <div className="flex flex-wrap gap-3">
      <Select value={county} onValueChange={(c) => { setParams({ county: c }); setPage(0); }}><SelectTrigger aria-label="News county" className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent>{KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}><SelectTrigger aria-label="News category" className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All updates</SelectItem>{NEWS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      <div className="relative flex-1 min-w-[180px]"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search news" placeholder="Search headlines…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></div>
    </div>
    {isLoading ? <p className="text-muted-foreground py-12">Loading updates…</p> : error ? <div><p className="text-destructive">Could not load updates.</p><Button variant="outline" onClick={() => refetch()}>Try again</Button></div> : !data?.posts.length ? <div className="py-16 border-y border-border text-center"><h2 className="font-editorial text-2xl">{search || category !== "all" ? "No matching updates" : `No updates published in ${county} yet`}</h2></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {data.posts.map((post) => <article key={post.id} className="min-w-0 border-b border-border pb-6"><Link to={`/news/${post.id}`}><NewsPhoto url={post.cover_url} alt={post.title} className="aspect-[16/10] rounded-md mb-4" /><Badge variant="outline">{post.category}</Badge><h2 className="font-editorial text-2xl mt-3 break-words hover:text-primary">{post.title}</h2></Link><p className="text-sm text-muted-foreground mt-3 break-words">{post.summary}</p><p className="text-xs text-muted-foreground mt-4">{post.author_name} · {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-KE")}</p><Link to={`/news/${post.id}`} className="inline-flex gap-2 items-center text-sm text-primary mt-4">Read update<ArrowRight className="h-4 w-4" /></Link></article>)}
    </div>}
    <div className="flex justify-between items-center"><Button aria-label="Previous news page" variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></Button><span className="text-xs text-muted-foreground">Page {page + 1} · {data?.count ?? 0} updates</span><Button aria-label="Next news page" variant="outline" size="icon" disabled={(page + 1) * 12 >= (data?.count ?? 0)} onClick={() => setPage((p) => p + 1)}><ChevronRight /></Button></div>
  </CountyNewsLayout>;
}