import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminModels() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Modèles & Spécifications</h2>
        <p className="text-muted-foreground">Gestion du catalogue hardware</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modèles matériels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
