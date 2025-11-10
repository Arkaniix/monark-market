import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Target, BarChart3, Users, Zap, GraduationCap, TrendingUp, Check, Clock, Shield, Rocket, DollarSign, Bell, Award, Construction } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
const features = ["Scanner automatique d'annonces", "Analyses de tendances en temps réel", "Estimateur de prix intelligent", "Alertes personnalisées", "Accès à la communauté Discord"];
const trainingModules = ["Comment identifier les bonnes affaires", "Stratégies d'achat-revente efficaces", "Optimisation des marges bénéficiaires", "Gestion des risques et pièges à éviter"];
const benefits = [{
  icon: DollarSign,
  title: "Maximisez vos profits",
  description: "Identifiez les opportunités sous-évaluées et vendez au meilleur moment grâce à nos analyses de marché en temps réel."
}, {
  icon: Clock,
  title: "Gagnez du temps",
  description: "Notre scanner automatique fait le travail à votre place. Plus besoin de parcourir des centaines d'annonces manuellement."
}, {
  icon: Shield,
  title: "Réduisez les risques",
  description: "Évitez les mauvais achats grâce à notre système de scoring et nos alertes sur les prix anormaux."
}, {
  icon: Award,
  title: "Devenez expert",
  description: "Apprenez les techniques des professionnels avec notre formation complète et notre communauté active."
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
export default function Landing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [mostPopularPlanId, setMostPopularPlanId] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Fonctionnalités par plan
  const planFeaturesMap: Record<string, string[]> = {
    'Basic': ['Accès au catalogue complet', 'Estimations de prix', 'Alertes de nouvelles annonces', 'Support par email'],
    'Pro': ['Tout du plan Basic', 'Comparateur de modèles avancé', 'Statistiques de marché détaillées', 'Alertes personnalisées prioritaires', 'Support prioritaire', 'Historique des tendances'],
    'Elite': ['Tout du plan Pro', 'Analyses prédictives IA', 'Conseils d\'investissement', 'Exports de données personnalisés', 'Support dédié 24/7', 'Rapports personnalisés mensuels']
  };
  useEffect(() => {
    const fetchPlans = async () => {
      // Récupérer les plans
      const {
        data: plansData
      } = await supabase.from("subscription_plans").select("*").eq("is_active", true).order("price", {
        ascending: true
      });
      if (plansData) {
        setPlans(plansData);

        // Compter les utilisateurs actifs pour chaque plan
        const {
          data: subscriptionsData
        } = await supabase.from("user_subscriptions").select("plan_id").eq("status", "active");
        if (subscriptionsData) {
          // Compter les abonnés par plan
          const planCounts = subscriptionsData.reduce((acc: Record<string, number>, sub) => {
            acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
            return acc;
          }, {});

          // Trouver le plan avec le plus d'abonnés
          let maxCount = 0;
          let popularPlanId = null;
          for (const [planId, count] of Object.entries(planCounts)) {
            if (count > maxCount) {
              maxCount = count;
              popularPlanId = planId;
            }
          }
          setMostPopularPlanId(popularPlanId);
        }
      }
    };
    fetchPlans();

    // Check maintenance mode
    const checkMaintenance = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single();
      
      if (data) {
        setMaintenanceMode(data.maintenance_mode);
      }
    };

    checkMaintenance();

    // Subscribe to maintenance mode changes
    const maintenanceChannel = supabase
      .channel('system_settings_landing')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          checkMaintenance();
        }
      )
      .subscribe();

    return () => {
      maintenanceChannel.unsubscribe();
    };
  }, []);
  return <div className="min-h-screen">
      {maintenanceMode && (
        <Alert className="bg-warning/10 border-warning/50 rounded-none border-x-0 border-t-0">
          <Construction className="h-5 w-5 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Maintenance en cours.</strong> Le site est actuellement en maintenance. Les nouvelles inscriptions et connexions sont temporairement désactivées pour les utilisateurs réguliers.
          </AlertDescription>
        </Alert>
      )}
      
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
                <a href="#pricing">Voir les tarifs</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4"> ✓ Sans engagement • ✓ Support 7j/7</p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Stats teaser - chiffres génériques pour l'engagement */}
      <section className="py-12 border-b">
        <div className="container">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid md:grid-cols-3 gap-8">
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
                  {features.map((feature, i) => <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span>{feature}</span>
                    </li>)}
                </ul>
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

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => <motion.div key={i} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
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

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              Témoignages
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Ils ont transformé leur activité
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejoignez des centaines de membres qui génèrent des revenus réguliers
            </p>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => <motion.div key={i} variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        {testimonial.profit}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              Tarifs
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Choisissez le plan qui vous convient
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tous les plans incluent la formation complète et l'accès à la communauté
            </p>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => {
            const isPopular = plan.id === mostPopularPlanId;
            const planFeatures = planFeaturesMap[plan.name] || [];

            // Définir les icônes pour chaque plan
            const planIcons: Record<string, any> = {
              'Basic': Zap,
              'Pro': Award,
              'Elite': Rocket
            };
            const PlanIcon = planIcons[plan.name] || Zap;
            return <motion.div key={plan.id} variants={itemVariants} className="relative">
                  {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Populaire
                      </Badge>
                    </div>}
                  <Card className={`h-full flex flex-col ${isPopular ? 'border-primary border-2' : 'border-border'}`}>
                    <CardHeader className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 flex items-center justify-center">
                          <PlanIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {plan.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{plan.price}€</span>
                          <span className="text-muted-foreground">/mois</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col space-y-6">
                      <div className="flex-1">
                        {planFeatures.length > 0 ? <ul className="space-y-3">
                            {planFeatures.map((feature: string, idx: number) => <li key={idx} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">{feature}</span>
                              </li>)}
                          </ul> : <p className="text-sm text-muted-foreground">Fonctionnalités à venir</p>}
                      </div>
                      
                      <Link to="/auth" className="block w-full mt-auto">
                        <Button className="w-full" variant="outline" size="lg">
                          Choisir ce plan
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>;
          })}
          </motion.div>

          {plans.length === 0 && <div className="text-center text-muted-foreground">
              Chargement des plans...
            </div>}
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
                {trainingModules.map((module, i) => <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-warning" />
                    </div>
                    <span>{module}</span>
                  </li>)}
              </ul>
              
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