import { Link, useLocation } from "react-router-dom";
import { Search, TrendingUp, Home, Zap, User, Menu, Eye, Calculator, Users, GraduationCap, LogOut, Shield, CreditCard, Scale, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Deals", href: "/deals", icon: Zap },
  { name: "Tendances", href: "/trends", icon: TrendingUp },
  { name: "Catalogue", href: "/catalog", icon: Search },
  { name: "Estimator", href: "/estimator", icon: Calculator },
  { name: "Communauté", href: "/community", icon: Users },
  { name: "Formation", href: "/training", icon: GraduationCap },
  { name: "Mon Compte", href: "/my-account", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HardwareMarket
              </span>
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
                <Link to="/auth">
                  <Button size="sm">Essayer gratuitement</Button>
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
              © 2025 <span className="font-semibold text-foreground">HardwareMarket</span>. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
