import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Gift, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { CreditResetInfo } from "@/components/credits/CreditResetInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pack-50",
    credits: 50,
    price: 5,
    pricePerCredit: 0.10,
  },
  {
    id: "pack-150",
    credits: 150,
    price: 12,
    pricePerCredit: 0.08,
    popular: true,
    savings: "20%",
  },
  {
    id: "pack-400",
    credits: 400,
    price: 30,
    pricePerCredit: 0.075,
    savings: "25%",
  },
];

interface CreditPackagesProps {
  hasActiveSubscription: boolean;
  creditsResetDate?: string | null;
  onPurchase?: (packageId: string) => Promise<void>;
}

export function CreditPackages({ 
  hasActiveSubscription, 
  creditsResetDate,
  onPurchase 
}: CreditPackagesProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!hasActiveSubscription) {
      toast.error("Abonnement requis", {
        description: "Vous devez avoir un abonnement actif pour acheter des crédits.",
      });
      return;
    }

    setPurchasingId(pkg.id);
    try {
      if (onPurchase) {
        await onPurchase(pkg.id);
      } else {
        // Mock purchase for prototype
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`${pkg.credits} crédits ajoutés !`, {
          description: "Vos crédits sont disponibles immédiatement.",
        });
      }
    } catch (error) {
      toast.error("Erreur lors de l'achat", {
        description: "Veuillez réessayer plus tard.",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recharges de crédits</h2>
          <p className="text-muted-foreground">
            Achetez des crédits supplémentaires pour vos analyses
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" />
          Recharge ponctuelle
        </Badge>
      </div>

      {!hasActiveSubscription && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Abonnement requis</p>
            <p className="text-sm text-muted-foreground">
              Vous devez avoir un abonnement actif pour acheter des crédits de recharge.
            </p>
          </div>
        </div>
      )}

      {creditsResetDate && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Les crédits de recharge expirent au reset mensuel</p>
            <div className="flex items-center gap-2 mt-1">
              <CreditResetInfo 
                resetDate={creditsResetDate}
                creditsRemaining={0}
                variant="compact"
                showTooltip={false}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative transition-all hover:shadow-lg ${
              pkg.popular ? "border-primary shadow-md" : ""
            } ${!hasActiveSubscription ? "opacity-60" : ""}`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Gift className="h-3 w-3 mr-1" />
                  Populaire
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10 w-fit">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {pkg.credits}
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  crédits
                </span>
              </CardTitle>
              <CardDescription>
                {pkg.pricePerCredit.toFixed(2)}€ / crédit
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold">{pkg.price}€</span>
                {pkg.savings && (
                  <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
                    -{pkg.savings}
                  </Badge>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Disponible immédiatement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Utilisable pour toutes les actions</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        Expire au reset mensuel
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Les crédits de recharge expirent en même temps que vos crédits 
                          mensuels et ne sont pas reportés au cycle suivant.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              </ul>

              <Button 
                className="w-full" 
                variant={pkg.popular ? "default" : "outline"}
                disabled={!hasActiveSubscription || purchasingId === pkg.id}
                onClick={() => handlePurchase(pkg)}
              >
                {purchasingId === pkg.id ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Achat en cours...
                  </>
                ) : (
                  <>Acheter pour {pkg.price}€</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
