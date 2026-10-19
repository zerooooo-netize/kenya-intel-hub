import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OfficeLevel = "president" | "deputy_president" | "governor" | "senator" | "woman_rep" | "mp" | "mca";

export const OFFICE_LABEL: Record<OfficeLevel, string> = {
  president: "President", deputy_president: "Deputy President", governor: "Governor",
  senator: "Senator", woman_rep: "Woman Rep", mp: "MP", mca: "MCA",
};

export const OFFICE_COLOR: Record<OfficeLevel, string> = {
  president: "hsl(45 95% 60%)", deputy_president: "hsl(35 90% 55%)", governor: "hsl(265 85% 65%)",
  senator: "hsl(200 90% 60%)", woman_rep: "hsl(330 80% 65%)", mp: "hsl(150 70% 50%)", mca: "hsl(15 85% 60%)",
};

export type Officeholder = {
  id: string; level: OfficeLevel; full_name: string; party: string | null;
  county: string | null; constituency: string | null; ward: string | null;
  photo_url: string | null; source_title: string; source_url: string; verified_on: string | null;
};

export const useOfficeholders = () =>
  useQuery({
    queryKey: ["officeholders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("officeholders").select("*");
      if (error) throw error;
      return (data ?? []) as Officeholder[];
    },
  });
