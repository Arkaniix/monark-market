import { CreditPackages } from "@/components/billing/CreditPackages";
import { PurchaseHistory } from "@/components/billing/PurchaseHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditResetInfo } from "@/components/credits/CreditResetInfo";
import { useCredits } from "@/hooks/useCredits";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Coins, Crown, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Billing() {
  const { creditsRemaining, resetInfo } = useCredits();
  const { planDisplayName: planName, plan } = useEntitlements();
  const isSubscriptionActive = plan !== "starter";

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Facturation & Crédits</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et achetez des crédits supplémentaires
          </p>
        </div>

        {/* Current Plan Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Votre abonnement
              </CardTitle>
              <CardDescription>
                Plan actuel et crédits disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="default" className="text-sm">
                  {planName}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                {isSubscriptionActive ? (
                  <Badge variant="default" className="bg-green-500">Actif</Badge>
                ) : (
                  <Badge variant="secondary">Inactif</Badge>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Crédits disponibles</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">{creditsRemaining}</span>
                </div>
              </div>
              {resetInfo?.resetDate && (
                <CreditResetInfo 
                  resetDate={resetInfo.resetDate.toISOString()} 
                  creditsRemaining={creditsRemaining}
                  variant="default"
                />
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/account">
                  Gérer mon abonnement
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Besoin de plus de crédits ?
              </CardTitle>
              <CardDescription>
                Rechargez votre compte instantanément
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  ✓ Crédits disponibles immédiatement
                </li>
                <li className="flex items-center gap-2">
                  ✓ Utilisables pour toutes les actions
                </li>
                <li className="flex items-center gap-2">
                  ✓ Jusqu'à 25% d'économies sur les gros packs
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Les crédits de recharge expirent à la fin de votre cycle mensuel 
                et ne sont pas cumulables d'un mois à l'autre.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credit Packages */}
        <CreditPackages 
          hasActiveSubscription={isSubscriptionActive}
          creditsResetDate={resetInfo?.resetDate?.toISOString() ?? null}
        />

        {/* Purchase History */}
        <PurchaseHistory />
    </div>
  );
}
