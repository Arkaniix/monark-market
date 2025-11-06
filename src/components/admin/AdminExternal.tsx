import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminExternal() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Intégrations externes</h2>
        <p className="text-muted-foreground">Gestion des APIs et sources externes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sources externes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
