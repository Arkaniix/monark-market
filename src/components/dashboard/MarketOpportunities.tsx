import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  MapPin,
  Package,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

interface Deal {
  id: number;
  title: string;
  price: number;
  fairValue: number;
  deviationPct: number;
  city: string;
  condition: string;
  category: string;
}

interface Trend {
  name: string;
  change: number;
  category: string;
}

interface MarketOpportunitiesProps {
  topDeals: Deal[];
  risingTrends: Trend[];
  fallingTrends: Trend[];
  dailyVolume: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function MarketOpportunities({ 
  topDeals, 
  risingTrends, 
  fallingTrends,
  dailyVolume
}: MarketOpportunitiesProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "GPU": return "bg-primary/10 text-primary";
      case "CPU": return "bg-accent/10 text-accent";
      case "RAM": return "bg-success/10 text-success";
      case "SSD": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Opportunités & Marché</h2>
          <p className="text-muted-foreground">Les meilleures affaires et tendances du moment</p>
        </div>

        <div className="space-y-6">
          {/* Meilleures opportunités */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-warning" />
                    <CardTitle>Meilleures opportunités du moment</CardTitle>
                  </div>
                  <Link to="/deals">
                    <Button variant="outline" size="sm">
                      Voir tout
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topDeals.slice(0, 6).map((deal) => (
                    <Link key={deal.id} to={`/ad/${deal.id}`}>
                      <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* En-tête */}
                            <div className="flex items-start justify-between gap-2">
                              <Badge className={getCategoryColor(deal.category)}>
                                {deal.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Score: {Math.round((1 + deal.deviationPct / 100) * 100)}
                              </Badge>
                            </div>

                            {/* Titre */}
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {deal.title}
                            </h3>

                            {/* Prix et économie */}
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                  {deal.price} €
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {deal.fairValue} €
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-success text-sm font-medium">
                                <TrendingDown className="h-4 w-4" />
                                Économie de {Math.abs(deal.deviationPct).toFixed(1)}%
                              </div>
                            </div>

                            {/* Localisation et état */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {deal.city}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {deal.condition}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
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
            {/* Top hausses */}
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
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{trend.name}</p>
                        <Badge className={getCategoryColor(trend.category)} variant="outline">
                          {trend.category}
                        </Badge>
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

            {/* Top baisses */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Top baisses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fallingTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{trend.name}</p>
                        <Badge className={getCategoryColor(trend.category)} variant="outline">
                          {trend.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <TrendingDown className="h-4 w-4" />
                        {trend.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Volume du jour */}
            <Card className="border-accent/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">Activité marché</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Volume d'annonces</p>
                    <div className="text-4xl font-bold text-accent">{dailyVolume.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">annonces aujourd'hui</p>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GPU</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Autres</span>
                      <span className="font-medium">27%</span>
                    </div>
                  </div>
                  <Link to="/trends">
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Voir page complète
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