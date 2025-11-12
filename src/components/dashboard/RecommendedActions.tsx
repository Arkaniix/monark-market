import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Search, 
  Eye, 
  Bell, 
  GraduationCap,
  Award,
  Zap,
  Target,
  Trophy,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import ScrapModal from "@/components/ScrapModal";

interface RecommendedActionsProps {
  watchlistItems: Array<{ name: string; category: string }>;
  alerts: Array<{ message: string; type: string }>;
  trainingProgress: {
    completed: number;
    total: number;
    lastModule: string;
  };
  userRank?: number;
  userPercentile?: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function RecommendedActions({ 
  watchlistItems, 
  alerts,
  trainingProgress,
  userRank = 245,
  userPercentile = 10
}: RecommendedActionsProps) {
  const [scrapModalOpen, setScrapModalOpen] = useState(false);
  const progressPercentage = (trainingProgress.completed / trainingProgress.total) * 100;
  const communityScrapAvailable = true; // À récupérer via API
  const userScrapCount = 24; // Stats du mois en cours

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Actions recommandées</h2>
          <p className="text-muted-foreground">Optimise ton utilisation de la plateforme</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Actions rapides */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Actions rapides</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Lancer un scrap */}
                <div className="space-y-2">
                  <Button 
                    size="lg" 
                    className="w-full justify-start gap-3 h-auto py-5 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all"
                    onClick={() => setScrapModalOpen(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-background/10 relative z-10">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1 relative z-10">
                      <div className="font-semibold">Lancer un nouveau scrap</div>
                      <div className="text-xs opacity-90">Faible · Fort · Communautaire</div>
                    </div>
                  </Button>
                  {communityScrapAvailable && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-success/10 border border-success/20">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-medium text-success">1 scrap communautaire disponible aujourd'hui !</span>
                    </div>
                  )}
                </div>

                {/* Analyser watchlist */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Analyser mes composants</h4>
                {watchlistItems.length > 0 ? (
                          <div className="space-y-2">
                            {watchlistItems.slice(0, 2).map((item, idx) => (
                              <Link key={idx} to={`/catalog?search=${item.name}`}>
                                <div className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                                  <span className="text-muted-foreground">{item.name}</span>
                                  <Badge variant="outline">{item.category}</Badge>
                                </div>
                              </Link>
                            ))}
                            <Link to="/catalog">
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                Voir ma watchlist
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucun composant suivi</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Voir les alertes */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Mes alertes</h4>
                        {alerts.length > 0 ? (
                          <div className="space-y-2">
                            {alerts.slice(0, 2).map((alert, idx) => (
                              <div key={idx} className="text-sm p-2 rounded bg-warning/10 border border-warning/20">
                                {alert.message}
                              </div>
                            ))}
                            {alerts.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{alerts.length - 2} autres alertes
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucune alerte active</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Message communautaire */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Scrap communautaire</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Contribue à la base de données et gagne des crédits 💰
                  </p>
                  <Link to="/community">
                    <Button variant="outline" size="sm" className="w-full border-success/20 hover:bg-success/10">
                      Participer maintenant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formation & progression */}
          <motion.div 
            variants={itemVariants} 
            initial="hidden" 
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🎓</div>
                  <CardTitle>Formation & Progression</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barre de progression */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Modules complétés
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {trainingProgress.completed}/{trainingProgress.total}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(progressPercentage)}% de progression
                  </p>
                </div>

                {/* Dernier module */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-1">Dernier module</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {trainingProgress.lastModule}
                    </p>
                    <Link to="/training">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        Continuer ma formation
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Récompenses */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    Récompenses à débloquer
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                          <Award className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">+1 crédit</p>
                          <p className="text-xs text-muted-foreground">Par module terminé</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Badge Expert</p>
                          <p className="text-xs text-muted-foreground">100% de complétion</p>
                        </div>
                      </div>
                      {progressPercentage === 100 && (
                        <Badge variant="default">Débloqué!</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Classement communautaire */}
          <motion.div 
            variants={itemVariants} 
            initial="hidden" 
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  <CardTitle>Classement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rang actuel */}
                <div className="text-center py-6">
                  <div 
                    className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-warning/20 to-warning/10 border-2 border-warning/30 mb-3 cursor-pointer hover:scale-105 transition-transform group"
                    title={`${userScrapCount} scraps ce mois-ci – ${100 - userPercentile}e percentile`}
                  >
                    <span className="text-3xl font-bold text-warning">#{userRank}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Ton classement global</p>
                </div>

                {/* Performance */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">Top {userPercentile}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu fais partie des utilisateurs les plus actifs de la communauté 🔥
                  </p>
                </div>

                {/* Statistiques communautaires */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Tes contributions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-muted/50">
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-primary">847</div>
                        <p className="text-xs text-muted-foreground mt-1">Scraps totaux</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-accent">23</div>
                        <p className="text-xs text-muted-foreground mt-1">Crédits gagnés</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link to="/community">
                    <Button variant="outline" className="w-full gap-2">
                      Voir le classement complet
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/community">
                    <Button variant="ghost" size="sm" className="w-full gap-2 text-xs">
                      🔍 Voir détails
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <ScrapModal open={scrapModalOpen} onOpenChange={setScrapModalOpen} />
    </section>
  );
}