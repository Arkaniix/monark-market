import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Puzzle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { ActiveJob, useScrapJobContext } from '@/context/ScrapJobContext';

// Extension communication protocol
const EXTENSION_ID = 'gpudeals-extension';
const MESSAGE_TYPES = {
  PING: 'GPUDEALS_PING',
  PONG: 'GPUDEALS_PONG',
  START_SCRAP: 'GPUDEALS_START_SCRAP',
  SCRAP_PROGRESS: 'GPUDEALS_SCRAP_PROGRESS',
  SCRAP_COMPLETE: 'GPUDEALS_SCRAP_COMPLETE',
  SCRAP_ERROR: 'GPUDEALS_SCRAP_ERROR',
};

interface ExtensionBridgeProps {
  job?: ActiveJob | null;
  onExtensionStatusChange?: (detected: boolean) => void;
}

export default function ExtensionBridge({ job, onExtensionStatusChange }: ExtensionBridgeProps) {
  const { extensionDetected, setExtensionDetected } = useScrapJobContext();
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  // Ping the extension to check if it's installed
  const pingExtension = useCallback(() => {
    setIsPinging(true);
    
    // Send ping message
    window.postMessage({
      type: MESSAGE_TYPES.PING,
      source: 'gpudeals-webapp',
      timestamp: Date.now(),
    }, '*');

    // Wait for pong response
    const timeout = setTimeout(() => {
      setIsPinging(false);
      if (!extensionDetected) {
        onExtensionStatusChange?.(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [extensionDetected, onExtensionStatusChange]);

  // Listen for extension messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.source !== window) return;
      
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case MESSAGE_TYPES.PONG:
          if (data.source === EXTENSION_ID) {
            setExtensionDetected(true);
            setIsPinging(false);
            setLastPingTime(new Date());
            onExtensionStatusChange?.(true);
          }
          break;

        case MESSAGE_TYPES.SCRAP_PROGRESS:
          console.log('[ExtensionBridge] Scrap progress:', data.payload);
          break;

        case MESSAGE_TYPES.SCRAP_COMPLETE:
          console.log('[ExtensionBridge] Scrap complete:', data.payload);
          setMessageSent(false);
          break;

        case MESSAGE_TYPES.SCRAP_ERROR:
          console.error('[ExtensionBridge] Scrap error:', data.payload);
          setMessageSent(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Initial ping on mount
    pingExtension();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [pingExtension, setExtensionDetected, onExtensionStatusChange]);

  // Send start command to extension
  const sendStartToExtension = useCallback(() => {
    if (!job) return;

    const message = {
      type: MESSAGE_TYPES.START_SCRAP,
      source: 'gpudeals-webapp',
      timestamp: Date.now(),
      payload: {
        job_id: job.job_id,
        upload_token: job.upload_token,
        platform: job.platform,
        keyword: job.keyword,
        type: job.type,
        params: job.params,
      },
    };

    console.log('[ExtensionBridge] Sending start message:', message);
    window.postMessage(message, '*');
    setMessageSent(true);
  }, [job]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Puzzle className="h-4 w-4" />
          Extension Navigateur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {extensionDetected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Extension détectée</span>
                <Badge variant="secondary" className="text-xs">
                  Prête
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium">Extension non détectée</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={pingExtension}
            disabled={isPinging}
          >
            <RefreshCw className={`h-4 w-4 ${isPinging ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {lastPingTime && extensionDetected && (
          <p className="text-xs text-muted-foreground">
            Dernière vérification : {lastPingTime.toLocaleTimeString()}
          </p>
        )}

        {/* Not detected message */}
        {!extensionDetected && !isPinging && (
          <Alert>
            <AlertDescription className="text-sm">
              L'extension GPUDeals n'est pas installée ou désactivée. 
              Installez-la pour pouvoir lancer des scans.
              <Button variant="link" size="sm" className="px-1 h-auto" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Installer l'extension
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Send to extension button */}
        {extensionDetected && job && (
          <div className="space-y-2">
            <Button
              onClick={sendStartToExtension}
              disabled={messageSent}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {messageSent ? 'Commande envoyée...' : 'Envoyer à l\'extension'}
            </Button>
            {messageSent && (
              <p className="text-xs text-muted-foreground text-center">
                L'extension va ouvrir un nouvel onglet et commencer le scan.
              </p>
            )}
          </div>
        )}

        {/* Debug info */}
        {job && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
            <p>Job ID: {job.job_id}</p>
            <p>Platform: {job.platform}</p>
            <p>Keyword: {job.keyword}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
