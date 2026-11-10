import { z } from "zod";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";

export const NEWS_CATEGORIES = ["Governor updates", "Campaign trail", "County affairs", "Statement"] as const;
const optionalUrl = z.union([z.literal(""), z.string().url().refine((v) => v.startsWith("https://"), "Use an HTTPS link.")]);
export const newsSchema = z.object({
  county: z.enum(KENYA_COUNTIES),
  title: z.string().trim().min(1, "Add a headline.").max(200),
  summary: z.string().trim().max(500),
  body: z.string().trim().min(1, "Add your article.").max(50000),
  author_name: z.string().trim().min(1, "Add a byline.").max(120),
  category: z.enum(NEWS_CATEGORIES),
  cover_url: optionalUrl,
  source_url: optionalUrl,
});
export type NewsForm = z.infer<typeof newsSchema>;
export function canPublishNews(roles: readonly string[]) { return roles.includes("admin"); }
export function newsImagePath(url: string) {
  const marker = "/county-news-images/";
  const index = url.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}