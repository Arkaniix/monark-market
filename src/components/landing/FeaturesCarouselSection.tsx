import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  BookOpen,
  Calculator,
  LayoutGrid,
  ShoppingBag,
} from "lucide-react";

import { ScanPreview } from "./previews/ScanPreview";
import { AlertesPreview } from "./previews/AlertesPreview";
import { CataloguePreview } from "./previews/CataloguePreview";
import { AnnoncesPreview } from "./previews/AnnoncesPreview";
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
    id: "scan",
    title: "Scanner intelligent",
    subtitle: "Récupérez les annonces automatiquement",
    description: "Lancez un scan sur les principales plateformes et récupérez les données des annonces en quelques clics. Prix, état, localisation — tout est centralisé.",
    icon: Search,
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
    id: "annonces",
    title: "Liste des annonces",
    subtitle: "Le marché en temps réel",
    description: "Accédez à toutes les annonces récupérées, filtrées et scorées. Identifiez les meilleures affaires grâce au score d'opportunité et aux indicateurs de prix.",
    icon: ShoppingBag,
    preview: <AnnoncesPreview />,
  },
  {
    id: "estimator",
    title: "Estimator",
    subtitle: "Votre copilote d'achat-revente",
    description: "Entrez les caractéristiques d'un produit, obtenez un score d'opportunité, une décision recommandée et des scénarios de revente — en quelques secondes.",
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
  const activeFeature = features[activeIndex];

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

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
            Découvrez les fonctionnalités clés de Monark pour analyser, suivre et optimiser vos achats-reventes.
          </p>
        </div>

        {/* Feature selector pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {features.map((feature, i) => (
            <button
              key={feature.id}
              onClick={() => setActiveIndex(i)}
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
            {/* Preview card */}
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

            {/* Description */}
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

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={goToPrev} className="rounded-full h-10 w-10">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex gap-1.5">
                    {features.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full h-10 w-10">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
