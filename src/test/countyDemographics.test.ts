import { describe, expect, it } from "vitest";
import { demographicColor, normalizeCounty, parseDemographicCsv } from "@/data/countyDemographics";

const header = "county,group,percentage,year,source\n";
describe("county demographic data", () => {
  it("rejects shares exceeding 100 percent", () => {
    expect(() => parseDemographicCsv(header + "Nairobi,A,70,2019,https://example.org\nNairobi,B,40,2019,https://example.org")).toThrow("exceed 100%");
  });
  it("rejects an unsourced ethnic percentage", () => {
    expect(() => parseDemographicCsv(header + "Nairobi,A,20,2019,")).toThrow("HTTPS source");
  });
  it("preserves supplied county shares without estimating missing groups", () => {
    const rows = parseDemographicCsv(header + "Nairobi,A,20,2019,https://example.org");
    expect(rows).toHaveLength(1);
    expect(rows[0].percentage).toBe(20);
  });
  it("keeps group colors consistent across county records", () => {
    expect(demographicColor("Kikuyu")).toBe(demographicColor(" kikuyu "));
    expect(demographicColor("Kikuyu")).not.toBe(demographicColor("Luo"));
  });
  it("matches county map names to county selector names", () => {
    expect(normalizeCounty("TAITA TAVETA")).toBe("Taita-Taveta");
    expect(normalizeCounty("NAIROBI")).toBe("Nairobi");
  });
});