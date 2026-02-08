import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  BookOpen,
  Calculator,
  LayoutGrid,
  ShoppingBag,
  Target,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Filter,
  Eye,
  MapPin,
  Clock,
  Star,
  Zap,
  GraduationCap,
  Video,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  preview: React.ReactNode;
}

function ScanPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium">Scan en cours…</span>
        </div>
        <Badge variant="outline" className="text-xs">leboncoin</Badge>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Pages scannées</span>
          <span className="text-sm font-semibold">24 / 30</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[80%] bg-gradient-to-r from-primary to-accent rounded-full transition-all" />
        </div>
      </div>
      <div className="space-y-2">
        {[
          { title: "RTX 4070 Super", price: "520 €", time: "il y a 2 min" },
          { title: "RTX 4060 Ti", price: "340 €", time: "il y a 5 min" },
          { title: "RX 7800 XT", price: "430 €", time: "il y a 8 min" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-2.5 border">
            <div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {item.time}
              </div>
            </div>
            <span className="font-semibold text-primary">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground">
        156 annonces récupérées • 3 nouvelles bonnes affaires
      </div>
    </div>
  );
}

function AlertesPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Alertes actives</span>
        <Badge className="bg-primary/10 text-primary border-0 text-xs">3 alertes</Badge>
      </div>
      <div className="space-y-2.5">
        {[
          { type: "Prix", model: "RTX 4070", condition: "< 450 €", icon: TrendingUp, active: true },
          { type: "Nouveau listing", model: "RX 7900 XTX", condition: "Toute annonce", icon: Eye, active: true },
          { type: "Localisation", model: "RTX 3080", condition: "Île-de-France", icon: MapPin, active: false },
        ].map((alert, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-lg p-3 border ${alert.active ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"}`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.active ? "bg-primary/10" : "bg-muted"}`}>
              <alert.icon className={`h-4 w-4 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{alert.model}</div>
              <div className="text-xs text-muted-foreground">{alert.type} • {alert.condition}</div>
            </div>
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${alert.active ? "bg-accent" : "bg-muted-foreground/30"}`} />
          </div>
        ))}
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">Nouvelle alerte !</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">RTX 4070 à 420 € — en dessous de votre seuil.</p>
      </div>
    </div>
  );
}

function CataloguePreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-background/50 border rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
          <Search className="h-3 w-3" /> Rechercher un modèle…
        </div>
        <div className="bg-background/50 border rounded-lg px-2.5 py-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { name: "RTX 4070 Super", brand: "NVIDIA", median: "510 €", trend: "-2%", trendDown: true },
          { name: "RX 7800 XT", brand: "AMD", median: "440 €", trend: "+1%", trendDown: false },
          { name: "RTX 4060 Ti", brand: "NVIDIA", median: "330 €", trend: "-4%", trendDown: true },
          { name: "Arc A770", brand: "Intel", median: "260 €", trend: "+3%", trendDown: false },
        ].map((card, i) => (
          <div key={i} className="bg-background/50 border rounded-lg p-2.5 space-y-1.5">
            <div className="h-12 bg-muted/50 rounded flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div className="text-xs font-medium truncate">{card.name}</div>
            <div className="text-[10px] text-muted-foreground">{card.brand}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{card.median}</span>
              <span className={`text-[10px] font-medium ${card.trendDown ? "text-destructive" : "text-accent"}`}>{card.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnoncesPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Annonces récentes</span>
        <div className="flex gap-1">
          {["Tous", "GPU", "CPU"].map((f) => (
            <Badge key={f} variant={f === "GPU" ? "default" : "outline"} className="text-[10px] cursor-pointer">{f}</Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {[
          { title: "RTX 4070 Ti Super NEUVE", price: "680 €", platform: "Leboncoin", score: 72, location: "Paris" },
          { title: "RX 7900 XTX — Comme neuve", price: "590 €", platform: "eBay", score: 85, location: "Lyon" },
          { title: "RTX 3080 10Go FE", price: "290 €", platform: "Leboncoin", score: 91, location: "Marseille" },
        ].map((ad, i) => (
          <div key={i} className="flex items-start gap-3 bg-background/50 border rounded-lg p-3">
            <div className="h-11 w-11 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-sm font-medium truncate">{ad.title}</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{ad.platform}</span>
                <span>•</span>
                <span>{ad.location}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-primary">{ad.price}</div>
              <div className="flex items-center gap-1 justify-end">
                <Star className="h-3 w-3 text-warning" />
                <span className="text-[10px] font-medium">{ad.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstimatorPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm font-medium">Estimation</span>
        </div>
        <Badge variant="outline" className="text-xs">RTX 4070</Badge>
      </div>
      <div className="bg-background/50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Score d'opportunité</span>
          <span className="text-2xl font-bold text-primary">78/100</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
        </div>
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="h-4 w-4 text-accent" />
          <span className="font-medium text-accent text-sm">Recommandation : Acheter</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Prix en dessous de la médiane, demande stable, bon potentiel de revente.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Médiane</div>
          <div className="font-semibold text-sm">485 €</div>
        </div>
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Tendance</div>
          <div className="font-semibold text-sm text-destructive">-3%</div>
        </div>
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-xs text-muted-foreground">Liquidité</div>
          <div className="font-semibold text-sm text-accent">Élevée</div>
        </div>
      </div>
    </div>
  );
}

function FormationPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Parcours de formation</span>
        <Badge className="bg-accent/10 text-accent border-0 text-xs">2 niveaux</Badge>
      </div>
      <div className="space-y-2.5">
        <div className="bg-background/50 border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Introduction</div>
              <div className="text-[10px] text-muted-foreground">5 modules • 2h de contenu</div>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-primary rounded-full" />
          </div>
          <div className="text-[10px] text-muted-foreground">60% complété</div>
        </div>
        <div className="bg-background/50 border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Video className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">Avancé</div>
              <div className="text-[10px] text-muted-foreground">8 modules • 4h de contenu</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px]">Stratégies</Badge>
            <Badge variant="secondary" className="text-[10px]">Négociation</Badge>
            <Badge variant="secondary" className="text-[10px]">Analyse</Badge>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        Vidéos, quiz et exercices pratiques inclus
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    id: "scan",
    title: "Scanner intelligent",
    subtitle: "Récupérez les annonces automatiquement",
    description: "Lancez un scan sur les principales plateformes et récupérez les données des annonces en quelques clics. Prix, état, localisation — tout est centralisé.",
    icon: Search,
    color: "primary",
    preview: <ScanPreview />,
  },
  {
    id: "alertes",
    title: "Alertes personnalisées",
    subtitle: "Ne ratez plus aucune opportunité",
    description: "Configurez des alertes sur les prix, les nouveaux listings ou les localisations qui vous intéressent. Recevez une notification dès qu'une bonne affaire apparaît.",
    icon: Bell,
    color: "warning",
    preview: <AlertesPreview />,
  },
  {
    id: "catalogue",
    title: "Catalogue de modèles",
    subtitle: "Toutes les références, un seul endroit",
    description: "Parcourez notre base de données de modèles hardware avec prix médians, tendances de marché et indicateurs de liquidité pour chaque référence.",
    icon: LayoutGrid,
    color: "accent",
    preview: <CataloguePreview />,
  },
  {
    id: "annonces",
    title: "Liste des annonces",
    subtitle: "Le marché en temps réel",
    description: "Accédez à toutes les annonces récupérées, filtrées et scorées. Identifiez les meilleures affaires grâce au score d'opportunité et aux indicateurs de prix.",
    icon: ShoppingBag,
    color: "primary",
    preview: <AnnoncesPreview />,
  },
  {
    id: "estimator",
    title: "Estimator",
    subtitle: "Votre copilote d'achat-revente",
    description: "Entrez les caractéristiques d'un produit, obtenez un score d'opportunité, une décision recommandée et des scénarios de revente — en quelques secondes.",
    icon: Calculator,
    color: "accent",
    preview: <EstimatorPreview />,
  },
  {
    id: "formation",
    title: "Formation",
    subtitle: "Apprenez à maîtriser le marché",
    description: "Des parcours structurés pour les débutants comme les experts. Comprenez les mécaniques du marché et affinez vos stratégies d'achat-revente.",
    icon: BookOpen,
    color: "warning",
    preview: <FormationPreview />,
  },
];

export function FeaturesCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

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

        {/* Carousel content */}
        <div className="max-w-5xl mx-auto">
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
