import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Target, BarChart3, Users, Zap, GraduationCap, TrendingUp, Check, Clock, Shield, Rocket, DollarSign, Bell, Award, Construction } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PricingSection } from "@/components/pricing/PricingTable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};
const features = [{
  name: "Scanner automatique d'annonces",
  tooltip: "Parcourez des milliers d'annonces en quelques secondes sans effort manuel"
}, {
  name: "Analyses de tendances en temps réel",
  tooltip: "Suivez l'évolution des prix et du marché pour anticiper les opportunités"
}, {
  name: "Estimateur de prix intelligent",
  tooltip: "Obtenez une estimation précise de la valeur d'un produit basée sur les données du marché"
}, {
  name: "Alertes personnalisées",
  tooltip: "Recevez une notification dès qu'une annonce correspond à vos critères"
}, {
  name: "Accès à la communauté Discord",
  tooltip: "Échangez avec d'autres revendeurs, partagez vos tips et restez informé"
}];
const trainingModules = [{
  name: "Comment identifier les bonnes affaires",
  tooltip: "Apprenez à repérer les annonces sous-évaluées"
}, {
  name: "Stratégies d'achat-revente efficaces",
  tooltip: "Techniques éprouvées pour maximiser vos profits"
}, {
  name: "Optimisation des marges bénéficiaires",
  tooltip: "Calculez et améliorez vos marges sur chaque deal"
}, {
  name: "Gestion des risques et pièges à éviter",
  tooltip: "Évitez les erreurs courantes des débutants"
}];
const benefits = [{
  icon: DollarSign,
  title: "Maximisez vos profits",
  description: "Identifiez les opportunités sous-évaluées et vendez au meilleur moment grâce à nos analyses de marché en temps réel.",
  tooltip: "Nos utilisateurs économisent en moyenne 25% sur leurs achats"
}, {
  icon: Clock,
  title: "Gagnez du temps",
  description: "Notre scanner automatique fait le travail à votre place. Plus besoin de parcourir des centaines d'annonces manuellement.",
  tooltip: "Économisez plusieurs heures par jour de recherche manuelle"
}, {
  icon: GraduationCap,
  title: "Apprenez à acheter et revendre intelligemment",
  description: "La plateforme inclut une formation progressive pour maîtriser les fondamentaux et devenir autonome rapidement.",
  tooltip: "Formation pas-à-pas accessible à tous les niveaux",
  cta: {
    label: "Découvrir la formation",
    href: "/training"
  }
}, {
  icon: Award,
  title: "Devenez expert",
  description: "Apprenez les techniques des professionnels avec notre formation complète et notre communauté active.",
  tooltip: "Rejoignez une communauté de revendeurs expérimentés"
}];
const howItWorks = [{
  step: "1",
  title: "Suivez la formation",
  description: "Accédez à notre formation complète pour maîtriser les fondamentaux de l'achat-revente et comprendre comment utiliser l'outil efficacement."
}, {
  step: "2",
  title: "Scannez le marché",
  description: "Lancez un scan automatique sur les plateformes comme LeBonCoin. L'outil trouve toutes les annonces pertinentes en quelques secondes."
}, {
  step: "3",
  title: "Analysez les opportunités",
  description: "Notre IA évalue chaque annonce et vous présente les meilleures affaires avec un score de rentabilité."
}, {
  step: "4",
  title: "Achetez au bon prix",
  description: "Contactez le vendeur avec confiance grâce à notre estimateur de prix et nos données de marché."
}, {
  step: "5",
  title: "Revendez avec profit",
  description: "Utilisez nos analyses de tendances pour choisir le moment optimal de revente et maximiser vos marges."
}];
const testimonials = [{
  name: "Thomas D.",
  role: "Revendeur GPU",
  content: "J'ai doublé mes profits en 2 mois. L'outil de scanning me fait gagner 4h par jour et je ne rate plus aucune bonne affaire.",
  profit: "+142%"
}, {
  name: "Sarah M.",
  role: "Débutante",
  content: "La formation m'a permis de passer de 0 à mes premières 5 transactions rentables en 3 semaines. Tout est expliqué pas à pas.",
  profit: "+850€"
}, {
  name: "Kevin L.",
  role: "Pro de l'achat-revente",
  content: "Après 2 ans à faire ça à l'ancienne, cet outil a transformé mon business. Les alertes en temps réel sont juste incroyables.",
  profit: "+3200€/mois"
}];
const mainFeatures = [{
  icon: Search,
  title: "Scanner intelligent",
  description: "Scannez automatiquement des milliers d'annonces en quelques secondes",
  tooltip: "Parcourez automatiquement LeBonCoin et d'autres plateformes pour trouver les meilleures annonces",
  color: "primary"
}, {
  icon: BarChart3,
  title: "Analyses avancées",
  description: "Graphiques détaillés, tendances du marché et prédictions de prix",
  tooltip: "Visualisez l'évolution des prix, les tendances du marché et anticipez les opportunités",
  color: "accent"
}, {
  icon: Target,
  title: "Détection d'opportunités",
  description: "Repérez instantanément les meilleures affaires",
  tooltip: "Notre algorithme identifie les annonces sous-cotées avec le meilleur potentiel de profit",
  color: "success"
}];
export default function Landing() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  useEffect(() => {
    const checkMaintenance = async () => {
      const {
        data
      } = await supabase.from('system_settings').select('maintenance_mode').eq('id', 1).single();
      if (data) {
        setMaintenanceMode(data.maintenance_mode);
      }
    };
    checkMaintenance();
    const maintenanceChannel = supabase.channel('system_settings_landing').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'system_settings'
    }, () => {
      checkMaintenance();
    }).subscribe();
    return () => {
      maintenanceChannel.unsubscribe();
    };
  }, []);
  return <div className="min-h-screen">
      {maintenanceMode && <Alert className="bg-warning/10 border-warning/50 rounded-none border-x-0 border-t-0">
          <Construction className="h-5 w-5 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Maintenance en cours.</strong> Le site est actuellement en maintenance. Les nouvelles inscriptions et connexions sont temporairement désactivées pour les utilisateurs réguliers.
          </AlertDescription>
        </Alert>}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20 md:py-32">
        <div className="container relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Devenez expert en achat-revente de hardware
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Scannez le marché, analysez les opportunités et maximisez vos profits grâce à notre plateforme et formation complète
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  S'inscrire
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild>
                <a href="#pricing" onClick={scrollToPricing}>Voir les tarifs</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Sans engagement • ✓ Support 7j/7
            </p>
          </motion.div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Stats teaser */}
      <section className="py-12 border-b">
        <div className="container">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Annonces scannées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">50K+</div>
                  <p className="text-xs text-muted-foreground mt-1">Chaque semaine</p>
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
                  <p className="text-xs text-muted-foreground mt-1">Par transaction</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Utilisateurs actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">10K+</div>
                  <p className="text-xs text-muted-foreground mt-1">Communauté</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Temps économisé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4h+</div>
                  <p className="text-xs text-muted-foreground mt-1">Par jour</p>
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

          <TooltipProvider>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid md:grid-cols-3 gap-8">
              {mainFeatures.map((feature, i) => <motion.div key={i} variants={itemVariants} className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`h-16 w-16 rounded-full bg-${feature.color}/10 flex items-center justify-center mx-auto mb-4 cursor-help transition-transform hover:scale-110`}>
                        <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>)}
            </motion.div>
          </TooltipProvider>

          <div className="mt-12 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités incluses</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <ul className="space-y-3">
                    {features.map((feature, i) => <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-success" />
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dashed border-muted-foreground/30 hover:border-primary transition-colors">
                              {feature.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>)}
                  </ul>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              Pourquoi nous choisir
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Transformez votre façon d'acheter et revendre
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des résultats concrets et mesurables dès les premières semaines
            </p>
          </div>

          <TooltipProvider>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, i) => <motion.div key={i} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 cursor-help transition-transform hover:scale-110">
                            <benefit.icon className="h-6 w-6 text-primary" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{benefit.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{benefit.description}</p>
                      {'cta' in benefit && benefit.cta && <Link to={benefit.cta.href}>
                          
                        </Link>}
                    </CardContent>
                  </Card>
                </motion.div>)}
            </motion.div>
          </TooltipProvider>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              Simple et efficace
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Comment ça fonctionne ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un processus en 5 étapes pour réussir vos premiers deals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {howItWorks.map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="relative">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="container">
          <PricingSection showHeader={true} />
        </div>
      </section>

      {/* Formation */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-6 cursor-help transition-transform hover:scale-110">
                      <GraduationCap className="h-8 w-8 text-warning" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Formation progressive du débutant à l'expert</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h2 className="text-3xl font-bold mb-4">
                Formation complète incluse
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Ne vous contentez pas d'un outil, devenez un expert grâce à notre formation pas-à-pas
              </p>
              <TooltipProvider>
                <ul className="space-y-3 mb-8">
                  {trainingModules.map((module, i) => <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-warning" />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help border-b border-dashed border-muted-foreground/30 hover:border-warning transition-colors">
                            {module.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{module.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>)}
                </ul>
              </TooltipProvider>
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
            <Link to="/auth?tab=signup">
              <Button size="lg" className="gap-2">
                <Rocket className="h-5 w-5" />
                S'inscrire maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>;
}