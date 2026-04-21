import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: AppRole }) => {
  const { user, loading, roles, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (role && !roles.includes(role) && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
