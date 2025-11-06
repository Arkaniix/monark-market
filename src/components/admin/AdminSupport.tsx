import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Support & Tickets</h2>
        <p className="text-muted-foreground">Gestion des demandes utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets ouverts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
