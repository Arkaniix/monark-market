import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Shield, Rocket } from "lucide-react";

const benefits = [
  { icon: Target, text: "Estimation basée sur les données réelles" },
  { icon: TrendingUp, text: "Tendances et indicateurs de marché" },
  { icon: Shield, text: "Décision éclairée, risque maîtrisé" },
];

interface HeroSectionProps {
  onScrollToPricing: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function HeroSection({ onScrollToPricing }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20 md:py-28">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge variant="secondary" className="mb-6 gap-2">
            <Rocket className="h-3.5 w-3.5" />
            Accès anticipé — Lancement en cours
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Achetez au bon prix.
            <br />
            Revendez avec confiance.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            L'outil d'analyse pour les revendeurs de hardware et acheteurs malins. 
            Estimez la valeur réelle d'un produit grâce aux données du marché.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full"
              >
                <benefit.icon className="h-4 w-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="gap-2 min-w-[160px]">
                S'inscrire
              </Button>
            </Link>
            <Button size="lg" variant="outline" asChild>
              <a href="#pricing" onClick={onScrollToPricing}>
                Voir les tarifs
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            ✓ Sans engagement • ✓ Annulation à tout moment • ✓ Support 7j/7
          </p>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
}
