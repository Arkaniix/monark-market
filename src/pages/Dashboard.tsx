import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  History,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
} from "lucide-react";
import { useState } from "react";
import ScrapModal from "@/components/ScrapModal";

export default function Dashboard() {
  const [showScrapModal, setShowScrapModal] = useState(false);
  const userCredits = 87;
  const maxCredits = 120;
  const creditPercentage = (userCredits / maxCredits) * 100;

  const scrapHistory = [
    {
      id: "1",
      type: "Scrap fort",
      model: "RTX 4060 Ti",
      date: "2025-01-14",
      duration: "5m 23s",
      results: { analyzed: 45, new: 12, modified: 8 },
      credits: -8,
    },
    {
      id: "2",
      type: "Scrap faible",
      model: "Ryzen 7 7800X3D",
      date: "2025-01-13",
      duration: "2m 15s",
      results: { analyzed: 18, new: 5, modified: 2 },
      credits: -3,
    },
    {
      id: "3",
      type: "Scrap communautaire",
      model: "DDR5 32GB",
      date: "2025-01-12",
      duration: "7m 45s",
      results: { analyzed: 67, new: 23, modified: 14 },
      credits: +12,
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, suivez votre activité et vos crédits
          </p>
        </div>

        {/* Credits Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Crédits disponibles</CardTitle>
                <Badge variant="secondary">Plan Pro</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{userCredits}</span>
                  <span className="text-muted-foreground">/ {maxCredits} crédits</span>
                </div>
                <Progress value={creditPercentage} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Renouvellement dans 18 jours
                  </span>
                  <Button variant="outline" size="sm">
                    Obtenir plus de crédits
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Activité ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Scraps effectués</span>
                  </div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Crédits gagnés</span>
                  </div>
                  <div className="text-2xl font-bold text-success">+24</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button className="h-auto py-4 flex-col gap-2" onClick={() => setShowScrapModal(true)}>
                <Zap className="h-5 w-5" />
                Lancer un scrap
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Activity className="h-5 w-5" />
                Voir les tendances
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <History className="h-5 w-5" />
                Historique
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Coins className="h-5 w-5" />
                Contribuer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scrap Modal */}
        <ScrapModal open={showScrapModal} onOpenChange={setShowScrapModal} />

        {/* Scrap History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Scraps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scrapHistory.map((scrap) => (
                <div
                  key={scrap.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={scrap.type === "Scrap fort" ? "default" : "secondary"}>
                        {scrap.type}
                      </Badge>
                      <span className="font-medium">{scrap.model}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(scrap.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div>Durée: {scrap.duration}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{scrap.results.analyzed} analysées</span>
                      <span>{scrap.results.new} nouvelles</span>
                      <span>{scrap.results.modified} modifiées</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${
                        scrap.credits > 0 ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {scrap.credits > 0 ? "+" : ""}
                      {scrap.credits}
                    </div>
                    <div className="text-xs text-muted-foreground">crédits</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
