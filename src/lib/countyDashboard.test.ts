import { describe, expect, it } from "vitest";
import { dashboardCounty, wardLocationKey } from "./countyDashboard";

describe("county browsing", () => {
  it("opens Nakuru without changing a Nairobi campaign scope", () => {
    expect(dashboardCounty("Nakuru", "Nairobi")).toBe("Nakuru");
    expect(dashboardCounty(null, "Nairobi")).toBe("Nairobi");
  });
  it("rejects unknown counties instead of creating a dashboard for them", () => {
    expect(dashboardCounty("unknown", "Nairobi")).toBe("Nairobi");
  });
  it("matches MCA wards despite punctuation and a ward suffix", () => {
    expect(wardLocationKey("Nakuru", "Biashara Ward")).toBe(wardLocationKey("NAKURU", "BIASHARA"));
  });
  it("preserves known Nairobi assembly to map aliases", () => {
    expect(wardLocationKey("Nairobi", "Mugumu-Ini")).toBe(wardLocationKey("Nairobi", "Mugumo-Ini"));
  });
  it("does not pin identically named Nakuru wards in the wrong constituency", () => {
    expect(wardLocationKey("Nakuru", "Biashara", "Nakuru Town East")).not.toBe(wardLocationKey("Nakuru", "Biashara", "Naivasha"));
  });
  it("matches official Nakuru spelling variants to their boundary names", () => {
    expect(wardLocationKey("Nakuru", "Kivumbuni", "Nakuru Town East")).toBe(wardLocationKey("Nakuru", "Kivumbini", "Nakuru Town East"));
    expect(wardLocationKey("Nakuru", "Eburu/Mbaruk", "Gilgil")).toBe(wardLocationKey("Nakuru", "Mbaruk/Eburu", "Gilgil"));
  });
});