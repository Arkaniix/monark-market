import { Link, useLocation } from "react-router-dom";
import { Search, Radar, Home, Zap, User, Menu, Calculator, Users, GraduationCap, LogOut, Shield, Scale, MessageCircle } from "lucide-react";
import monarkLogo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Marché", href: "/deals", icon: Zap },
  { name: "Suivi", href: "/tracking", icon: Radar },
  { name: "Catalogue", href: "/catalog", icon: Search },
  { name: "Estimator", href: "/estimator", icon: Calculator },
  { name: "Communauté", href: "/community", icon: Users },
  { name: "Formation", href: "/training", icon: GraduationCap },
  { name: "Mon Compte", href: "/my-account", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAdmin, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={user ? "/" : "/landing"} className="flex items-center">
              <img 
                src={monarkLogo} 
                alt="Monark" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation - Only show for authenticated users */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-2",
                          isActive && "bg-muted text-primary font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-2",
                        location.pathname === "/admin" && "bg-muted text-primary font-medium"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Mobile Navigation - Only show for authenticated users */}
          {user && (
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link key={item.name} to={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link to="/admin">
                      <Button
                        variant={location.pathname === "/admin" ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-br from-muted/50 via-muted/30 to-background mt-12">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
              {/* Légal */}
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="font-semibold">Légal :</span>
              </div>
              <Link 
                to="/cgu" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                CGU
              </Link>
              <Link 
                to="/rgpd" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                RGPD
              </Link>
              <Link 
                to="/legal-notice" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Mentions légales
              </Link>
              
              {/* Séparateur */}
              <div className="hidden sm:block h-6 w-px bg-border" />
              
              {/* Communauté */}
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                <span className="font-semibold">Communauté :</span>
              </div>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 <span className="font-semibold text-foreground">Monark</span>. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
