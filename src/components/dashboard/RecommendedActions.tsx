import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Eye, GraduationCap, Award, Zap, Target, Trophy, ArrowRight, BookOpen, CheckCircle2, Clock, Download, Compass } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendedActionsProps {
  watchlistItems: Array<{
    name: string;
    category: string;
  }>;
  alerts: Array<{
    message: string;
    type: string;
  }>;
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
  const progressPercentage = trainingProgress.completed / trainingProgress.total * 100;

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Actions recommandées</h2>
          <p className="text-muted-foreground">Optimise ton utilisation de Monark Lens</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Actions rapides Lens */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Actions rapides</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Lancer une analyse */}
                <Link to="/estimator">
                  <Button size="lg" className="w-full justify-start gap-3 h-auto py-5 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-background/10 relative z-10">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1 relative z-10">
                      <div className="font-semibold">Lancer une analyse</div>
                      <div className="text-xs opacity-90">Rapide (5 cr.) · Approfondie (20 cr.)</div>
                    </div>
                  </Button>
                </Link>

                {/* Extension CTA */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Extension Monark Lens</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Analysez les annonces directement sur Leboncoin, eBay et Vinted
                  </p>
                  <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/10" asChild>
                    <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                      Installer l'extension
                    </a>
                  </Button>
                </div>

                {/* Watchlist */}
                <Card className="bg-muted/50 flex-1">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
                        <Compass className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Ma watchlist</h4>
                        <p className="text-xs text-muted-foreground mb-3">Composants suivis pour alertes prix</p>
                        {watchlistItems.length > 0 ? (
                          <div className="space-y-2">
                            {watchlistItems.slice(0, 4).map((item, idx) => (
                              <div
                                key={idx}
                                className="w-full flex items-center justify-between text-sm p-3 rounded-lg bg-background border border-transparent"
                              >
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline">{item.category}</Badge>
                              </div>
                            ))}
                            {watchlistItems.length > 4 && (
                              <p className="text-xs text-muted-foreground text-center pt-1">
                                +{watchlistItems.length - 4} autres composants
                              </p>
                            )}
                            <Link to="/tracking?tab=watchlist">
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                Voir toute ma watchlist
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-3">Aucun composant suivi</p>
                            <Link to="/catalog">
                              <Button variant="outline" size="sm">Explorer le catalogue</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Missions Lens */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Missions Lens</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Navigue avec l'extension et gagne des crédits automatiquement 💰
                  </p>
                  <Link to="/community">
                    <Button variant="outline" size="sm" className="w-full border-success/20 hover:bg-success/10">
                      Voir les missions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formation & progression */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Formation & Progression</CardTitle>
                    <p className="text-xs text-muted-foreground">Maîtrise le buy/resell</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Progression globale</span>
                    <Badge variant="outline" className="border-accent/30 text-accent">
                      {trainingProgress.completed}/{trainingProgress.total} modules
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progressPercentage)}% complété</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{(trainingProgress.total - trainingProgress.completed) * 10} min restantes
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Parcours de formation
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { name: "Comprendre le marché", completed: true },
                      { name: "Rechercher intelligemment", completed: true },
                      { name: "Analyser la rentabilité", completed: trainingProgress.completed >= 3 },
                      { name: "Acheter et négocier", completed: trainingProgress.completed >= 4 },
                      { name: "Vendre efficacement", completed: trainingProgress.completed >= 5 },
                      { name: "Rentabilité durable", completed: trainingProgress.completed >= 6 },
                    ].map((module, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                          module.completed
                            ? "bg-success/10 text-success"
                            : idx === trainingProgress.completed
                            ? "bg-accent/10 border border-accent/30"
                            : "text-muted-foreground"
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                            idx === trainingProgress.completed ? "border-accent" : "border-muted-foreground/30"
                          }`} />
                        )}
                        <span className={idx === trainingProgress.completed ? "font-medium text-foreground" : ""}>
                          {module.name}
                        </span>
                        {idx === trainingProgress.completed && (
                          <Badge variant="secondary" className="ml-auto text-xs">En cours</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Link to="/training">
                  <Button className="w-full gap-2">
                    {trainingProgress.completed === 0 ? "Commencer la formation" : "Continuer ma formation"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Classement communautaire */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-background h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  <CardTitle>Classement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-warning/20 to-warning/10 border-2 border-warning/30 mb-3">
                    <span className="text-3xl font-bold text-warning">#{userRank}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Ton classement global</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">Top {userPercentile}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu fais partie des utilisateurs les plus actifs de la communauté 🔥
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Tes contributions</h4>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">847</div>
                      <p className="text-sm text-muted-foreground mt-1">Annonces enrichies via Lens</p>
                    </CardContent>
                  </Card>
                </div>

                <Link to="/leaderboard">
                  <Button className="w-full gap-2">
                    Voir le classement complet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
