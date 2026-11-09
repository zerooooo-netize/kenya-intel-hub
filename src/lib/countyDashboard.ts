import { normalizeCounty } from "@/data/countyDemographics";

export function dashboardCounty(requested: string | null, profileCounty?: string | null) {
  return normalizeCounty(requested ?? "") ?? normalizeCounty(profileCounty ?? "") ?? "Nairobi";
}

export function wardLocationKey(county: string, ward: string) {
  const aliases: Record<string, string> = {
    mugumuini: "mugumoini",
    woodleykenyattagolfcourse: "woodleykenyattagolf",
    matopenispringvalley: "matopeni",
  };
  const name = ward.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/ward$/, "");
  const canonical = normalizeCounty(county) ?? county;
  return `w:${canonical}:${canonical === "Nairobi" ? aliases[name] ?? name : name}`;
}