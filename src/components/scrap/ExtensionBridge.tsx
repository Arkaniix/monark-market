import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Puzzle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  RefreshCw,
  ExternalLink,
  Play,
  Terminal,
  Zap
} from 'lucide-react';
import { ActiveJob, useScrapJobContext } from '@/context/ScrapJobContext';

// Extension communication protocol
const EXTENSION_ID = 'gpudeals-extension';
export const MESSAGE_TYPES = {
  PING: 'GPUDEALS_PING',
  PONG: 'GPUDEALS_PONG',
  START_SCRAP: 'GPUDEALS_START_SCRAP',
  SCRAP_PROGRESS: 'GPUDEALS_SCRAP_PROGRESS',
  SCRAP_COMPLETE: 'GPUDEALS_SCRAP_COMPLETE',
  SCRAP_ERROR: 'GPUDEALS_SCRAP_ERROR',
} as const;

export interface ExtensionMessage {
  type: keyof typeof MESSAGE_TYPES;
  source: string;
  timestamp: number;
  payload?: unknown;
}

interface ExtensionBridgeProps {
  job?: ActiveJob | null;
  onExtensionStatusChange?: (detected: boolean) => void;
  onProgress?: (pages: number, ads: number) => void;
  onComplete?: (result: { pages: number; ads: number }) => void;
  onError?: (error: string) => void;
}

