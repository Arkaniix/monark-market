// Bloc Options d'estimation - sans plateforme / sans état
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { EstimationOptions } from "@/types/estimator";

interface EstimationOptionsBlockProps {
  options: EstimationOptions;
  onChange: (options: EstimationOptions) => void;
}

export default function EstimationOptionsBlock({ options, onChange }: EstimationOptionsBlockProps) {
  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Options d'estimation</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Si une info est inconnue, on calcule une fourchette et on réduit la précision.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="without-platform" 
              checked={options.withoutPlatform}
              onCheckedChange={(checked) => onChange({ ...options, withoutPlatform: !!checked })}
            />
            <Label htmlFor="without-platform" className="text-sm cursor-pointer">
              Estimation sans plateforme
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="without-condition" 
              checked={options.withoutCondition}
              onCheckedChange={(checked) => onChange({ ...options, withoutCondition: !!checked })}
            />
            <Label htmlFor="without-condition" className="text-sm cursor-pointer">
              Estimation sans état
            </Label>
          </div>
        </div>
        
        {(options.withoutPlatform || options.withoutCondition) && (
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Les résultats afficheront des fourchettes avec un niveau de confiance réduit.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
