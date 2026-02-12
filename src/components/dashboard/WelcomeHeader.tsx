import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Download, GraduationCap, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

interface WelcomeHeaderProps {
  userName?: string;
  lastAnalysisDate?: string;
  planName: string;
  creditsRemaining: number;
}

export function WelcomeHeader({
  userName = "Utilisateur",
  lastAnalysisDate,
  planName,
  creditsRemaining
}: WelcomeHeaderProps) {
  const [extensionDetected] = useState(false);

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
      <div className="container py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-50" />
                <h1 className="text-3xl md:text-4xl font-bold relative">
                  Bienvenue, {userName} 👋
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Ta dernière analyse remonte à <span className="font-semibold text-foreground">{formatDate(lastAnalysisDate)}</span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-sm px-3 py-1.5">
                  Abonnement : {planName}
                </Badge>
                <Badge variant="default" className="text-sm px-3 py-1.5">
                  {creditsRemaining} crédits
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/estimator">
                  <Eye className="h-5 w-5" />
                  Lancer une analyse
                </Link>
              </Button>

              {extensionDetected ? (
                <Button size="lg" variant="outline" className="gap-2 text-success border-success/30 bg-success/10 hover:bg-success/20 cursor-default">
                  <Check className="h-5 w-5" />
                  Extension Lens OK
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5" />
                    Installer Monark Lens
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
