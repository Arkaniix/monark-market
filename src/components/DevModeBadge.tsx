import { Database, Cloud, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataProviderStatus } from "@/providers/DataContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const WELCOME_MODAL_KEY = "monark_welcome_modal_seen";

export function DevModeBadge() {
  const { isMockMode, isDevMode, switchToApi, switchToMock, clearOverride } = useDataProviderStatus();
  const { toast } = useToast();

  // Only show in dev mode
  if (!isDevMode) {
    return null;
  }

  const hasOverride = typeof window !== 'undefined' && localStorage.getItem('DATA_PROVIDER_OVERRIDE');

  const resetWelcomeModal = () => {
    localStorage.removeItem(WELCOME_MODAL_KEY);
    toast({
      title: "Modale réinitialisée",
      description: "La fenêtre de bienvenue s'affichera au prochain chargement du dashboard.",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 bg-background/95 border border-border rounded-lg shadow-lg p-1">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isMockMode
                    ? 'bg-warning/20 text-warning'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {isMockMode ? (
                  <>
                    <Database className="h-3 w-3" />
                    Mock
                  </>
                ) : (
                  <>
                    <Cloud className="h-3 w-3" />
                    API
                  </>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={isMockMode ? switchToApi : switchToMock}
              >
                → {isMockMode ? 'API' : 'Mock'}
              </Button>

              {isMockMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={resetWelcomeModal}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Revoir la modale de bienvenue</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {hasOverride && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={clearOverride}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Mode: {isMockMode ? 'Mock (données locales)' : 'API (backend réel)'}</p>
            {hasOverride && <p className="text-xs text-muted-foreground">Override active</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
