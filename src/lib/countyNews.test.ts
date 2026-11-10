import { describe, expect, it } from "vitest";
import { canPublishNews, newsSchema } from "./countyNews";
import { KENYA_COUNTIES } from "@/data/kenyaCounties";
const update = { county: "Nairobi", title: "Governor update", summary: "", body: "An update from the campaign.", author_name: "Derek Nash", category: "Governor updates", cover_url: "", source_url: "" };
describe("county news rules", () => {
  it("supports publishing in each of Kenya's 47 counties", () => {
    expect(KENYA_COUNTIES).toHaveLength(47);
    for (const county of KENYA_COUNTIES) expect(newsSchema.safeParse({ ...update, county }).success).toBe(true);
    expect(newsSchema.safeParse({ ...update, county: "Unknown" }).success).toBe(false);
  });
  it("limits publishing controls to admins", () => {
    expect(canPublishNews(["admin"])).toBe(true);
    expect(canPublishNews(["analyst", "viewer"])).toBe(false);
  });
  it("rejects empty articles and unsafe supporting links", () => {
    expect(newsSchema.safeParse({ ...update, body: " " }).success).toBe(false);
    expect(newsSchema.safeParse({ ...update, source_url: "javascript:alert(1)" }).success).toBe(false);
  });
});