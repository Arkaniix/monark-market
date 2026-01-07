import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Activity, TrendingUp, Award, Clock, CheckCircle2, XCircle, Timer, AlertCircle, Play, ChevronDown, ChevronUp, Shield, HelpCircle, Star, Flame, MapPin, Loader2, RefreshCw, History, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useScrapJobContext } from "@/context/ScrapJobContext";
import { useAvailableTasks, useMyTasks, useClaimTask, useCommunityStats, useLeaderboard, PRIORITY_COLORS, type CommunityTask } from "@/hooks/useCommunity";
import { CommunityStatsSkeleton, CommunityTasksSkeleton, LeaderboardSkeleton, MyTasksSkeleton } from "@/components/community/CommunitySkeleton";

export default function Community() {
  const navigate = useNavigate();
  const { setActiveJob } = useScrapJobContext();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'30d' | 'all'>('30d');

  // API hooks
  const { data: availableData, isLoading: loadingAvailable, error: errorAvailable, refetch: refetchAvailable } = useAvailableTasks();
  const { data: myTasksData, isLoading: loadingMyTasks, refetch: refetchMyTasks } = useMyTasks();
  const { data: statsData, isLoading: loadingStats } = useCommunityStats();
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useLeaderboard(leaderboardPeriod);
  const claimTask = useClaimTask();
  
  const userLimits = myTasksData?.user_limits;
  const isActive = availableData?.active ?? false;

  // Calculate button state
  const getButtonState = () => {
    if (!isActive) {
      return {
        disabled: true,
        label: "⏳ Reviens plus tard – pas de besoin urgent",
        reason: "Aucune mission prioritaire disponible actuellement."
      };
    }
    if (userLimits && userLimits.used_today >= userLimits.max_comm_jobs_per_day) {
      return {
        disabled: true,
        label: "❗ Limite quotidienne atteinte",
        reason: `Tu as effectué ${userLimits.used_today}/${userLimits.max_comm_jobs_per_day} missions aujourd'hui.`
      };
    }
    if (userLimits && userLimits.cooldown_remaining > 0) {
      return {
        disabled: true,
        label: `🕒 Cooldown en cours (${userLimits.cooldown_remaining} min restantes)`,
        reason: "Attends un peu avant de lancer une nouvelle mission."
      };
    }
    return {
      disabled: false,
      label: "🔥 Lancer une collecte communautaire",
      reason: "Prêt à contribuer !"
    };
  };
  const buttonState = getButtonState();

  // Handle claim task
  const handleClaimTask = async (task: CommunityTask) => {
    try {
      const response = await claimTask.mutateAsync({ task_id: task.id });
      setActiveJob({
        job_id: response.job_id,
        upload_token: response.upload_token,
        platform: response.params.platform,
        keyword: response.params.keyword,
        type: response.params.type,
        params: response.params
      });
      toast.success(`Mission assignée ! Job #${response.job_id} créé.`);
      navigate(`/jobs/${response.job_id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'assignation";
      if (errorMessage.toLowerCase().includes('cooldown')) {
        toast.error("Cooldown actif - Attends avant de lancer une nouvelle mission.", { description: errorMessage });
        refetchMyTasks();
      } else if (errorMessage.toLowerCase().includes('limit')) {
        toast.error("Limite atteinte", { description: errorMessage });
        refetchMyTasks();
      } else {
        toast.error("Impossible de claim la mission", { description: errorMessage });
      }
    }
  };

  // Quick claim - claim first available high priority task
  const handleQuickClaim = async () => {
    const highPriorityTask = availableData?.tasks.find(t => t.priority === 'high');
    const task = highPriorityTask || availableData?.tasks[0];
    if (task) {
      await handleClaimTask(task);
    } else {
      toast.error("Aucune mission disponible");
    }
  };

  const statsCards = [
    { title: "Missions en attente", value: availableData?.summary.pending_missions ?? statsData?.total_missions_completed ?? 0, icon: Activity, color: "text-blue-600" },
    { title: "Pages à couvrir", value: availableData?.summary.estimated_pages ?? statsData?.total_pages_scanned ?? 0, icon: TrendingUp, color: "text-green-600" },
    { title: "Couverture 7j", value: `${((availableData?.summary.coverage_7d_pct ?? statsData?.coverage_7d_pct ?? 0) * 100).toFixed(0)}%`, icon: CheckCircle2, color: "text-purple-600" },
    { title: "Crédits distribués (30j)", value: availableData?.summary.credits_distributed_30d ?? statsData?.total_credits_distributed ?? 0, icon: Award, color: "text-orange-600" },
  ];

  const taskStatusIcon: Record<string, typeof CheckCircle2> = {
    completed: CheckCircle2,
    done: CheckCircle2,
    expired: Timer,
    failed: XCircle,
    pending: Clock,
    running: Activity,
    in_progress: Activity,
  };

  const taskStatusColor: Record<string, string> = {
    completed: "text-green-600",
    done: "text-green-600",
    expired: "text-orange-600",
    failed: "text-red-600",
    pending: "text-muted-foreground",
    running: "text-blue-600",
    in_progress: "text-blue-600",
  };

  const faqs = [
    { id: "1", question: "Pourquoi le bouton est grisé ?", answer: "Le bouton est désactivé s'il n'y a pas de besoin urgent de données ou si tu as atteint ta limite quotidienne de missions." },
    { id: "2", question: "Combien de crédits je gagne ?", answer: "En général +1 crédit par mission 'list-only' et +2 pour les missions 'open-on-new'. Les crédits dépendent aussi de la qualité et du volume scanné." },
    { id: "3", question: "Que faire si je vois un captcha ?", answer: "Résous-le normalement ! Ne recharge pas la page trop rapidement. L'extension attend que tu valides le captcha." },
    { id: "4", question: "Puis-je faire plusieurs missions à la suite ?", answer: "Oui, dans la limite de ta limite quotidienne et en respectant le cooldown entre chaque mission." },
  ];

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-primary flex-shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">🤝 Communauté</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Aide à mettre le marché à jour
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate("/community/history")}>
                <History className="h-4 w-4 mr-2" />
                Mon historique
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/community/leaderboard")}>
                <Trophy className="h-4 w-4 mr-2" />
                Classement
              </Button>
              <Button variant="outline" size="sm" onClick={() => { refetchAvailable(); refetchMyTasks(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Contribue au rafraîchissement des données et gagne des crédits.
          </p>
        </motion.div>

        {/* Error state */}
        {errorAvailable && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des missions. {errorAvailable.message}
              <Button variant="link" onClick={() => refetchAvailable()} className="px-1">
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards - Uniform height */}
        {loadingStats && loadingAvailable ? (
          <CommunityStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statsCards.map((stat, index) => (
              <Card key={index} className="p-3 md:p-4 flex items-center min-h-[72px]">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg md:text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Scrap Block */}
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              Collecte communautaire
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Lance une mission pour contribuer aux données du marché
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 md:space-y-4">
              <div className={`p-3 md:p-4 rounded-lg border ${buttonState.disabled ? "bg-muted border-border" : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"}`}>
                <p className="text-sm font-medium mb-1">{buttonState.reason}</p>
                {!buttonState.disabled && availableData?.tasks[0] && (
                  <p className="text-xs text-muted-foreground">
                    Modèle prioritaire : {availableData.tasks[0].model_name}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleQuickClaim} 
                disabled={buttonState.disabled || claimTask.isPending || loadingAvailable} 
                className="w-full" 
                size="lg"
              >
                {claimTask.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assignation...
                  </>
                ) : buttonState.label}
              </Button>
              {userLimits && (
                <p className="text-xs text-muted-foreground text-center">
                  Missions aujourd'hui : {userLimits.used_today}/{userLimits.max_comm_jobs_per_day}
                  {userLimits.cooldown_remaining > 0 && (
                    <span className="ml-2 text-warning">
                      • Cooldown : {userLimits.cooldown_remaining} min
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Missions + Summary - 70/30 ratio on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 md:gap-6 items-start">
          {/* Available Tasks */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">Missions disponibles</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Clique sur une mission pour la claim et démarrer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvailable ? (
                <CommunityTasksSkeleton />
              ) : availableData?.tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune mission disponible pour le moment.
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {availableData?.tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="p-3 md:p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer group" 
                      onClick={() => !buttonState.disabled && handleClaimTask(task)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-sm md:text-base truncate">{task.model_name}</p>
                            <Badge variant={PRIORITY_COLORS[task.priority]} className="text-xs flex-shrink-0">
                              {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {task.platform}
                            </Badge>
                          </div>
                          {task.context && <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{task.context}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className={`w-4 h-4 md:w-5 md:h-5 ${task.priority === "high" ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0" 
                            disabled={buttonState.disabled || claimTask.isPending} 
                            onClick={e => {
                              e.stopPropagation();
                              handleClaimTask(task);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{task.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>~{task.estimated_time_min}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{task.region || "FR"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <Award className="w-3 h-3 flex-shrink-0" />
                          <span>+{task.reward_credits}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground hidden md:flex">
                          <Timer className="w-3 h-3 flex-shrink-0" />
                          <span>p.{task.pages_from}-{task.pages_to}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Summary - Fixed width sidebar */}
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">Ton résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingMyTasks ? (
                <MyTasksSkeleton />
              ) : (
                <>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs md:text-sm text-muted-foreground">Crédits ce mois-ci</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      +{myTasksData?.tasks.filter(t => t.status === "completed" || t.status === "done").reduce((acc, t) => acc + t.credits_earned, 0) ?? 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Missions</p>
                      <p className="text-lg md:text-xl font-semibold">
                        {myTasksData?.tasks.filter(t => t.status === "completed" || t.status === "done").length ?? 0}
                      </p>
                    </div>
                    {userLimits && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Limite jour</p>
                        <p className="text-lg md:text-xl font-semibold">
                          {userLimits.used_today}/{userLimits.max_comm_jobs_per_day}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>


        {/* History & Leaderboard Previews - Equal width columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Personal History Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
              <div>
                <CardTitle className="text-base md:text-lg">Historique personnel</CardTitle>
                <CardDescription className="text-xs md:text-sm">Tes dernières contributions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/community/history")} className="flex-shrink-0">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingMyTasks ? (
                <MyTasksSkeleton />
              ) : myTasksData?.tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Aucune mission effectuée.
                </p>
              ) : (
                <div className="space-y-2">
                  {myTasksData?.tasks.slice(0, 4).map(task => {
                    const StatusIcon = taskStatusIcon[task.status];
                    return (
                      <div 
                        key={task.id} 
                        className="p-2.5 md:p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer" 
                        onClick={() => navigate(`/jobs/${task.job_id}`)}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <StatusIcon className={`w-4 h-4 flex-shrink-0 ${taskStatusColor[task.status]}`} />
                            <p className="font-semibold text-sm truncate">{task.model_name}</p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {task.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <span>{task.pages_scanned} pages</span>
                          <span>{task.ads_found} annonces</span>
                          <span className="text-green-600">+{task.credits_earned}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
              <div>
                <CardTitle className="text-base md:text-lg">Classement</CardTitle>
                <CardDescription className="text-xs md:text-sm">Les meilleurs contributeurs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/community/leaderboard")} className="flex-shrink-0">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={leaderboardPeriod} onValueChange={v => setLeaderboardPeriod(v as '30d' | 'all')}>
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="30d">30 jours</TabsTrigger>
                  <TabsTrigger value="all">All-time</TabsTrigger>
                </TabsList>
                <TabsContent value={leaderboardPeriod} className="mt-0">
                  {loadingLeaderboard ? (
                    <LeaderboardSkeleton />
                  ) : leaderboardData?.entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">
                      Aucune donnée disponible.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboardData?.entries.slice(0, 4).map(entry => (
                        <div key={entry.rank} className="p-2.5 md:p-3 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <span className={`text-base md:text-lg font-bold flex-shrink-0 w-6 ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                                #{entry.rank}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{entry.user_display}</p>
                                {entry.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {entry.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold text-green-600">
                                {entry.credits} cr.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.missions} missions
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>


        {/* Rules & FAQ - Consistent with other cards */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              Règles d'or & FAQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rules */}
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Règles d'or</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Respect des plateformes : pas d'automatisation serveur, captcha humain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Vitesse : respecte les délais entre pages pour éviter les blocages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Plage & périmètre : ne pas déborder (reste sur la fourchette indiquée)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Confidentialité : données agrégées et anonymisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>RGPD : demande de suppression à tout moment</span>
                  </li>
                </ul>
              </div>

              {/* FAQ */}
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Questions fréquentes</h3>
                <div className="space-y-2">
                  {faqs.map(faq => (
                    <Collapsible 
                      key={faq.id} 
                      open={expandedFaq === faq.id} 
                      onOpenChange={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-2.5 md:p-3 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs md:text-sm font-medium text-left truncate">{faq.question}</span>
                          </div>
                          {expandedFaq === faq.id ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-2.5 md:p-3 text-xs md:text-sm text-muted-foreground">
                          {faq.answer}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
