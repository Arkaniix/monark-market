// Estimator V3 — Complete refactored page
import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator, History, RefreshCw, RotateCcw, AlertCircle, ScanSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useEnhancedEstimationHistory } from "@/hooks/useEnhancedEstimator";

// V3 components
import EstimatorForm from "@/components/estimator/v3/EstimatorForm";
import SynthesisSection from "@/components/estimator/v3/SynthesisSection";
import MarketAnalysisSection from "@/components/estimator/v3/MarketAnalysisSection";
import ResaleSection from "@/components/estimator/v3/ResaleSection";
import WhatIfSection from "@/components/estimator/v3/WhatIfSection";
import SectionTeaser from "@/components/estimator/v3/SectionTeaser";

// V3 hook & types
import { useEstimatorV3, EstimatorError } from "@/hooks/useEstimatorV3";
import type { V3EstimationRequest, V3EstimationResponse } from "@/types/estimatorV3";

export default function Estimator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plan } = useEntitlements();

  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");
  const [historyPage, setHistoryPage] = useState(1);

  // V3 hook
  const estimator = useEstimatorV3();

  // History (existing, untouched)
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refreshHistory,
  } = useEnhancedEstimationHistory(historyPage, activeTab === "history");

  const historyState = isLoadingHistory ? "loading"
    : isHistoryError ? "error"
    : historyData?.items?.length === 0 ? "empty"
    : "success";

  // Submit handler
  const handleSubmit = async (request: V3EstimationRequest) => {
    try {
      await estimator.evaluate(request);
      toast({ title: "Estimation réussie" });
    } catch (err) {
      if (err instanceof EstimatorError) {
        if (err.type === "insufficient_credits") {
          toast({
            title: "Crédits insuffisants",
            description: `${err.message}`,
            variant: "destructive",
          });
        } else if (err.type === "validation_error") {
          toast({
            title: "Erreur de validation",
            description: err.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Une erreur est survenue, veuillez réessayer",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
      }
    }
  };

  const result = estimator.result;
  const planLevel = result?.plan_level;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">💰 Estimator</h1>
              <p className="text-muted-foreground text-sm">Est-ce que j'achète ce composant pour le revendre ?</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "estimator" | "history")}>
          <TabsList className="mb-6">
            <TabsTrigger value="estimator" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Estimation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" />
              Historique
            </TabsTrigger>
          </TabsList>

          {/* ============ ESTIMATION TAB ============ */}
          <TabsContent value="estimator" className="space-y-6">
            {/* Form */}
            <EstimatorForm
              onSubmit={handleSubmit}
              isPending={estimator.isPending}
              onReset={estimator.reset}
            />

            {/* Loading skeleton */}
            {estimator.isPending && (
              <div className="space-y-4">
                <Card><CardContent className="py-8"><div className="space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-32 w-full" /><Skeleton className="h-4 w-3/4" /></div></CardContent></Card>
              </div>
            )}

            {/* Empty state */}
            {!result && !estimator.isPending && (
              <div className="flex flex-col items-center py-16 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Renseignez un composant et un prix pour obtenir votre estimation.
                </p>
              </div>
            )}

            {/* ============ RESULTS ============ */}
            <AnimatePresence mode="wait">
              {result && !estimator.isPending && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Section 1 — Synthèse (all plans) */}
                  <SynthesisSection result={result} />

                  {/* Section 2 — Market Analysis + Negotiation (complete+) */}
                  {(planLevel === "complete" || planLevel === "pro") ? (
                    <MarketAnalysisSection result={result} />
                  ) : (
                    <SectionTeaser
                      title="🔒 Analyse marché & Négociation"
                      description="Débloquez la distribution P10-P90, les tendances, et des conseils de négociation chiffrés."
                      features={[
                        result.upgrade_hint?.preview.has_distribution ? "Distribution de prix P10 à P90" : "",
                        result.upgrade_hint?.preview.has_trend_data ? "Tendances 7j et 30j" : "",
                        result.upgrade_hint?.preview.has_negotiation ? "Conseils de négociation" : "",
                      ].filter(Boolean)}
                      savingsHint={result.upgrade_hint?.preview.negotiation_savings_hint}
                      upgradeHint={result.upgrade_hint}
                    />
                  )}

                  {/* Section 3 — Resale & Scenarios (pro) */}
                  {planLevel === "pro" ? (
                    (result.resale || result.scenarios) && <ResaleSection result={result} />
                  ) : planLevel === "complete" ? (
                    <SectionTeaser
                      title="🔒 Revente & Scénarios"
                      description="Découvrez où revendre et les meilleurs scénarios (rapide, optimal, patient)."
                      features={[
                        "Plateformes de revente recommandées",
                        "3 scénarios de revente avec probabilités",
                        "Timing et saturation du marché",
                      ]}
                      upgradeHint={result.upgrade_hint}
                    />
                  ) : null}

                  {/* Section 4 — What-If Simulator (pro) */}
                  {planLevel === "pro" ? (
                    result.what_if && <WhatIfSection whatIf={result.what_if} inputPrice={result.input?.price ?? 0} />
                  ) : planLevel === "complete" ? (
                    <SectionTeaser
                      title="🔒 Simulateur « Et si... »"
                      description="Simulez l'impact de variations de prix sur votre score et marge."
                      features={[
                        "Tableau interactif de simulation",
                        "Repères d'achat et de revente",
                      ]}
                      upgradeHint={result.upgrade_hint}
                    />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ============ HISTORY TAB (kept as-is) ============ */}
          <TabsContent value="history">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-primary" />
                    Historique des estimations
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refreshHistory()} disabled={isLoadingHistory}>
                      <RefreshCw className={cn("h-4 w-4", isLoadingHistory && "animate-spin")} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" asChild>
                      <Link to="/lens-history?tab=estimations">
                        <ScanSearch className="h-3.5 w-3.5" />
                        Voir dans Mes Analyses
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                  💡 Vos estimations complètes sont aussi disponibles dans{" "}
                  <Link to="/lens-history?tab=estimations" className="text-primary hover:underline font-medium">
                    Mes Analyses
                  </Link>.
                </p>

                {historyState === "loading" && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {historyState === "error" && (
                  <div className="flex flex-col items-center py-10">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                    <Button variant="outline" size="sm" onClick={() => refreshHistory()}>Réessayer</Button>
                  </div>
                )}

                {historyState === "empty" && (
                  <div className="flex flex-col items-center py-10">
                    <Calculator className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">Aucune estimation</p>
                    <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
                      Lancez votre première estimation via le formulaire.
                    </p>
                    <Button size="sm" onClick={() => setActiveTab("estimator")}>Nouvelle estimation</Button>
                  </div>
                )}

                {historyState === "success" && historyData?.items?.map((item) => {
                  const planColors: Record<string, string> = {
                    free: "bg-muted/50 text-muted-foreground border-border",
                    standard: "bg-primary/10 text-primary border-primary/20",
                    pro: "bg-green-500/15 text-green-400 border-green-500/30",
                  };
                  return (
                    <Card key={item.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <p className="text-sm font-semibold truncate">{item.model_name}</p>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", planColors[item.plan_at_creation] || "")}>
                                {item.plan_at_creation}
                              </Badge>
                              {item.platform && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.platform}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.category} · {item.condition || "État inconnu"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-primary tabular-nums">{item.ad_price}€</p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7 text-xs"
                            onClick={() => {
                              navigate(`/estimator?model_id=${item.model_id}&model_name=${encodeURIComponent(item.model_name)}&price=${item.ad_price}&platform=${item.platform || ""}&condition=${item.condition || ""}&source=history`);
                              setActiveTab("estimator");
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Ré-estimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
