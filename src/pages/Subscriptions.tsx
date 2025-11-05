import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building2, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"] & {
  subscription_plans: SubscriptionPlan;
};

export default function Subscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      // Load all plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Load current subscription
      const { data: currentSub, error: currentError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (currentError) throw currentError;
      setCurrentSubscription(currentSub);

      // Load subscription history
      const { data: historyData, error: historyError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", userId)
        .order("started_at", { ascending: false });

      if (historyError) throw historyError;
      setSubscriptionHistory(historyData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: "active",
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Abonnement activé avec succès",
      });

      loadData(user.id);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner",
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "pro":
        return <Crown className="h-6 w-6" />;
      case "enterprise":
        return <Building2 className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const renderFeatures = (features: any) => {
    if (!features || typeof features !== 'object') return null;
    
    return Object.entries(features as Record<string, any>).map(([key, value]) => {
      let displayValue = value;
      if (value === true) displayValue = "Inclus";
      if (value === "unlimited") displayValue = "Illimité";
      
      const featureNames: Record<string, string> = {
        alerts: "Alertes",
        scanner: "Scanner de prix",
        community: "Accès communauté",
        training: "Formations",
        advanced_analytics: "Analytics avancés",
        api_access: "Accès API",
        priority_support: "Support prioritaire",
      };

      return (
        <div key={key} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-sm">
            {featureNames[key] || key}: <strong>{displayValue}</strong>
          </span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Abonnements</h1>
        <p className="text-muted-foreground">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(currentSubscription.subscription_plans.name)}
                  Abonnement actuel
                </CardTitle>
                <CardDescription>
                  Vous êtes abonné au plan {currentSubscription.subscription_plans.name}
                </CardDescription>
              </div>
              <Badge variant="default">Actif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Début: {format(new Date(currentSubscription.started_at), "dd MMMM yyyy", { locale: fr })}
                </span>
              </div>
              {currentSubscription.expires_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Expire le: {format(new Date(currentSubscription.expires_at), "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {renderFeatures(currentSubscription.subscription_plans.features)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Plans disponibles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            return (
              <Card key={plan.id} className={isCurrentPlan ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {renderFeatures(plan.features)}
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Plan actuel
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      className="w-full"
                      variant={plan.name === "Pro" ? "default" : "outline"}
                    >
                      Choisir ce plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Historique des abonnements</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {subscriptionHistory.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getPlanIcon(sub.subscription_plans.name)}
                      <div>
                        <p className="font-medium">{sub.subscription_plans.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sub.started_at), "dd MMMM yyyy", { locale: fr })}
                          {sub.expires_at && ` - ${format(new Date(sub.expires_at), "dd MMMM yyyy", { locale: fr })}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                      {sub.status === "active" ? "Actif" : "Expiré"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
