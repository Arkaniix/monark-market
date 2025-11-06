import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMetrics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analyses de marché</h2>
        <p className="text-muted-foreground">Métriques et tendances par modèle</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métriques quotidiennes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
