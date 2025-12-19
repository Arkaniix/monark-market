import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
  Play,
  ChevronDown,
  ChevronUp,
  Shield,
  HelpCircle,
  Star,
  Flame,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useScrapJobContext } from "@/context/ScrapJobContext";
import {
  useAvailableTasks,
  useMyTasks,
  useClaimTask,
  useCommunityStats,
  useLeaderboard,
  PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  type CommunityTask,
} from "@/hooks/useCommunity";
import {
  CommunityStatsSkeleton,
  CommunityTasksSkeleton,
  LeaderboardSkeleton,
  MyTasksSkeleton,
} from "@/components/community/CommunitySkeleton";

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
        reason: "Aucune mission prioritaire disponible actuellement.",
      };
    }
    if (userLimits && userLimits.used_today >= userLimits.max_comm_jobs_per_day) {
      return {
        disabled: true,
        label: "❗ Limite quotidienne atteinte",
        reason: `Tu as effectué ${userLimits.used_today}/${userLimits.max_comm_jobs_per_day} missions aujourd'hui.`,
      };
    }
    if (userLimits && userLimits.cooldown_remaining > 0) {
      return {
        disabled: true,
        label: `🕒 Cooldown en cours (${userLimits.cooldown_remaining} min restantes)`,
        reason: "Attends un peu avant de lancer une nouvelle mission.",
      };
    }
    return {
      disabled: false,
      label: "🔥 Lancer un scrap communautaire",
      reason: "Prêt à contribuer !",
    };
  };

  const buttonState = getButtonState();

  // Handle claim task
  const handleClaimTask = async (task: CommunityTask) => {
    try {
      const response = await claimTask.mutateAsync({ task_id: task.id });
      
      // Store in context
      setActiveJob({
        job_id: response.job_id,
        upload_token: response.upload_token,
        platform: response.params.platform,
        keyword: response.params.keyword,
        type: response.params.type,
        params: response.params,
      });

      toast.success(`Mission assignée ! Job #${response.job_id} créé.`);
      navigate(`/jobs/${response.job_id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'assignation";
      
      // Check for cooldown error
      if (errorMessage.toLowerCase().includes('cooldown')) {
        toast.error("Cooldown actif - Attends avant de lancer une nouvelle mission.", {
          description: errorMessage,
        });
        refetchMyTasks(); // Refresh limits
      } else if (errorMessage.toLowerCase().includes('limit')) {
        toast.error("Limite atteinte", {
          description: errorMessage,
        });
        refetchMyTasks();
      } else {
        toast.error("Impossible de claim la mission", {
          description: errorMessage,
        });
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
    {
      title: "Missions en attente",
      value: availableData?.summary.pending_missions ?? statsData?.total_missions_completed ?? 0,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Pages à couvrir",
      value: availableData?.summary.estimated_pages ?? statsData?.total_pages_scanned ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Couverture 7j",
      value: `${((availableData?.summary.coverage_7d_pct ?? statsData?.coverage_7d_pct ?? 0) * 100).toFixed(0)}%`,
      icon: CheckCircle2,
      color: "text-purple-600",
    },
    {
      title: "Crédits distribués (30j)",
      value: availableData?.summary.credits_distributed_30d ?? statsData?.total_credits_distributed ?? 0,
      icon: Award,
      color: "text-orange-600",
    },
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
    {
      id: "1",
      question: "Pourquoi le bouton est grisé ?",
      answer: "Le bouton est désactivé s'il n'y a pas de besoin urgent de données ou si tu as atteint ta limite quotidienne de missions.",
    },
    {
      id: "2",
      question: "Combien de crédits je gagne ?",
      answer: "En général +1 crédit par mission 'list-only' et +2 pour les missions 'open-on-new'. Les crédits dépendent aussi de la qualité et du volume scanné.",
    },
    {
      id: "3",
      question: "Que faire si je vois un captcha ?",
      answer: "Résous-le normalement ! Ne recharge pas la page trop rapidement. L'extension attend que tu valides le captcha.",
    },
    {
      id: "4",
      question: "Puis-je faire plusieurs missions à la suite ?",
      answer: "Oui, dans la limite de ta limite quotidienne et en respectant le cooldown entre chaque mission.",
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">🤝 Communauté</h1>
                <p className="text-muted-foreground text-lg">
                  Aide à mettre le marché à jour
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchAvailable();
                refetchMyTasks();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          <p className="text-muted-foreground">
            Contribue au rafraîchissement des données et gagne des crédits.
          </p>
        </motion.div>

        {/* Error state */}
        {errorAvailable && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des missions. {errorAvailable.message}
              <Button variant="link" onClick={() => refetchAvailable()} className="px-1">
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        {loadingStats && loadingAvailable ? (
          <div className="mb-8">
            <CommunityStatsSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Objectif hebdo : couvrir 100% des pages des modèles chauds</p>
              <span className="text-sm text-muted-foreground">
                {((availableData?.summary.coverage_7d_pct ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(availableData?.summary.coverage_7d_pct ?? 0) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Le scrap communautaire est manuel via l'extension
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Reste présent pour les captchas. Respecte les délais entre pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Scrap Block */}
        <Card className="mb-8 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Scrap communautaire
            </CardTitle>
            <CardDescription>
              Lance une mission pour contribuer aux données du marché
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                buttonState.disabled 
                  ? "bg-muted border-border" 
                  : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
              }`}>
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
                ) : (
                  buttonState.label
                )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Available Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Missions disponibles</CardTitle>
                <CardDescription>
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
                  <div className="space-y-4">
                    {availableData?.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                        onClick={() => !buttonState.disabled && handleClaimTask(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{task.model_name}</p>
                              <Badge variant={PRIORITY_COLORS[task.priority]} className="text-xs">
                                {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.platform}
                              </Badge>
                            </div>
                            {task.context && (
                              <p className="text-sm text-muted-foreground">{task.context}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className={`w-5 h-5 flex-shrink-0 ${
                              task.priority === "high" ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
                            }`} />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={buttonState.disabled || claimTask.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimTask(task);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>{task.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>~{task.estimated_time_min} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{task.region || "FR"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <Award className="w-3 h-3" />
                            <span>+{task.reward_credits}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Timer className="w-3 h-3" />
                            <span>p.{task.pages_from}-{task.pages_to}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ton résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingMyTasks ? (
                  <MyTasksSkeleton />
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Crédits ce mois-ci</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{myTasksData?.tasks
                          .filter(t => t.status === "completed")
                          .reduce((acc, t) => acc + t.credits_earned, 0) ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Missions terminées</p>
                      <p className="text-xl font-semibold">
                        {myTasksData?.tasks.filter(t => t.status === "completed").length ?? 0}
                      </p>
                    </div>
                    {userLimits && (
                      <div>
                        <p className="text-sm text-muted-foreground">Limite du jour</p>
                        <p className="text-xl font-semibold">
                          {userLimits.used_today}/{userLimits.max_comm_jobs_per_day}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Personal History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique personnel</CardTitle>
              <CardDescription>Tes dernières contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMyTasks ? (
                <MyTasksSkeleton />
              ) : myTasksData?.tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune mission effectuée.
                </p>
              ) : (
                <div className="space-y-2">
                  {myTasksData?.tasks.slice(0, 5).map((task) => {
                    const StatusIcon = taskStatusIcon[task.status];
                    return (
                      <div
                        key={task.id}
                        className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/jobs/${task.job_id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${taskStatusColor[task.status]}`} />
                            <p className="font-semibold text-sm">{task.model_name}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
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

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Classement</CardTitle>
              <CardDescription>Les meilleurs contributeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={leaderboardPeriod} onValueChange={(v) => setLeaderboardPeriod(v as '30d' | 'all')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="30d">30 jours</TabsTrigger>
                  <TabsTrigger value="all">All-time</TabsTrigger>
                </TabsList>
                <TabsContent value={leaderboardPeriod}>
                  {loadingLeaderboard ? (
                    <LeaderboardSkeleton />
                  ) : leaderboardData?.entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune donnée disponible.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboardData?.entries.map((entry) => (
                        <div
                          key={entry.rank}
                          className="p-3 border rounded-lg hover:border-primary transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground">
                                #{entry.rank}
                              </span>
                              <div>
                                <p className="font-semibold text-sm">{entry.user_display}</p>
                                {entry.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {entry.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {entry.credits} crédits
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

        {/* Rules & FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Règles d'or & FAQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Règles d'or</h3>
              <ul className="space-y-2 text-sm">
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

            <div>
              <h3 className="font-semibold mb-3">Questions fréquentes</h3>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <Collapsible
                    key={faq.id}
                    open={expandedFaq === faq.id}
                    onOpenChange={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{faq.question}</span>
                        </div>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-3 text-sm text-muted-foreground">
                        {faq.answer}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4" onClick={() => navigate('/training')}>
            <div className="text-left">
              <p className="font-semibold">Formation</p>
              <p className="text-xs text-muted-foreground">Tutos & pas-à-pas</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4" onClick={() => navigate('/deals')}>
            <div className="text-left">
              <p className="font-semibold">Deals</p>
              <p className="text-xs text-muted-foreground">Meilleures offres</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4" onClick={() => navigate('/catalog')}>
            <div className="text-left">
              <p className="font-semibold">Catalogue</p>
              <p className="text-xs text-muted-foreground">Explorer les modèles</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
