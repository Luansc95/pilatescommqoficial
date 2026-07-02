import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isStaff, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-purple-dark">Acesso não autorizado</h1>
          <p className="text-muted-foreground">
            Sua conta ainda não tem permissão para acessar o sistema. Entre em contato com um administrador.
          </p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
