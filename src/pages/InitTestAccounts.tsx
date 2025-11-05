import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export default function InitTestAccounts() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const createTestAccounts = async () => {
    setLoading(true);
    setResults(null);

    try {
      // Get Pro plan ID
      const { data: plans } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", "Pro")
        .single();

      if (!plans) {
        throw new Error("Plan Pro introuvable");
      }

      const proPlanId = plans.id;

      // Create Admin Account
      const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: "admin@test.com",
        password: "Admin123!",
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: "Admin Test",
          },
        },
      });

      // Create User Account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: "user@test.com",
        password: "User123!",
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: "User Test",
          },
        },
      });

      // Add subscriptions
      if (adminData.user) {
        await supabase.from("user_subscriptions").insert({
          user_id: adminData.user.id,
          plan_id: proPlanId,
          status: "active",
        });

        // Add admin role
        await supabase.from("user_roles").insert({
          user_id: adminData.user.id,
          role: "admin",
        });
      }

      if (userData.user) {
        await supabase.from("user_subscriptions").insert({
          user_id: userData.user.id,
          plan_id: proPlanId,
          status: "active",
        });
      }

      setResults({
        admin: {
          success: !adminError,
          error: adminError?.message,
          email: "admin@test.com",
          password: "Admin123!",
        },
        user: {
          success: !userError,
          error: userError?.message,
          email: "user@test.com",
          password: "User123!",
        },
      });

      toast({
        title: "Comptes créés",
        description: "Les comptes de test ont été initialisés avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Initialisation des comptes de test</CardTitle>
          <CardDescription>
            Créez les comptes de test admin et utilisateur pour le développement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createTestAccounts} disabled={loading} className="w-full">
            {loading ? "Création en cours..." : "Créer les comptes de test"}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {results.admin.success ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <h3 className="font-semibold">Compte Admin</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Email:</span> {results.admin.email}
                  </p>
                  <p>
                    <span className="font-medium">Mot de passe:</span> {results.admin.password}
                  </p>
                  {results.admin.error && (
                    <p className="text-destructive">Erreur: {results.admin.error}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {results.user.success ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <h3 className="font-semibold">Compte Utilisateur</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Email:</span> {results.user.email}
                  </p>
                  <p>
                    <span className="font-medium">Mot de passe:</span> {results.user.password}
                  </p>
                  {results.user.error && (
                    <p className="text-destructive">Erreur: {results.user.error}</p>
                  )}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Utilisez ces identifiants sur la page de connexion</li>
                  <li>Le compte admin a des privilèges étendus</li>
                  <li>Le compte user est un compte standard</li>
                  <li>Les deux comptes ont le plan Pro actif</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
