import { normalizeCounty } from "@/data/countyDemographics";

export function dashboardCounty(requested: string | null, profileCounty?: string | null) {
  return normalizeCounty(requested ?? "") ?? normalizeCounty(profileCounty ?? "") ?? "Nairobi";
}

export function wardLocationKey(county: string, ward: string, constituency?: string | null) {
  const aliases: Record<string, string> = {
    mugumuini: "mugumoini",
    woodleykenyattagolfcourse: "woodleykenyattagolf",
    matopenispringvalley: "matopeni",
    maunarok: "maunarok",
    maunarokward: "maunarok",
    maunaroklocation: "maunarok",
  };
  const name = ward.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/ward$/, "");
  const canonical = normalizeCounty(county) ?? county;
  const mapped = canonical === "Nairobi" ? aliases[name] ?? name : canonical === "Nakuru" && name === "maunarok" ? "maunarok" : name;
  const area = constituency?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return `w:${canonical}:${area}:${mapped}`;
}