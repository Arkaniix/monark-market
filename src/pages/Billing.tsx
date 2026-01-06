import Layout from "@/components/Layout";
import { CreditPackages } from "@/components/billing/CreditPackages";
import { PurchaseHistory } from "@/components/billing/PurchaseHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditResetInfo } from "@/components/credits/CreditResetInfo";
import { useCredits } from "@/hooks/useCredits";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Coins, Crown, ArrowRight, Sparkles, Puzzle, CheckCircle2, Download, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock component for extension status (visual only)
function ExtensionStatus() {
  const [isDetected] = useState(false); // Mock: change to true to see detected state

  if (isDetected) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-400">Extension détectée</p>
          <p className="text-xs text-muted-foreground">Prêt à scanner</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Puzzle className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Extension non détectée</p>
          <p className="text-xs text-muted-foreground">Installez l'extension pour commencer</p>
        </div>
      </div>
      <Button className="w-full" asChild>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4 mr-2" />
          Télécharger l'extension
        </a>
      </Button>
    </div>
  );
}

export default function Billing() {
  const { creditsRemaining, resetInfo } = useCredits();
  const { planDisplayName: planName, plan } = useEntitlements();
  const isSubscriptionActive = plan !== "starter";

  return (
    <Layout>
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
                <span className="text-muted-foreground">Crédits</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">{creditsRemaining} crédits</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-primary" />
                Extension navigateur
              </CardTitle>
              <CardDescription>
                Statut de l'extension et formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExtensionStatus />
              <Separator />
              <Button variant="outline" className="w-full" asChild>
                <Link to="/training">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Module de formation extension
                </Link>
              </Button>
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
    </Layout>
  );
}
