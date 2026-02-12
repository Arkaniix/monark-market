import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, HelpCircle, TrendingDown, Eye, Calculator, LineChart } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Temps perdu à chercher",
    description: "Parcourir des centaines d'annonces sans savoir si le prix est juste.",
  },
  {
    icon: HelpCircle,
    title: "Prix incertain",
    description: "Difficile d'estimer la vraie valeur sans données fiables.",
  },
  {
    icon: TrendingDown,
    title: "Revente hasardeuse",
    description: "Vendre sans connaître le bon moment ni le bon prix.",
  },
];

const solutions = [
  {
    icon: Eye,
    title: "Market Score instantané",
    description: "Un score 0-10 s'affiche sur chaque annonce grâce à l'extension Lens.",
  },
  {
    icon: Calculator,
    title: "Estimation data-driven",
    description: "Prix médian, tendance, liquidité — basés sur les vraies transactions.",
  },
  {
    icon: LineChart,
    title: "Scénarios de revente",
    description: "Anticipez vos marges selon différentes hypothèses de marché.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProblemSolutionSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-destructive/80">
              Le problème
            </h2>
            <p className="text-muted-foreground mb-8">
              Ce que vivent la plupart des acheteurs-revendeurs.
            </p>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {problems.map((problem, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <problem.icon className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground">{problem.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-primary">
              Notre solution
            </h2>
            <p className="text-muted-foreground mb-8">
              Ce que Monark Lens vous apporte concrètement.
            </p>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {solutions.map((solution, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <solution.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground">{solution.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
