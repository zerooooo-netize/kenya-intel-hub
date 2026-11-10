import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { newsImagePath } from "@/lib/countyNews";
import type { Tables } from "@/integrations/supabase/types";

export type NewsPost = Tables<"county_news_posts">;
export function useCountyNews(county: string, page = 0, manage = false, search = "", category = "all") {
  return useQuery({
    queryKey: ["published-news", county, page, manage, search, category],
    queryFn: async () => {
      let query = supabase.from("county_news_posts").select("*", { count: "exact" }).eq("county", county);
      if (!manage) query = query.eq("status", "published");
      if (search.trim()) query = query.ilike("title", `%${search.replace(/[%_]/g, "")}%`);
      if (category !== "all") query = query.eq("category", category);
      const { data, error, count } = await query.order(manage ? "updated_at" : "published_at", { ascending: false }).range(page * 12, page * 12 + 11);
      if (error) throw error;
      return { posts: data ?? [], count: count ?? 0 };
    },
  });
}
export function useNewsPost(id?: string) {
  return useQuery({ queryKey: ["news-post", id], enabled: !!id, queryFn: async () => {
    const { data, error } = await supabase.from("county_news_posts").select("*").eq("id", id ?? "").maybeSingle();
    if (error) throw error;
    return data;
  } });
}
export function useNewsImage(url: string | null) {
  return useQuery({ queryKey: ["news-image", url], enabled: !!url, staleTime: 45 * 60 * 1000, queryFn: async () => {
    if (!url) return null;
    const path = newsImagePath(url);
    if (!path) return url;
    const { data, error } = await supabase.storage.from("county-news-images").createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  } });
}