import { useState } from "react";
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
  ExternalLink,
  Download,
  Shield,
  HelpCircle,
  Star,
  Flame,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  communityNeeds,
  userEligibility,
  mockHistory,
  leaderboard30d,
  leaderboardAllTime,
  generateAssignedShard,
  type AssignedShard,
} from "@/lib/communityMockData";

export default function Community() {
  const [isLoading, setIsLoading] = useState(false);
  const [assignedShard, setAssignedShard] = useState<AssignedShard | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [missionInProgress, setMissionInProgress] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const needs = communityNeeds;
  const eligibility = userEligibility;
  const history = mockHistory;

  // Calcul de l'état du bouton
  const getButtonState = () => {
    if (!needs.active) {
      return {
        disabled: true,
        label: "⏳ Reviens plus tard – pas de besoin urgent",
        reason: "Aucune mission prioritaire disponible actuellement.",
      };
    }
    if (eligibility.user_limits.used_today >= eligibility.user_limits.max_comm_jobs_per_day) {
      return {
        disabled: true,
        label: "❗ Limite quotidienne atteinte",
        reason: `Tu as effectué ${eligibility.user_limits.used_today}/${eligibility.user_limits.max_comm_jobs_per_day} missions aujourd'hui.`,
      };
    }
    if (eligibility.user_limits.cooldown_remaining > 0) {
      return {
        disabled: true,
        label: `🕒 Cooldown en cours (${eligibility.user_limits.cooldown_remaining} min restantes)`,
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

  const handleLaunchScrap = async () => {
    setIsLoading(true);
    try {
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const shard = generateAssignedShard();
      setAssignedShard(shard);
      setShowInstructions(true);
      toast.success("Mission assignée !");
    } catch (error) {
      toast.error("Erreur lors de l'assignation de la mission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    setMissionInProgress(true);
    
    // Ouvre l'URL dans un nouvel onglet (mock)
    window.open("https://www.leboncoin.fr/recherche?category=15&text=" + assignedShard?.model, "_blank");
    
    toast.info("Mission démarrée ! L'extension va détecter le shard.");
    
    // Simulation de fin de mission après 30s
    setTimeout(() => {
      setMissionInProgress(false);
      setAssignedShard(null);
      toast.success("Mission terminée ! +1 crédit gagné.");
    }, 30000);
  };

  const statsCards = [
    {
      title: "Missions en attente",
      value: needs.summary.pending_missions,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Pages à couvrir",
      value: needs.summary.estimated_pages,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Couverture 7j",
      value: `${(needs.summary.coverage_7d_pct * 100).toFixed(0)}%`,
      icon: CheckCircle2,
      color: "text-purple-600",
    },
    {
      title: "Crédits distribués (30j)",
      value: needs.summary.credits_distributed_30d,
      icon: Award,
      color: "text-orange-600",
    },
  ];

  const priorityColor = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  } as const;

  const historyStatusIcon = {
    done: CheckCircle2,
    expired: Timer,
    failed: XCircle,
  };

  const historyStatusColor = {
    done: "text-green-600",
    expired: "text-orange-600",
    failed: "text-red-600",
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
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">🤝 Communauté</h1>
              <p className="text-muted-foreground text-lg">
                Aide à mettre le marché à jour
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Contribue au rafraîchissement des données et gagne des crédits.
          </p>
        </motion.div>

        {/* KPI Cards */}
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

        {/* Barre de progression collective */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Objectif hebdo : couvrir 100% des pages des modèles chauds</p>
              <span className="text-sm text-muted-foreground">{(needs.summary.coverage_7d_pct * 100).toFixed(0)}%</span>
            </div>
            <Progress value={needs.summary.coverage_7d_pct * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Alerte info */}
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

        {/* Bloc Scrap Communautaire */}
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
            {missionInProgress && assignedShard ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600 animate-pulse" />
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Mission en cours…
                    </p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ne ferme pas l'onglet jusqu'à la fin. L'extension fait le travail !
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Modèle</p>
                    <p className="font-semibold">{assignedShard.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pages</p>
                    <p className="font-semibold">{assignedShard.pages_from}–{assignedShard.pages_to}</p>
                  </div>
                </div>
              </div>
            ) : assignedShard ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Modèle ciblé</p>
                    <p className="font-semibold">{assignedShard.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <Badge variant="outline">{assignedShard.type}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pages</p>
                    <p className="font-semibold">{assignedShard.pages_from}–{assignedShard.pages_to}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Région</p>
                    <p className="font-semibold">{assignedShard.region || "France entière"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durée estimée</p>
                    <p className="font-semibold">≈ {assignedShard.estimated_time_min} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Crédits</p>
                    <p className="font-semibold text-green-600">+{assignedShard.credit_reward}</p>
                  </div>
                </div>
                <Button onClick={() => setShowInstructions(true)} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Voir les instructions
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  buttonState.disabled 
                    ? "bg-muted border-border" 
                    : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                }`}>
                  <p className="text-sm font-medium mb-1">{buttonState.reason}</p>
                  {!buttonState.disabled && needs.priority_models.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Modèle prioritaire : {needs.priority_models[0].model}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleLaunchScrap}
                  disabled={buttonState.disabled || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Assignation...
                    </>
                  ) : (
                    buttonState.label
                  )}
                </Button>
                {eligibility.eligible && (
                  <p className="text-xs text-muted-foreground text-center">
                    Missions aujourd'hui : {eligibility.user_limits.used_today}/{eligibility.user_limits.max_comm_jobs_per_day}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Missions disponibles */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Missions disponibles</CardTitle>
                <CardDescription>
                  Vue d'ensemble des besoins de la communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {needs.priority_models.map((mission, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{mission.model}</p>
                            <Badge variant={priorityColor[mission.priority]} className="text-xs">
                              {mission.priority === "high" ? "Haute" : mission.priority === "medium" ? "Moyenne" : "Basse"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{mission.context}</p>
                        </div>
                        <Star className={`w-5 h-5 flex-shrink-0 ${
                          mission.priority === "high" ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{mission.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>~{mission.estimated_time_min} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{mission.region || "FR"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <Award className="w-3 h-3" />
                          <span>+{mission.credit_reward}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé personnel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ton résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Crédits ce mois-ci</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{history.filter(h => h.status === "done").reduce((acc, h) => acc + h.credits_earned, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missions terminées</p>
                  <p className="text-xl font-semibold">
                    {history.filter(h => h.status === "done").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen</p>
                  <p className="text-xl font-semibold">
                    {Math.round(
                      history
                        .filter(h => h.status === "done")
                        .reduce((acc, h) => acc + h.duration_seconds, 0) /
                        history.filter(h => h.status === "done").length /
                        60
                    )} min
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historique & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Historique personnel */}
          <Card>
            <CardHeader>
              <CardTitle>Historique personnel</CardTitle>
              <CardDescription>Tes dernières contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => {
                  const StatusIcon = historyStatusIcon[item.status];
                  return (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${historyStatusColor[item.status]}`} />
                          <p className="font-semibold text-sm">{item.model}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <span>{item.pages_scanned} pages</span>
                        <span>{item.ads_new} nouvelles</span>
                        <span className="text-green-600">+{item.credits_earned}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Classement</CardTitle>
              <CardDescription>Les meilleurs contributeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="30d">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="30d">30 jours</TabsTrigger>
                  <TabsTrigger value="all">All-time</TabsTrigger>
                </TabsList>
                <TabsContent value="30d" className="space-y-2">
                  {leaderboard30d.map((entry) => (
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
                            <p className="font-semibold text-sm">{entry.user}</p>
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
                </TabsContent>
                <TabsContent value="all" className="space-y-2">
                  {leaderboardAllTime.map((entry) => (
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
                            <p className="font-semibold text-sm">{entry.user}</p>
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Règles & FAQ */}
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

        {/* CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4" asChild>
            <a href="/training">
              <div className="text-left">
                <p className="font-semibold">Formation</p>
                <p className="text-xs text-muted-foreground">Tutos & pas-à-pas</p>
              </div>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4" asChild>
            <a href="/deals">
              <div className="text-left">
                <p className="font-semibold">Deals</p>
                <p className="text-xs text-muted-foreground">Meilleures offres</p>
              </div>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4" asChild>
            <a href="/catalog">
              <div className="text-left">
                <p className="font-semibold">Catalogue</p>
                <p className="text-xs text-muted-foreground">Explorer les modèles</p>
              </div>
            </a>
          </Button>
        </div>
      </div>

      {/* Modal Instructions */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment lancer la mission</DialogTitle>
            <DialogDescription>
              Suis ces étapes pour démarrer le scrap communautaire
            </DialogDescription>
          </DialogHeader>
          {assignedShard && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="font-semibold mb-2">Mission assignée : {assignedShard.model}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> {assignedShard.type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pages:</span> {assignedShard.pages_from}–{assignedShard.pages_to}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durée:</span> ~{assignedShard.estimated_time_min} min
                  </div>
                  <div>
                    <span className="text-muted-foreground">Récompense:</span>{" "}
                    <span className="text-green-600 font-semibold">+{assignedShard.credit_reward} crédit</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Ouvre le site de recherche</p>
                    <p className="text-sm text-muted-foreground">
                      Le site va ouvrir automatiquement l'URL du moteur (LeBonCoin filtré par modèle) dans un nouvel onglet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold mb-1">L'extension détecte le shard</p>
                    <p className="text-sm text-muted-foreground">
                      L'extension va automatiquement détecter ta mission et commencer le scan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Laisse tourner</p>
                    <p className="text-sm text-muted-foreground">
                      Reste présent pour résoudre les éventuels captchas. Ne ferme pas l'onglet jusqu'à la fin !
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStartMission} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer maintenant
                </Button>
                <Button variant="outline" onClick={() => setShowInstructions(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
