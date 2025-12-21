// Credit gain history component - shows past community scrap rewards
import { useMemo } from "react";
import { Coins, Calendar, TrendingUp, Target, Package, Clock, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow, format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { MyTask } from "@/providers/types";

interface CreditGainHistoryProps {
  tasks: MyTask[];
  isLoading?: boolean;
  compact?: boolean;
}

// Analyze credit gains from completed tasks
function analyzeGains(tasks: MyTask[]) {
  const now = new Date();
  const completedTasks = tasks.filter(t => 
    t.status === 'completed' || t.status === 'done'
  );
  
  // Total gains
  const totalCreditsEarned = completedTasks.reduce((sum, t) => sum + (t.credits_earned || 0), 0);
  
  // Last 7 days gains
  const sevenDaysAgo = subDays(now, 7);
  const last7DaysTasks = completedTasks.filter(t => 
    new Date(t.completed_at || t.date) >= sevenDaysAgo
  );
  const credits7Days = last7DaysTasks.reduce((sum, t) => sum + (t.credits_earned || 0), 0);
  
  // Last 30 days gains
  const thirtyDaysAgo = subDays(now, 30);
  const last30DaysTasks = completedTasks.filter(t => 
    new Date(t.completed_at || t.date) >= thirtyDaysAgo
  );
  const credits30Days = last30DaysTasks.reduce((sum, t) => sum + (t.credits_earned || 0), 0);
  
  // Average per mission
  const avgPerMission = completedTasks.length > 0 
    ? Math.round(totalCreditsEarned / completedTasks.length * 10) / 10 
    : 0;
  
  // Best single gain
  const bestGain = completedTasks.reduce((max, t) => 
    Math.max(max, t.credits_earned || 0), 0
  );
  
  // Daily breakdown for chart (last 7 days)
  const dailyGains: { date: string; day: string; credits: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 86400000 - 1);
    
    const dayTasks = completedTasks.filter(t => {
      const taskDate = new Date(t.completed_at || t.date);
      return isWithinInterval(taskDate, { start: dayStart, end: dayEnd });
    });
    
    const dayCredits = dayTasks.reduce((sum, t) => sum + (t.credits_earned || 0), 0);
    
    dailyGains.push({
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE', { locale: fr }),
      credits: dayCredits,
    });
  }
  
  return {
    totalCreditsEarned,
    credits7Days,
    credits30Days,
    avgPerMission,
    bestGain,
    completedCount: completedTasks.length,
    dailyGains,
    recentTasks: completedTasks.slice(0, 5),
  };
}

export function CreditGainHistory({ tasks, isLoading, compact = false }: CreditGainHistoryProps) {
  const stats = useMemo(() => analyzeGains(tasks), [tasks]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="p-2 rounded-full bg-green-500/10">
          <Coins className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{stats.credits30Days}
            </span>
            <span className="text-sm text-muted-foreground">crédits ce mois</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completedCount} missions • ~{stats.avgPerMission} crédits/mission
          </p>
        </div>
        {stats.bestGain >= 15 && (
          <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Award className="h-3 w-3" />
            Record: +{stats.bestGain}
          </Badge>
        )}
      </div>
    );
  }
  
  const maxDailyCredits = Math.max(...stats.dailyGains.map(d => d.credits), 10);
  
  return (
    <Card className="bg-gradient-to-br from-green-500/5 via-transparent to-transparent border-green-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-4 w-4 text-green-500" />
          Historique de gains
        </CardTitle>
        <CardDescription>
          Crédits gagnés via le scrap communautaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total gagné</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{stats.totalCreditsEarned}
            </p>
            <p className="text-xs text-muted-foreground">crédits</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cette semaine</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xl font-bold">+{stats.credits7Days}</p>
            </div>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Moyenne</p>
            <p className="text-xl font-bold">{stats.avgPerMission}</p>
            <p className="text-xs text-muted-foreground">crédits / mission</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Meilleur gain</p>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                +{stats.bestGain}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">sur une mission</p>
          </div>
        </div>
        
        {/* Daily gains mini chart */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">Gains des 7 derniers jours</p>
          <div className="flex items-end justify-between gap-1 h-16">
            {stats.dailyGains.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-green-500/20 rounded-t"
                  style={{ 
                    height: `${Math.max(4, (day.credits / maxDailyCredits) * 100)}%`,
                    minHeight: '4px'
                  }}
                >
                  {day.credits > 0 && (
                    <div 
                      className="w-full h-full bg-green-500/60 rounded-t transition-all"
                    />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent gains list */}
        {stats.recentTasks.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Derniers gains</p>
            <div className="space-y-2">
              {stats.recentTasks.map((task, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded bg-green-500/10 shrink-0">
                      <Target className="h-3 w-3 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.model_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{task.pages_scanned} pages</span>
                        <span>•</span>
                        <span>{task.ads_found} annonces</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    >
                      +{task.credits_earned}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(task.completed_at || task.date), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {stats.completedCount === 0 && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">Aucun gain pour le moment</p>
            <p className="text-xs text-muted-foreground">
              Complétez des missions communautaires pour gagner des crédits
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
