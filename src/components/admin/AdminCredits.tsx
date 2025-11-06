import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCredits() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crédits & Politiques d'usage</h2>
        <p className="text-muted-foreground">Configuration des règles de scraping et crédits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Politiques de scraping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
