import { normalizeCounty } from "@/data/countyDemographics";

export function dashboardCounty(requested: string | null, profileCounty?: string | null) {
  return normalizeCounty(requested ?? "") ?? normalizeCounty(profileCounty ?? "") ?? "Nairobi";
}

export function wardLocationKey(county: string, ward: string, constituency?: string | null) {
  const aliases: Record<string, string> = {
    mugumuini: "mugumoini",
    woodleykenyattagolfcourse: "woodleykenyattagolf",
    matopenispringvalley: "matopeni",
  };
  const name = ward.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/ward$/, "");
  const canonical = normalizeCounty(county) ?? county;
  // Spelling differences between the official assembly roster and the public ward map.
  const nakuruAliases: Record<string, string> = {
    kivumbuni: "kivumbini", kaptembwa: "kaptembwo", murindat: "murindati",
    rhonda: "rhoda", eburumbaruk: "mbarukeburu",
  };
  const mapped = canonical === "Nairobi" ? aliases[name] ?? name : canonical === "Nakuru" ? nakuruAliases[name] ?? name : name;
  const area = constituency?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return `w:${canonical}:${area}:${mapped}`;
}