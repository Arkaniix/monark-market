import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Download,
    title: "Installez l'extension",
    description: "Ajoutez Monark Lens à Chrome en un clic. Gratuit, sans compte requis pour commencer.",
  },
  {
    number: "2",
    icon: Eye,
    title: "Naviguez normalement",
    description: "Parcourez Leboncoin, eBay ou Vinted. L'overlay Lens apparaît automatiquement sur chaque annonce.",
  },
  {
    number: "3",
    icon: CheckCircle,
    title: "Décidez en confiance",
    description: "Market Score, verdict, prix du marché : tout ce qu'il faut pour acheter au bon prix.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Simple et rapide
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Comment ça fonctionne
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trois étapes pour passer de l'annonce à la décision.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                {step.number}
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
