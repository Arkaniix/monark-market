import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3, ArrowRight } from "lucide-react";

const callouts = [
  {
    icon: Target,
    title: "Score d'opportunité",
    description: "Note de 0 à 100 pour évaluer rapidement l'intérêt d'une annonce.",
  },
  {
    icon: BarChart3,
    title: "Graphiques interactifs",
    description: "Évolution des prix sur 30 et 90 jours pour comprendre la tendance.",
  },
  {
    icon: TrendingUp,
    title: "Indicateurs clés",
    description: "Médiane, écart au marché, liquidité, volatilité — en un coup d'œil.",
  },
];

export function ProductDemoSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Aperçu de l'outil
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            L'Estimator : votre copilote d'achat-revente
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entrez les caractéristiques d'un produit, obtenez une analyse complète en quelques secondes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Demo visual - stylized interface representation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <Card className="bg-gradient-to-br from-muted/50 to-muted border-primary/20 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                {/* Simulated interface */}
                <div className="space-y-4">
                  {/* Header simulation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">Estimation</span>
                    </div>
                    <Badge variant="outline" className="text-xs">RTX 4070</Badge>
                  </div>

                  {/* Score simulation */}
                  <div className="bg-background/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Score d'opportunité</span>
                      <span className="text-2xl font-bold text-primary">78/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
                    </div>
                  </div>

                  {/* Decision simulation */}
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowRight className="h-4 w-4 text-success" />
                      <span className="font-medium text-success">Recommandation : Acheter</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prix en dessous de la médiane, demande stable, bon potentiel de revente.
                    </p>
                  </div>

                  {/* Metrics simulation */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-xs text-muted-foreground">Médiane</div>
                      <div className="font-semibold">485 €</div>
                    </div>
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-xs text-muted-foreground">Tendance 30j</div>
                      <div className="font-semibold text-destructive">-3%</div>
                    </div>
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-xs text-muted-foreground">Liquidité</div>
                      <div className="font-semibold text-success">Élevée</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Callouts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-4"
          >
            {callouts.map((callout, i) => (
              <Card key={i} className="hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <callout.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{callout.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {callout.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
