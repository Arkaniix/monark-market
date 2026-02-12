import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Bell,
  BookOpen,
  Calculator,
  LayoutGrid,
  Gauge,
} from "lucide-react";

import { ScanPreview } from "./previews/ScanPreview";
import { AlertesPreview } from "./previews/AlertesPreview";
import { CataloguePreview } from "./previews/CataloguePreview";
import { EstimatorPreview } from "./previews/EstimatorPreview";
import { FormationPreview } from "./previews/FormationPreview";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  preview: React.ReactNode;
}

const features: Feature[] = [
  {
    id: "lens",
    title: "Monark Lens",
    subtitle: "Analysez chaque annonce en un coup d'œil",
    description: "L'extension Chrome qui affiche un Market Score, un verdict et la valeur marché directement sur les annonces Leboncoin, eBay et Vinted. Sans quitter la page.",
    icon: Eye,
    preview: <ScanPreview />,
  },
  {
    id: "market-score",
    title: "Market Score",
    subtitle: "Un score 0-10 sur chaque annonce",
    description: "Évaluation instantanée de chaque annonce par rapport au marché. Gratuit sur le plan Free, enrichi avec verdict et données détaillées sur les plans payants.",
    icon: Gauge,
    preview: <ScanPreview />,
  },
  {
    id: "alertes",
    title: "Alertes personnalisées",
    subtitle: "Ne ratez plus aucune opportunité",
    description: "Configurez des alertes sur les prix, les nouveaux listings ou les localisations qui vous intéressent. Recevez une notification dès qu'une bonne affaire apparaît.",
    icon: Bell,
    preview: <AlertesPreview />,
  },
  {
    id: "catalogue",
    title: "Catalogue de modèles",
    subtitle: "Toutes les références, un seul endroit",
    description: "Parcourez notre base de données de modèles hardware avec prix médians, tendances de marché et indicateurs de liquidité pour chaque référence.",
    icon: LayoutGrid,
    preview: <CataloguePreview />,
  },
  {
    id: "estimator",
    title: "Estimator",
    subtitle: "Votre copilote d'achat-revente",
    description: "Analyse approfondie pré-remplie depuis l'extension Lens. Score d'opportunité, décision recommandée, scénarios de revente — en quelques secondes.",
    icon: Calculator,
    preview: <EstimatorPreview />,
  },
  {
    id: "formation",
    title: "Formation",
    subtitle: "Apprenez à maîtriser le marché",
    description: "Des parcours structurés pour les débutants comme les experts. Comprenez les mécaniques du marché et affinez vos stratégies d'achat-revente.",
    icon: BookOpen,
    preview: <FormationPreview />,
  },
];

export function FeaturesCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const activeFeature = features[activeIndex];

  const resetTimer = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  }, []);

  const handlePrev = useCallback(() => {
    goToPrev();
    resetTimer();
  }, [goToPrev, resetTimer]);

  const handleNext = useCallback(() => {
    goToNext();
    resetTimer();
  }, [goToNext, resetTimer]);

  const handleSelect = useCallback((i: number) => {
    setActiveIndex(i);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, resetKey]);

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Tout ce dont vous avez besoin, en un seul outil
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les fonctionnalités clés de Monark Lens pour analyser, suivre et optimiser vos achats-reventes.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {features.map((feature, i) => (
            <button
              key={feature.id}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <feature.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{feature.title}</span>
            </button>
          ))}
        </div>

        <div
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-muted/50 to-muted border-primary/20 overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      {activeFeature.preview}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id + "-desc"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="order-1 lg:order-2 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <activeFeature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold">{activeFeature.title}</h3>
                      <p className="text-sm text-muted-foreground">{activeFeature.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeFeature.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-1.5">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full h-10 w-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
