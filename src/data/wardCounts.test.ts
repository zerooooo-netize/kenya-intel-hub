import { describe, it, expect } from "vitest";
import { WARDS_PER_COUNTY } from "./wardCounts";
describe("official ward counts", () => {
  it("covers 47 counties", () => expect(Object.keys(WARDS_PER_COUNTY)).toHaveLength(47));
  it("totals 1,450 wards", () => expect(Object.values(WARDS_PER_COUNTY).reduce((a, b) => a + b, 0)).toBe(1450));
  it("Nairobi has 85 wards", () => expect(WARDS_PER_COUNTY.Nairobi).toBe(85));
});
