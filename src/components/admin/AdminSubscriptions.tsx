import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Abonnements & Paiements</h2>
        <p className="text-muted-foreground">Gestion des plans et transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
