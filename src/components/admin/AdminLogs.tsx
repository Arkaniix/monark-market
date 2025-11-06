import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Logs & Audit</h2>
        <p className="text-muted-foreground">Historique système et actions utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
