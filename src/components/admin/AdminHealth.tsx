import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHealth() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Santé système & Observabilité</h2>
        <p className="text-muted-foreground">Monitoring et état des services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>État des services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
