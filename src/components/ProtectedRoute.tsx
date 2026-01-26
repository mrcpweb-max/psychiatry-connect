import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "candidate" | "trainer";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user's role is in the allowed roles
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Redirect to appropriate dashboard based on role
  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (role === "trainer") {
    return <Navigate to="/trainer" replace />;
  }
  if (role === "candidate") {
    return <Navigate to="/dashboard" replace />;
  }

  // Default fallback
  return <Navigate to="/dashboard" replace />;
}
