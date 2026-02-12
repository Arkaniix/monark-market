import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";

interface Trend {
  name: string;
  change: number;
  category: string;
}

interface MarketOpportunitiesProps {
  risingTrends: Trend[];
  fallingTrends: Trend[];
  dailyVolume: number;
  recentAnalyses?: Array<{
    id: number;
    title: string;
    score: number;
    verdict: string;
    date: string;
  }>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function MarketOpportunities({
  risingTrends,
  fallingTrends,
  dailyVolume,
  recentAnalyses = []
}: MarketOpportunitiesProps) {
  const getCategoryColor = () => "bg-secondary text-secondary-foreground";

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success bg-success/10 border-success/30";
    if (score >= 4) return "text-warning bg-warning/10 border-warning/30";
    return "text-destructive bg-destructive/10 border-destructive/30";
  };

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Analyses récentes & Marché</h2>
          <p className="text-muted-foreground">Vos dernières analyses Lens et tendances du moment</p>
        </div>

        <div className="space-y-6">
          {/* Dernières analyses Lens */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Dernières analyses Lens</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Annonces analysées via l'extension</p>
                    </div>
                  </div>
                  <Link to="/estimator">
                    <Button variant="outline" size="sm">
                      Estimator
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentAnalyses.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAnalyses.slice(0, 6).map((analysis) => (
                      <Card key={analysis.id} className="hover:border-primary/50 transition-all hover:shadow-md h-full">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <Badge className={`${getScoreColor(analysis.score)} border`}>
                                Score: {analysis.score}/10
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {analysis.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">{analysis.verdict}</p>
                            <p className="text-xs text-muted-foreground/60">{analysis.date}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">Aucune analyse récente</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Installez l'extension Monark Lens pour analyser des annonces sur Leboncoin, eBay et Vinted
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                        Installer Monark Lens
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tendances du marché */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <Card className="border-success/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <CardTitle className="text-lg">Top hausses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risingTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20 group cursor-pointer hover:bg-success/10 transition-colors">
                      <div className="h-full w-1 bg-success rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{trend.name}</p>
                        <Badge className={getCategoryColor()} variant="outline">{trend.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-success font-bold">
                        <TrendingUp className="h-4 w-4" />
                        +{trend.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Top baisses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fallingTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 group cursor-pointer hover:bg-destructive/10 transition-colors">
                      <div className="h-full w-1 bg-destructive rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{trend.name}</p>
                        <Badge className={getCategoryColor()} variant="outline">{trend.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-destructive font-bold">
                        <TrendingDown className="h-4 w-4" />
                        {trend.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Activité marché</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Annonces analysées (communauté)</p>
                    <div className="text-4xl font-bold text-foreground">{dailyVolume.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">cette semaine</p>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GPU</span>
                      <span className="font-medium text-foreground">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-medium text-foreground">28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Autres</span>
                      <span className="font-medium text-foreground">27%</span>
                    </div>
                  </div>
                  <Link to="/catalog">
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Explorer le catalogue
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
