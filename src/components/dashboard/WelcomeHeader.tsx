import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Search, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface WelcomeHeaderProps {
  userName?: string;
  lastScrapDate?: string;
  planName: string;
  creditsRemaining: number;
}

export function WelcomeHeader({ userName = "Utilisateur", lastScrapDate, planName, creditsRemaining }: WelcomeHeaderProps) {
  const formatDate = (date?: string) => {
    if (!date) return "jamais";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Message de bienvenue */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold">
                Bienvenue, {userName} 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Ton dernier scrap remonte à <span className="font-semibold text-foreground">{formatDate(lastScrapDate)}</span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1.5">
                  <Award className="h-4 w-4 mr-1.5" />
                  Niveau : Analyste
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1.5">
                  Abonnement : {planName}
                </Badge>
                <Badge variant="default" className="text-sm px-3 py-1.5">
                  {creditsRemaining} crédits restants
                </Badge>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-wrap gap-3">
              <Link to="/community">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Lancer un scrap
                </Button>
              </Link>
              <Link to="/trends">
                <Button variant="outline" size="lg" className="gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Mes tendances
                </Button>
              </Link>
              <Link to="/catalog">
                <Button variant="outline" size="lg" className="gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Catalogue
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg" className="gap-2">
                  <Users className="h-5 w-5" />
                  Communauté
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}