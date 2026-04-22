import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: AppRole }) => {
  const { user, loading, roles, isAdmin } = useAuth();
  const location = useLocation();
  const [onboardChecked, setOnboardChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let cancel = false;
    const check = async () => {
      if (!user) {
        setOnboardChecked(true);
        return;
      }
      const { data } = await supabase
        .from("candidate_profiles")
        .select("onboarded")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancel) return;
      setNeedsOnboarding(!data?.onboarded);
      setOnboardChecked(true);
    };
    setOnboardChecked(false);
    check();
    return () => { cancel = true; };
  }, [user?.id]);

  if (loading || (user && !onboardChecked)) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Force first-time onboarding (admins exempt so they can access admin tools immediately)
  if (needsOnboarding && !isAdmin && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (role && !roles.includes(role) && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
