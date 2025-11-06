import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminIngest() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Qualité des données & Ingest</h2>
        <p className="text-muted-foreground">Validation et monitoring de l'ingestion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batchs d'ingestion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