export default function ExtensionBridge({ 
  job, 
  onExtensionStatusChange,
  onProgress,
  onComplete,
  onError 
}: ExtensionBridgeProps) {
  const { extensionDetected, setExtensionDetected } = useScrapJobContext();
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
  }, []);

  // Ping the extension to check if it's installed
  const pingExtension = useCallback(() => {
    setIsPinging(true);
    addLog('Envoi PING vers extension...');
    
    window.postMessage({
      type: MESSAGE_TYPES.PING,
      source: 'gpudeals-webapp',
      timestamp: Date.now(),
    }, '*');

    const timeout = setTimeout(() => {
      setIsPinging(false);
      if (!extensionDetected) {
        addLog('Pas de réponse PONG - Extension non détectée');
        onExtensionStatusChange?.(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [extensionDetected, onExtensionStatusChange, addLog]);

  // Listen for extension messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case MESSAGE_TYPES.PONG:
          if (data.source === EXTENSION_ID || data.source === 'simulation') {
            setExtensionDetected(true);
            setIsPinging(false);
            setLastPingTime(new Date());
            addLog(`PONG reçu de ${data.source}`);
            onExtensionStatusChange?.(true);
          }
          break;

        case MESSAGE_TYPES.SCRAP_PROGRESS:
          addLog(`Progress: ${data.payload?.pages_scanned} pages, ${data.payload?.ads_found} annonces`);
          onProgress?.(data.payload?.pages_scanned || 0, data.payload?.ads_found || 0);
          break;

        case MESSAGE_TYPES.SCRAP_COMPLETE:
          addLog(`Scrap terminé: ${data.payload?.ads_found} annonces trouvées`);
          setMessageSent(false);
          setSimulationRunning(false);
          onComplete?.(data.payload);
          break;

        case MESSAGE_TYPES.SCRAP_ERROR:
          addLog(`Erreur: ${data.payload?.message}`);
          setMessageSent(false);
          setSimulationRunning(false);
          onError?.(data.payload?.message || 'Unknown error');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    pingExtension();

    return () => {
      window.removeEventListener('message', handleMessage);
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [pingExtension, setExtensionDetected, onExtensionStatusChange, onProgress, onComplete, onError, addLog]);

  // Send start command to extension
  const sendStartToExtension = useCallback(() => {
    if (!job) return;

    const message: ExtensionMessage = {
      type: 'START_SCRAP',
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

    addLog(`Envoi START_SCRAP: job_id=${job.job_id}, keyword="${job.keyword}"`);
    window.postMessage(message, '*');
    setMessageSent(true);
  }, [job, addLog]);

  // Simulation mode - fake extension responses
  const startSimulation = useCallback(() => {
    if (!job) return;

    addLog('🎭 Démarrage simulation...');
    setSimulationRunning(true);
    setMessageSent(true);

    // Simulate PONG response
    setTimeout(() => {
      window.postMessage({
        type: MESSAGE_TYPES.PONG,
        source: 'simulation',
        timestamp: Date.now(),
      }, '*');
    }, 100);

    // Simulate progress updates
    let pages = 0;
    let ads = 0;
    const targetPages = (job.params?.pages_target as number) || 5;

    simulationRef.current = setInterval(() => {
      pages++;
      ads += Math.floor(Math.random() * 8) + 2;

      window.postMessage({
        type: MESSAGE_TYPES.SCRAP_PROGRESS,
        source: 'simulation',
        timestamp: Date.now(),
        payload: { pages_scanned: pages, ads_found: ads },
      }, '*');

      if (pages >= targetPages) {
        clearInterval(simulationRef.current!);
        simulationRef.current = null;
        
        setTimeout(() => {
          window.postMessage({
            type: MESSAGE_TYPES.SCRAP_COMPLETE,
            source: 'simulation',
            timestamp: Date.now(),
            payload: { pages: pages, ads: ads },
          }, '*');
        }, 500);
      }
    }, 800);
  }, [job, addLog]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setSimulationRunning(false);
    setMessageSent(false);
    addLog('🛑 Simulation arrêtée');
  }, [addLog]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Puzzle className="h-4 w-4" />
            Extension Bridge
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="simulation" className="text-xs font-normal text-muted-foreground">
              Mode simulation
            </Label>
            <Switch
              id="simulation"
              checked={simulationMode}
              onCheckedChange={setSimulationMode}
              disabled={messageSent}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {extensionDetected || simulationMode ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">
                  {simulationMode ? 'Mode simulation' : 'Extension détectée'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {simulationRunning ? 'En cours...' : 'Prête'}
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium">Extension non détectée</span>
              </>
            )}
          </div>
          {!simulationMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={pingExtension}
              disabled={isPinging}
            >
              <RefreshCw className={`h-4 w-4 ${isPinging ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {lastPingTime && extensionDetected && !simulationMode && (
          <p className="text-xs text-muted-foreground">
            Dernière vérification : {lastPingTime.toLocaleTimeString()}
          </p>
        )}

        {/* Not detected message */}
        {!extensionDetected && !simulationMode && !isPinging && (
          <Alert>
            <AlertDescription className="text-sm">
              L'extension GPUDeals n'est pas installée. Activez le mode simulation pour tester.
              <Button variant="link" size="sm" className="px-1 h-auto" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Installer l'extension
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        {(extensionDetected || simulationMode) && job && (
          <div className="space-y-2">
            {simulationMode ? (
              <div className="flex gap-2">
                <Button
                  onClick={startSimulation}
                  disabled={simulationRunning}
                  className="flex-1 gap-2"
                >
                  <Play className="h-4 w-4" />
                  Simuler le scrap
                </Button>
                {simulationRunning && (
                  <Button
                    variant="destructive"
                    onClick={stopSimulation}
                  >
                    Stop
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={sendStartToExtension}
                disabled={messageSent}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {messageSent ? 'Commande envoyée...' : 'Envoyer à l\'extension'}
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Logs console */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Terminal className="h-4 w-4" />
            Console postMessage
          </div>
          <div className="bg-muted/50 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground italic">En attente de messages...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className="text-muted-foreground">{log}</p>
              ))
            )}
          </div>
        </div>

        {/* Job debug info */}
        {job && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded font-mono space-y-1">
            <p className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span className="font-semibold">Job #{job.job_id}</span>
            </p>
            <p>Platform: {job.platform}</p>
            <p>Keyword: {job.keyword}</p>
            <p>Type: {job.type}</p>
            {job.upload_token && <p>Token: {job.upload_token.slice(0, 8)}...</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
