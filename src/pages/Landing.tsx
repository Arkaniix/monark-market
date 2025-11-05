import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Target,
  BarChart3,
  Users,
  Zap,
  GraduationCap,
  TrendingUp,
  Check,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  "Scanner automatique d'annonces",
  "Analyses de tendances en temps réel",
  "Estimateur de prix intelligent",
  "Alertes personnalisées",
  "Accès à la communauté Discord",
];

const trainingModules = [
  "Comment identifier les bonnes affaires",
  "Stratégies d'achat-revente efficaces",
  "Optimisation des marges bénéficiaires",
  "Gestion des risques et pièges à éviter",
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20 md:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Devenez expert en achat-revente de hardware
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Scannez le marché, analysez les opportunités et maximisez vos profits grâce à notre plateforme et formation complète
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Stats teaser - chiffres génériques pour l'engagement */}
      <section className="py-12 border-b">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Utilisateurs actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2,500+</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Et en croissance
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Annonces scannées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">50K+</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chaque semaine
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Taux de satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">98%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    D'utilisateurs satisfaits
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Économies moyennes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">25%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Par transaction
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features - L'outil de scraping */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">L'outil le plus puissant du marché</h2>
            <p className="text-muted-foreground">
              Tout ce dont vous avez besoin pour réussir vos achats-reventes
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scanner intelligent</h3>
              <p className="text-muted-foreground">
                Scannez automatiquement des milliers d'annonces en quelques secondes
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyses avancées</h3>
              <p className="text-muted-foreground">
                Graphiques détaillés, tendances du marché et prédictions de prix
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Détection d'opportunités</h3>
              <p className="text-muted-foreground">
                Repérez instantanément les meilleures affaires avec notre système de scoring
              </p>
            </motion.div>
          </motion.div>

          <div className="mt-12 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités incluses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formation */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-6">
                <GraduationCap className="h-8 w-8 text-warning" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Formation complète incluse
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Ne vous contentez pas d'un outil, devenez un expert grâce à notre formation pas-à-pas
              </p>
              <ul className="space-y-3 mb-8">
                {trainingModules.map((module, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-warning" />
                    </div>
                    <span>{module}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button size="lg">
                  Accéder à la formation
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Résultats prouvés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-success">+87%</span>
                    <span className="text-muted-foreground">en moyenne</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Augmentation des profits après formation
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary">3 semaines</span>
                    <span className="text-muted-foreground">en moyenne</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pour rentabiliser votre investissement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Rejoignez 2,500+ membres actifs</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Partagez vos trouvailles, apprenez des meilleurs et progressez ensemble dans une communauté soudée
            </p>
            <Link to="/auth">
              <Button size="lg">
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}