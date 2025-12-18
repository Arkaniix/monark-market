import { AlertTriangle, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataProviderStatus } from "@/providers/DataContext";

export function ApiUnavailableBanner() {
  const { isApiUnavailable, isDevMode, isMockMode, switchToMock, checkApiHealth } = useDataProviderStatus();

  // Don't show if API is available or already in mock mode
  if (!isApiUnavailable || isMockMode) {
    return null;
  }

  const handleRetry = async () => {
    const isHealthy = await checkApiHealth();
    if (isHealthy) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/95 text-destructive-foreground px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">API inaccessible</p>
            <p className="text-sm opacity-90">
              Impossible de se connecter au backend. Vérifiez votre connexion ou passez en mode mock.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          
          {isDevMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={switchToMock}
              className="gap-2 bg-background/20 border-background/30 hover:bg-background/30"
            >
              <Database className="h-4 w-4" />
              Basculer en mode mock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
