import { useState } from "react";
import ScrapModal from "@/components/ScrapModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Users, TrendingUp, Clock, Award } from "lucide-react";

export default function Scrap() {
  const [modalOpen, setModalOpen] = useState(false);

  // Mock user data - à remplacer par des données réelles
  const userCredits = 24;
  const totalScraps = 847;
  const communityScrapAvailable = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            Lancer un scrap
          </h1>
          <p className="text-muted-foreground text-lg">
            Scannez les annonces du marché et collectez des données en temps réel
          </p>
        </div>

        {/* User Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-background">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Crédits disponibles</p>
                  <p className="text-3xl font-bold text-primary">{userCredits}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-background">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scraps totaux</p>
                  <p className="text-3xl font-bold text-accent">{totalScraps}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-background">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <p className="text-lg font-semibold text-success">
                    {communityScrapAvailable ? "Disponible" : "En attente"}
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Types de scrap */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Scrap Faible */}
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-primary" />
                <Badge variant="secondary">3 crédits</Badge>
              </div>
              <CardTitle className="text-xl">Scrap faible</CardTitle>
              <CardDescription>
                Scan basique d'un modèle précis sans filtres avancés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>2-4 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span>~5 pages scannées</span>
                </div>
              </div>
              <Button 
                className="w-full gap-2 group-hover:shadow-lg transition-shadow"
                onClick={() => setModalOpen(true)}
              >
                <Zap className="h-4 w-4" />
                Lancer
              </Button>
            </CardContent>
          </Card>

          {/* Scrap Fort */}
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-primary" />
                <Badge variant="secondary">8 crédits</Badge>
              </div>
              <CardTitle className="text-xl">Scrap fort</CardTitle>
              <CardDescription>
                Scan approfondi avec filtres personnalisés (prix, région, état)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>5-8 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span>~15 pages scannées</span>
                </div>
              </div>
              <Button 
                className="w-full gap-2 group-hover:shadow-lg transition-shadow"
                onClick={() => setModalOpen(true)}
              >
                <Zap className="h-4 w-4" />
                Lancer
              </Button>
            </CardContent>
          </Card>

          {/* Scrap Communautaire */}
          <Card className="border-2 border-accent/50 hover:border-accent transition-colors cursor-pointer group bg-gradient-to-br from-accent/5 to-background">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-accent" />
                <Badge className="bg-accent text-accent-foreground">+12 crédits</Badge>
              </div>
              <CardTitle className="text-xl">Scrap communautaire</CardTitle>
              <CardDescription>
                Contribuez à la base de données et gagnez des crédits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>7-12 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span>~25 pages scannées</span>
                </div>
              </div>
              {communityScrapAvailable ? (
                <Button 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground group-hover:shadow-lg transition-shadow"
                  onClick={() => setModalOpen(true)}
                >
                  <Users className="h-4 w-4" />
                  Contribuer
                </Button>
              ) : (
                <Button 
                  className="w-full gap-2"
                  disabled
                >
                  <Clock className="h-4 w-4" />
                  Disponible demain
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <p>Choisissez le type de scrap selon vos besoins et votre budget de crédits</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <p>Configurez les paramètres (modèle, filtres, période)</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <p>Lancez le scan et restez présent pour gérer les éventuels captchas</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <p>Consultez les résultats et exploitez les données collectées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrapModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
