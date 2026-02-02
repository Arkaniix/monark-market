import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, CreditCard, Target, Bell, TrendingUp, Clock, CheckCircle, AlertCircle, PiggyBank, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useMemo } from "react";
import { CreditResetInfo } from "@/components/credits/CreditResetInfo";
import { ActivityHistoryModal } from "./ActivityHistoryModal";
interface PersonalStatsProps {
  totalScraps: number;
  creditsRemaining: number;
  creditsResetDate?: string | null;
  opportunitiesDetected?: number;
  alertsTriggered?: number;
  potentialSavings?: number;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
  }>;
  performanceData: Array<{
    day: number;
    scans?: number;
    margin?: number;
    credits?: number;
  }>;
}
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};
export function PersonalStats({
  totalScraps,
  creditsRemaining,
  creditsResetDate,
  opportunitiesDetected = 0,
  alertsTriggered = 0,
  potentialSavings = 0,
  recentActivity,
  performanceData
}: PersonalStatsProps) {
  const [timeFilter, setTimeFilter] = useState<'7j' | '30j' | '90j'>('30j');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Générer les données filtrées selon la période sélectionnée
  const filteredData = useMemo(() => {
    const periodDays = timeFilter === '7j' ? 7 : timeFilter === '30j' ? 30 : 90;
    
    // Générateur pseudo-aléatoire avec seed pour données cohérentes
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    const baseSeed = timeFilter === '7j' ? 42 : timeFilter === '30j' ? 137 : 256;
    
    return Array.from({ length: periodDays }, (_, i) => {
      const seed = baseSeed + i * 7.3;
      const random1 = seededRandom(seed);
      const random2 = seededRandom(seed + 100);
      
      // Tendance légère à la hausse + bruit réaliste
      const trend = (i / periodDays) * 1.5;
      const weekdayEffect = (i % 7 < 5) ? 1.2 : 0.6; // Plus actif en semaine
      const noise = (random1 - 0.5) * 4;
      const spike = random2 > 0.9 ? 3 : 0; // Pics occasionnels
      
      return {
        day: i + 1,
        scans: Math.max(0, Math.round(2 + trend + weekdayEffect + noise + spike))
      };
    });
  }, [timeFilter]);
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scrap":
      case "scan":
        return <Search className="h-4 w-4 text-primary" />;
      case "credit":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "credit":
        return "bg-success/5 border-success/10";
      default:
        return "bg-muted/50";
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
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatChartDate = (dayNumber: number) => {
    const periodDays = timeFilter === '7j' ? 7 : timeFilter === '30j' ? 30 : 90;
    const date = new Date();
    date.setDate(date.getDate() - (periodDays - dayNumber));
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  return <section className="py-8">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Vue d'ensemble personnelle</h2>
          <p className="text-muted-foreground">Synthèse de tes performances et activités</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Statistiques principales */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    Total Scans
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{totalScraps}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rapides · Approfondis · Communautaires
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-background h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-success" />
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    Crédits disponibles
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-success">{creditsRemaining}</div>
                  {creditsResetDate && <CreditResetInfo resetDate={creditsResetDate} creditsRemaining={creditsRemaining} variant="compact" />}
                  <div className="flex items-center gap-2">
                    <Link to="/community">
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        Gagner des crédits
                      </Button>
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <Link to="/billing">
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Acheter
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    Opportunités détectées
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{opportunitiesDetected}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deals sous le prix du marché
                    </p>
                  </div>
                </div>
                <Link to="/deals">
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2">
                    Voir les opportunités
                  </Button>
                </Link>
              </CardContent>
            </Card>


            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-background h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-success" />
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    Économies potentielles
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-success">{potentialSavings} €</div>
                  <p className="text-xs text-muted-foreground">
                    Sur vos articles suivis
                  </p>
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
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map(activity => <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityBgColor(activity.type)}`}>
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>)}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => setHistoryModalOpen(true)}
                >
                  Voir l'historique complet
                </Button>
                <ActivityHistoryModal 
                  open={historyModalOpen} 
                  onOpenChange={setHistoryModalOpen} 
                  activities={recentActivity} 
                />
              </CardContent>
            </Card>

            {/* Graphique de performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <CardTitle>Performance sur {timeFilter === '7j' ? '7' : timeFilter === '30j' ? '30' : '90'} jours</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-md bg-muted">
                      <Button variant={timeFilter === '7j' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setTimeFilter('7j')}>
                        7j
                      </Button>
                      <Button variant={timeFilter === '30j' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setTimeFilter('30j')}>
                        30j
                      </Button>
                      <Button variant={timeFilter === '90j' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setTimeFilter('90j')}>
                        90j
                      </Button>
                    </div>
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatChartDate} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} />
                      <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
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
    </section>;
}