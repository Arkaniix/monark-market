import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Search, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import ScrapModal from "@/components/ScrapModal";

interface WelcomeHeaderProps {
  userName?: string;
  lastScrapDate?: string;
  planName: string;
  creditsRemaining: number;
}

export function WelcomeHeader({ userName = "Utilisateur", lastScrapDate, planName, creditsRemaining }: WelcomeHeaderProps) {
  const [scrapModalOpen, setScrapModalOpen] = useState(false);
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

  // Statut du scrap (peut être récupéré via API)
  const scrapStatus = 'available' as 'available' | 'waiting' | 'paused';
  
  const getStatusConfig = () => {
    switch (scrapStatus) {
      case 'available':
        return { color: 'bg-success', label: 'Disponible', pulse: true };
      case 'waiting':
        return { color: 'bg-warning', label: 'En attente', pulse: false };
      case 'paused':
        return { color: 'bg-destructive', label: 'En pause', pulse: false };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
      <div className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Message de bienvenue */}
            <div className="space-y-3">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-50" />
                <h1 className="text-3xl md:text-4xl font-bold relative">
                  Bienvenue, {userName} 👋
                </h1>
              </div>
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
              <Button 
                size="lg" 
                className="gap-2 relative group"
                onClick={() => setScrapModalOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className={`h-2 w-2 rounded-full ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
                  </div>
                  <Search className="h-5 w-5" />
                  Lancer un scrap
                </div>
              </Button>
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
      
      <ScrapModal open={scrapModalOpen} onOpenChange={setScrapModalOpen} />
    </section>
  );
}