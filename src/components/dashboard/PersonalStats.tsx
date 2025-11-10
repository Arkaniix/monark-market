import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Search, 
  CreditCard, 
  Eye, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface PersonalStatsProps {
  totalScraps: number;
  creditsRemaining: number;
  watchlistCount: number;
  estimatedGains: number;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
  }>;
  performanceData: Array<{
    day: number;
    scraps?: number;
    margin?: number;
    credits?: number;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function PersonalStats({ 
  totalScraps, 
  creditsRemaining, 
  watchlistCount, 
  estimatedGains,
  recentActivity,
  performanceData
}: PersonalStatsProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scrap": return <Search className="h-4 w-4 text-primary" />;
      case "credit": return <CreditCard className="h-4 w-4 text-success" />;
      case "alert": return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Vue d'ensemble personnelle</h2>
          <p className="text-muted-foreground">Synthèse de tes performances et activités</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Statistiques principales */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Total Scraps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{totalScraps}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Faibles · Forts · Communautaires
                    </p>
                  </div>
                  <Search className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Crédits disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-success">{creditsRemaining}</div>
                    <Link to="/community">
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Gagner des crédits
                      </Button>
                    </Link>
                  </div>
                  <CreditCard className="h-8 w-8 text-success opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Composants suivis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{watchlistCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dans la watchlist
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-accent opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Gains estimés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-warning">{estimatedGains} €</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basé sur historique
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-warning opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Historique d'activité et Graphique */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
            {/* Historique d'activité */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Activité récente</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Voir l'historique complet
                </Button>
              </CardContent>
            </Card>

            {/* Graphique de performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance sur 30 jours</CardTitle>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="scraps" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Scraps effectués</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}