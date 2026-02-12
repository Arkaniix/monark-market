import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Video, Award, Check } from "lucide-react";

const trainingFeatures = [
  {
    icon: BookOpen,
    title: "Introduction plateforme",
    description: "Apprenez à naviguer et utiliser tous les outils Monark efficacement.",
    included: "Tous les plans",
    highlight: true,
  },
  {
    icon: Video,
    title: "Modules avancés",
    description: "Stratégies de revente, négociation, analyse approfondie du marché.",
    included: "Standard & Pro",
    highlight: false,
  },
  {
    icon: Award,
    title: "Méthodologie complète",
    description: "Observer → Analyser → Agir : une approche structurée pour maximiser vos gains.",
    included: "Standard & Pro",
    highlight: false,
  },
];

const modulesList = [
  "Premiers pas sur Monark",
  "Comprendre le marché",
  "Chercher intelligemment",
  "Analyser la rentabilité",
  "Acheter et négocier",
  "Vendre efficacement",
  "Rentabilité durable",
];

export function TrainingSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 gap-2">
            <GraduationCap className="h-3.5 w-3.5" />
            Formation incluse
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Apprenez à maîtriser le marché
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monark est une plateforme puissante. Notre formation vous guide pas à pas pour en tirer le maximum, 
            que vous soyez débutant ou expert.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Training cards */}
          <div className="space-y-4">
            {trainingFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={feature.highlight ? "border-primary/50 bg-primary/5" : ""}>
                  <CardContent className="p-5 flex gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      feature.highlight ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <feature.icon className={`h-6 w-6 ${feature.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{feature.title}</h3>
                        <Badge variant={feature.highlight ? "default" : "secondary"} className="text-[10px]">
                          {feature.included}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Modules list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  7 modules de formation
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Une progression structurée de 45-60 minutes pour maîtriser tous les aspects de la revente hardware.
                </p>
                <ul className="space-y-2.5">
                  {modulesList.map((module, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">{i}</span>
                      </div>
                      <span>{module}</span>
                      {i === 0 && (
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          Gratuit
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Module 0 accessible à tous les abonnés
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
