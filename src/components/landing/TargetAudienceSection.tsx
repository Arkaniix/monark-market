import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const forYou = [
  "Revendeurs de hardware (GPU, CPU, composants)",
  "Acheteurs qui veulent payer le juste prix",
  "Personnes qui font de l'achat-revente occasionnel",
  "Passionnés qui veulent comprendre le marché",
];

const notForYou = [
  "Ceux qui cherchent des bots de snipe automatique",
  "Revendeurs de produits hors hardware informatique",
  "Personnes qui attendent des garanties de profit",
];

export function TargetAudienceSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Est-ce fait pour vous ?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Monark est un outil d'aide à la décision, pas une solution miracle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-success/30 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Check className="h-5 w-5" />
                  Pour vous si...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {forYou.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <X className="h-5 w-5" />
                  Pas pour vous si...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notForYou.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
