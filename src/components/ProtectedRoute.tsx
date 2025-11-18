import { Navigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  user: User | null;
  isAdmin: boolean;
  adminCheckComplete: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiresAuth = false, 
  requiresAdmin = false,
  user,
  isAdmin,
  adminCheckComplete,
}: ProtectedRouteProps) => {
  // Si l'authentification est requise et l'utilisateur n'est pas connecté
  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Si le rôle admin est requis
  if (requiresAdmin) {
    // Attendre que la vérification admin soit complète
    if (!adminCheckComplete) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">
            Vérification des permissions...
          </div>
        </div>
      );
    }

    // Si l'utilisateur n'est pas admin, rediriger vers la page non autorisé
    if (!isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si toutes les conditions sont remplies, afficher la page
  return <>{children}</>;
};

export default ProtectedRoute;