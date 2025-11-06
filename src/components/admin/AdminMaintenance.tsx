import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminMaintenance() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outils de maintenance</h2>
        <p className="text-muted-foreground">Actions sécurisées de maintenance système</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Zone sécurisée</AlertTitle>
        <AlertDescription>
          Ces actions peuvent impacter les performances du système. Toute opération est journalisée.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance base de données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Purge des données anciennes</h4>
              <p className="text-sm text-muted-foreground">Supprime ingest_raw et logs {'>'} 60 jours</p>
            </div>
            <Button variant="outline">Planifier</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Recalcul des deal scores</h4>
              <p className="text-sm text-muted-foreground">Recalcule tous les scores d'annonces</p>
            </div>
            <Button variant="outline">Lancer</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Vacuum / Analyze</h4>
              <p className="text-sm text-muted-foreground">Optimise les tables lourdes</p>
            </div>
            <Button variant="outline">Exécuter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
