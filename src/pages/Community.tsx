import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Activity, Award, Clock, AlertCircle, 
  Shield, HelpCircle, ChevronDown, ChevronUp, 
  RefreshCw, Loader2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  useCommunityMyStats,
  useCommunityRecentActivity,
  INTENT_ICONS,
  INTENT_LABELS,
  TRUST_LEVELS,
  getPlatformLabel,
  getRelativeTime,
} from "@/hooks/useCommunityStats";

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const { data: myStats, isLoading: loadingStats, error: errorStats, refetch: refetchStats } = useCommunityMyStats();
  const { data: activityData, isLoading: loadingActivity, error: errorActivity, refetch: refetchActivity } = useCommunityRecentActivity();

  const trustLevel = myStats ? TRUST_LEVELS[myStats.trust_level] || TRUST_LEVELS.new : null;

  const faqs = [
    { id: "1", question: "Comment fonctionne le Trust Score ?", answer: "Votre score de confiance est calculé à partir de la qualité et de la cohérence de vos signalements. Plus vos signalements sont alignés avec le consensus communautaire, plus votre score monte." },
    { id: "2", question: "Combien de crédits je gagne ?", answer: "Collecte passive : 1 cr/annonce (Free et Standard), 2 cr/annonce (Pro). Les missions rapportent 3 à 40 crédits selon la rareté du composant." },
    { id: "3", question: "Comment signaler une annonce ?", answer: "Avec l'extension Monark Lens installée, un bouton de signalement apparaît directement sur les annonces que vous consultez." },
    { id: "4", question: "Qu'est-ce qu'un signalement aligné ?", answer: "Un signalement est aligné quand il correspond au consensus de la communauté. Par exemple, si vous signalez un composant comme HS et que d'autres utilisateurs font la même chose." },
  ];

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container max-w-5xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-primary flex-shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">🤝 Communauté</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Vos contributions et l'activité récente de la communauté
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { refetchStats(); refetchActivity(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            SECTION 1: MES CONTRIBUTIONS
            ══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Mes contributions
              </CardTitle>
              <CardDescription>Votre activité de signalement et votre score de confiance</CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">Connectez-vous pour voir vos contributions</p>
                  <Button onClick={() => navigate("/auth")}>Se connecter</Button>
                </div>
              ) : loadingStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                </div>
              ) : errorStats ? (
                <div className="text-center py-8 space-y-3">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                  <p className="text-muted-foreground">Impossible de charger vos statistiques</p>
                  <Button variant="outline" size="sm" onClick={() => refetchStats()}>Réessayer</Button>
                </div>
              ) : myStats && myStats.total_flags === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">Aucune contribution pour le moment.</p>
                  <p className="text-sm text-muted-foreground">Installez l'extension Monark Lens pour commencer à signaler les annonces.</p>
                </div>
              ) : myStats && trustLevel ? (
                <div className="space-y-5">
                  {/* Trust Level Badge */}
                  <div className={`flex items-center gap-3 p-4 rounded-lg border ${trustLevel.bgColor}`}>
                    <span className="text-3xl">{trustLevel.icon}</span>
                    <div>
                      <p className={`text-lg font-bold ${trustLevel.color}`}>{trustLevel.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Score de confiance : {Math.round(myStats.trust_score * 100)}%
                      </p>
                    </div>
                    <div className="flex-1 ml-4">
                      <Progress 
                        value={myStats.trust_score * 100} 
                        className={`h-2 ${trustLevel.progressColor}`}
                      />
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground">Total signalements</p>
                      <p className="text-xl font-bold">{myStats.total_flags}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground">Cette semaine</p>
                      <p className="text-xl font-bold">{myStats.flags_this_week}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground">Alignés</p>
                      <p className="text-xl font-bold text-green-500">{myStats.flags_confirmed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground">Score de confiance</p>
                      <p className="text-xl font-bold">{Math.round(myStats.trust_score * 100)}%</p>
                    </div>
                  </div>

                  {/* Flags by type */}
                  {Object.keys(myStats.flags_by_type).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Répartition par type</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(myStats.flags_by_type)
                          .sort(([,a], [,b]) => b - a)
                          .map(([type, count]) => (
                            <Badge key={type} variant="outline" className="gap-1.5">
                              <span>{INTENT_ICONS[type] || "❓"}</span>
                              <span>{INTENT_LABELS[type] || type}</span>
                              <span className="font-bold">{count}</span>
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            SECTION 2: ACTIVITÉ RÉCENTE
            ══════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Activité récente
              </CardTitle>
              <CardDescription>Derniers signalements de la communauté</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : errorActivity ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-muted-foreground">Activité indisponible</p>
                  <Button variant="outline" size="sm" onClick={() => refetchActivity()}>Réessayer</Button>
                </div>
              ) : !activityData || activityData.activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Pas encore d'activité communautaire cette semaine.
                </p>
              ) : (
                <div className="space-y-2">
                  {activityData.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
                      <span className="text-xl flex-shrink-0">
                        {INTENT_ICONS[activity.intent_type] || "❓"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.component_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {INTENT_LABELS[activity.intent_type] || activity.intent_type}
                          {" — "}
                          {getPlatformLabel(activity.platform)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {getRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            FAQ
            ══════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="w-4 h-4" />
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faqs.map(faq => (
                <Collapsible 
                  key={faq.id} 
                  open={expandedFaq === faq.id} 
                  onOpenChange={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                      <span className="text-sm font-medium text-left">{faq.question}</span>
                      {expandedFaq === faq.id ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 text-sm text-muted-foreground">{faq.answer}</div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
