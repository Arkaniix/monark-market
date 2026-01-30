import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Headphones, FileText } from "lucide-react";

const reassurances = [
  { icon: Shield, text: "Conforme RGPD" },
  { icon: Headphones, text: "Support 7j/7" },
  { icon: FileText, text: "Sans engagement" },
];

interface FinalCTASectionProps {
  onScrollToPricing: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function FinalCTASection({ onScrollToPricing }: FinalCTASectionProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à mieux acheter et revendre ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez Monark et prenez des décisions éclairées, basées sur les données du marché.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="min-w-[160px]">
                S'inscrire
              </Button>
            </Link>
            <Button size="lg" variant="outline" asChild>
              <a href="#pricing" onClick={onScrollToPricing}>
                Voir les tarifs
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {reassurances.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t text-xs text-muted-foreground space-x-4">
            <Link to="/legal-notice" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link to="/cgu" className="hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link to="/rgpd" className="hover:text-foreground transition-colors">
              Politique de confidentialité
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
