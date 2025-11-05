import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6 animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <AlertCircle className="w-24 h-24 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Page introuvable
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/catalog">
              <Search className="w-4 h-4" />
              Explorer le catalogue
            </Link>
          </Button>
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          <p>Chemin demandé : <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code></p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
