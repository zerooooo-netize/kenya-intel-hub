import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeCounty } from "@/data/countyDemographics";

export type TurnoutRow = {
  county: string;
  registered_voters: number;
  votes_cast: number;
  turnout_pct: number;
  source_title: string;
  source_url: string;
  published_on: string | null;
};

/** Verified 2022 presidential county turnout, keyed by normalized county name. */
export function useCountyTurnout() {
  return useQuery({
    queryKey: ["county-turnout", "2022-presidential"],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turnout_results")
        .select("county, registered_voters, votes_cast, turnout_pct, source_title, source_url, published_on")
        .eq("election", "2022-presidential")
        .eq("scope", "county")
        .eq("verified", true);
      if (error) throw error;
      const map = new Map<string, TurnoutRow>();
      (data ?? []).forEach((r: any) => map.set(normalizeCounty(r.county) || r.county, { ...r, turnout_pct: Number(r.turnout_pct) }));
      return map;
    },
  });
}

/** Colour scale from low (cool) to high (warm) turnout, 40–85%. */
export function turnoutColor(pct: number) {
  const t = Math.max(0, Math.min(1, (pct - 40) / 45));
  const hue = 210 - t * 170;
  return `hsl(${hue} 85% ${30 + t * 20}%)`;
}
