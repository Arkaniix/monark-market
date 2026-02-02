import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";
import { PricingSection } from "@/components/pricing/PricingTable";
import {
  HeroSection,
  ProblemSolutionSection,
  ValueCardsSection,
  ProductDemoSection,
  HowItWorksSection,
  TargetAudienceSection,
  TrainingSection,
  FAQSection,
  FinalCTASection,
} from "@/components/landing";

export default function Landing() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const checkMaintenance = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("maintenance_mode")
        .eq("id", 1)
        .single();
      if (data) {
        setMaintenanceMode(data.maintenance_mode);
      }
    };
    checkMaintenance();

    const maintenanceChannel = supabase
      .channel("system_settings_landing")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "system_settings",
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

  return (
    <div className="min-h-screen">
      {maintenanceMode && (
        <Alert className="bg-warning/10 border-warning/50 rounded-none border-x-0 border-t-0">
          <Construction className="h-5 w-5 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Maintenance en cours.</strong> Le site est actuellement en
            maintenance. Les nouvelles inscriptions et connexions sont
            temporairement désactivées pour les utilisateurs réguliers.
          </AlertDescription>
        </Alert>
      )}

      {/* A. Hero */}
      <HeroSection onScrollToPricing={scrollToPricing} />

      {/* B. Problème → Solution */}
      <ProblemSolutionSection />

      {/* C. Ce que vous obtenez */}
      <ValueCardsSection />

      {/* D. Démo produit */}
      <ProductDemoSection />

      {/* E. Comment ça marche */}
      <HowItWorksSection />

      {/* F. Formation */}
      <TrainingSection />

      {/* G. Pour qui / Pas pour qui */}
      <TargetAudienceSection />

      {/* H. Tarifs */}
      <section id="pricing" className="py-16 md:py-20">
        <div className="container">
          <PricingSection showHeader={true} />
        </div>
      </section>

      {/* H. FAQ */}
      <FAQSection />

      {/* I. CTA final */}
      <FinalCTASection onScrollToPricing={scrollToPricing} />
    </div>
  );
}
