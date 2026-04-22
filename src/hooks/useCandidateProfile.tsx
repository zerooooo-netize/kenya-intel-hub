import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CandidateProfile = {
  id: string;
  user_id: string;
  full_name: string;
  aspired_position: string;
  party: string | null;
  county: string | null;
  constituency: string | null;
  ward: string | null;
  campaign_slogan: string | null;
  campaign_topics: string[] | null;
  bio: string | null;
  website: string | null;
  social_handles: Record<string, string> | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export const useCandidateProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data as unknown as CandidateProfile) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { profile, loading, refresh };
};
