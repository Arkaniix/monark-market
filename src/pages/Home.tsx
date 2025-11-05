import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Zap,
  Search,
  Target,
  BarChart3,
  Users,
  Flame,
  MapPin,
  Calendar,
} from "lucide-react";
import { mockStats, mockAds, subscriptionPlans } from "@/lib/mockData";

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

export default function Home() {
  const topDeals = mockAds.slice(0, 3);

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
            <Badge className="mb-4" variant="secondary">
              <Flame className="h-3 w-3 mr-1" />
              Nouvelle plateforme communautaire
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Maximisez vos profits sur le marché du hardware d'occasion
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Analysez, comparez et trouvez les meilleures opportunités d'achat-revente grâce à l'intelligence collective
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/deals">
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Voir les deals
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <Target className="h-5 w-5" />
                  Essayer gratuitement
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
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
                    Prix médian GPU (30j)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mockStats.medianGPUPrice}€</div>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    -5.2% ce mois
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Annonces analysées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mockStats.totalAds.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mis à jour en temps réel
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Opportunités détectées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{mockStats.opportunities}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deals actifs maintenant
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Volume total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(mockStats.totalVolume / 1000000).toFixed(1)}M€</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Marché total analysé
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Top Opportunities */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top opportunités du moment</h2>
              <p className="text-muted-foreground">
                Les meilleures affaires détectées par notre communauté
              </p>
            </div>
            <Link to="/deals">
              <Button variant="outline">Voir tout</Button>
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {topDeals.map((deal) => (
              <motion.div key={deal.id} variants={itemVariants}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={deal.dealScore > 85 ? "default" : "secondary"}>
                        {deal.dealScore > 85 && <Flame className="h-3 w-3 mr-1" />}
                        Score: {deal.dealScore}/100
                      </Badge>
                      <span className="text-2xl font-bold">{deal.price}€</span>
                    </div>
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {deal.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(deal.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Fair Value: {deal.fairValue}€
                        </span>
                        <span className="text-xs font-medium text-success">
                          -{Math.round(((deal.fairValue - deal.price) / deal.fairValue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Comment ça marche ?</h2>
            <p className="text-muted-foreground">
              3 étapes simples pour commencer à gagner
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
              <h3 className="text-xl font-semibold mb-2">1. Scannez le marché</h3>
              <p className="text-muted-foreground">
                Utilisez notre extension pour scanner les annonces de matériel d'occasion
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Analysez les données</h3>
              <p className="text-muted-foreground">
                Accédez à des graphiques détaillés, tendances et estimations de prix
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Achetez & Revendez</h3>
              <p className="text-muted-foreground">
                Trouvez les meilleures opportunités et maximisez vos marges
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Subscriptions */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Choisissez votre formule</h2>
            <p className="text-muted-foreground">
              Des plans adaptés à tous les besoins
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {subscriptionPlans.map((plan) => (
              <motion.div key={plan.name} variants={itemVariants}>
                <Card className={plan.popular ? "border-primary shadow-lg" : ""}>
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                      Le plus populaire
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.credits} crédits inclus
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-success" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Commencer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Rejoignez la communauté</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Plus de 2 500 contributeurs actifs partagent leurs données pour améliorer les analyses en temps réel
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline">
                Rejoindre Discord
              </Button>
              <Button size="lg">
                Commencer à contribuer
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
