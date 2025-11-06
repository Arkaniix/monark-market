import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres produit</h2>
        <p className="text-muted-foreground">Configuration globale de l'application</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
