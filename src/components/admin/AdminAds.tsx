import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAds() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Annonces & Modération</h2>
        <p className="text-muted-foreground">Gestion et modération des annonces</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des annonces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Section à implémenter</div>
        </CardContent>
      </Card>
    </div>
  );
}
