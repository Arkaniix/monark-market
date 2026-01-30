import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BarChart3, TrendingUp, MessageSquare } from "lucide-react";

const valueCards = [
  {
    icon: Target,
    title: "Décision d'achat",
    description: "Acheter, négocier ou passer ? Une recommandation claire basée sur l'analyse du marché actuel.",
    color: "primary",
  },
  {
    icon: BarChart3,
    title: "Vision marché",
    description: "Prix médian, tendance sur 30 et 90 jours, volume d'annonces. Comprenez la dynamique du produit.",
    color: "accent",
  },
  {
    icon: TrendingUp,
    title: "Stratégie de revente",
    description: "Scénarios optimiste, réaliste et prudent pour anticiper vos marges selon l'évolution du marché.",
    color: "success",
  },
  {
    icon: MessageSquare,
    title: "Négociation argumentée",
    description: "Arguments chiffrés pour négocier avec le vendeur : données de marché à l'appui.",
    color: "warning",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ValueCardsSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ce que vous obtenez
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des informations actionnables pour prendre de meilleures décisions d'achat et de revente, 
            selon la disponibilité des données.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {valueCards.map((card, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className={`h-12 w-12 rounded-lg bg-${card.color}/10 flex items-center justify-center mb-3`}>
                    <card.icon className={`h-6 w-6 text-${card.color}`} />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
