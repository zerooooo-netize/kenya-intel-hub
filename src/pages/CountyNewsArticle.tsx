import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Share2 } from "lucide-react";
import { toast } from "sonner";
import CountyNewsLayout from "@/components/CountyNewsLayout";
import MarkdownView from "@/components/MarkdownView";
import NewsPhoto from "@/components/NewsPhoto";
import { useNewsPost } from "@/hooks/useCountyNews";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function CountyNewsArticle() {
  const { id } = useParams();
  const { data: post, isLoading, error } = useNewsPost(id);
  const { isAdmin } = useAuth();
  return <CountyNewsLayout county={post?.county ?? "Nairobi"}>
    {isLoading ? <p>Loading article…</p> : error || !post ? <div><h1 className="font-editorial text-3xl">Article unavailable</h1><Button asChild variant="outline" className="mt-4"><Link to="/news">Back to news</Link></Button></div> : <article className="max-w-3xl mx-auto space-y-6">
      <Button asChild variant="ghost"><Link to={`/news?county=${encodeURIComponent(post.county)}`}><ArrowLeft className="h-4 w-4" />{post.county} news</Link></Button>
      <div className="flex flex-wrap gap-2"><Badge>{post.category}</Badge><Badge variant="outline">{post.county}</Badge>{post.status === "draft" && <Badge variant="secondary">Private draft</Badge>}</div>
      <h1 className="font-editorial text-4xl sm:text-5xl leading-tight break-words">{post.title}</h1>
      {post.summary && <p className="text-lg text-muted-foreground break-words">{post.summary}</p>}
      <div className="border-y border-border py-4 flex flex-wrap justify-between items-center gap-3"><p className="text-sm">By {post.author_name}<span className="text-muted-foreground"> · {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-KE")}</span></p><div className="flex gap-2">{isAdmin && <Button asChild size="icon" variant="outline" aria-label="Edit article"><Link to={`/news/edit/${post.id}`}><Pencil className="h-4 w-4" /></Link></Button>}{post.status === "published" && <Button size="icon" variant="outline" aria-label="Copy article link" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success("Article link copied"); } catch { toast.error("Could not copy link"); } }}><Share2 className="h-4 w-4" /></Button>}</div></div>
      {post.cover_url && <NewsPhoto url={post.cover_url} alt={post.title} className="aspect-[16/9] rounded-md" />}
      <MarkdownView text={post.body} className="break-words" />
      {post.source_url && <a href={post.source_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline block">Source / supporting document</a>}
    </article>}
  </CountyNewsLayout>;
}