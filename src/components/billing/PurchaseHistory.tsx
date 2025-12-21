import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Calendar, Receipt } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface CreditPurchase {
  id: string;
  credits: number;
  price: number;
  purchasedAt: Date;
  expiresAt: Date;
  status: "active" | "expired" | "used";
}

// Mock data for prototype
const MOCK_PURCHASES: CreditPurchase[] = [
  {
    id: "purch-1",
    credits: 150,
    price: 12,
    purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    id: "purch-2",
    credits: 50,
    price: 5,
    purchasedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "expired",
  },
];

interface PurchaseHistoryProps {
  purchases?: CreditPurchase[];
}

export function PurchaseHistory({ purchases = MOCK_PURCHASES }: PurchaseHistoryProps) {
  const getStatusBadge = (status: CreditPurchase["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Actif</Badge>;
      case "expired":
        return <Badge variant="secondary">Expiré</Badge>;
      case "used":
        return <Badge variant="outline">Utilisé</Badge>;
    }
  };

  if (purchases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique des recharges
          </CardTitle>
          <CardDescription>
            Vos achats de crédits ponctuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune recharge effectuée</p>
            <p className="text-sm">Vos achats de crédits apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Historique des recharges
        </CardTitle>
        <CardDescription>
          Vos achats de crédits ponctuels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div 
              key={purchase.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{purchase.credits} crédits</span>
                    {getStatusBadge(purchase.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(purchase.purchasedAt, "d MMM yyyy", { locale: fr })}
                    </span>
                    {purchase.status === "active" && (
                      <span className="text-warning">
                        Expire le {format(purchase.expiresAt, "d MMM", { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold">{purchase.price}€</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
