import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiresAuth = false, 
  requiresAdmin = false,
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  // If authentication is required and user is not logged in
  if (requiresAuth && !user) {
    return <Navigate to="/landing" replace />;
  }

  // If admin role is required and user is not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
