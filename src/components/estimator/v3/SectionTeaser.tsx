import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { V3UpgradeHint } from "@/types/estimatorV3";
import { LEVEL_LABELS } from "@/types/estimatorV3";

interface SectionTeaserProps {
  title: string;
  description: string;
  features: string[];
  savingsHint?: string | null;
  upgradeHint?: V3UpgradeHint;
}

export default function SectionTeaser({ title, description, features, savingsHint, upgradeHint }: SectionTeaserProps) {
  const ctaLabel = upgradeHint
    ? `Passer au plan ${LEVEL_LABELS[upgradeHint.next_level] || upgradeHint.next_level}`
    : "Voir les plans";

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
      {/* Blurred fake content background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/60 backdrop-blur-sm" />

      <CardContent className="relative py-8 flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>

        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
        </div>

        {features.length > 0 && (
          <ul className="text-sm text-muted-foreground space-y-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {savingsHint && (
          <p className="text-sm font-medium text-primary flex items-center gap-1.5">
            💡 {savingsHint}
          </p>
        )}

        <Button asChild className="gap-2 mt-2">
          <Link to="/pricing">
            <Lock className="h-4 w-4" />
            {ctaLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
