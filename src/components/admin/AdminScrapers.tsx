import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Pause, PlayCircle, Settings, ScrollText, Wifi, WifiOff, Loader2, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiGet } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { useScraperWebSocket } from "@/hooks/useScraperWebSocket";
import type { ScraperInfo } from "@/types/admin";

// ============= Status badge =============
const STATUS_CFG: Record<string, { label: string; className: string; pulse?: boolean }> = {
  running:   { label: "En cours",  className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", pulse: true },
  paused:    { label: "En pause",  className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  idle:      { label: "Inactif",   className: "bg-muted text-muted-foreground border-border" },
  error:     { label: "Erreur",    className: "bg-destructive/15 text-destructive border-destructive/30" },
  completed: { label: "Terminé",   className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.idle;
  return (
    <Badge variant="outline" className={`${cfg.className} text-[11px] gap-1`}>
      {cfg.pulse && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {cfg.label}
    </Badge>
  );
}

// ============= Time helpers =============
function timeAgo(iso: string | null) {
  if (!iso) return "—";
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr }); } catch { return "—"; }
}

function elapsed(iso: string | null) {
  if (!iso) return null;
  try { return formatDistanceToNow(new Date(iso), { locale: fr }); } catch { return null; }
}

// ============= ScraperCard =============
interface ScraperCardProps {
  scraper: ScraperInfo;
  onAction: (name: string, action: string) => Promise<void>;
  onConfig: (s: ScraperInfo) => void;
  onLogs: (name: string) => void;
  loadingAction: string | null;
}

function ScraperCard({ scraper: s, onAction, onConfig, onLogs, loadingAction }: ScraperCardProps) {
  const isActive = s.status === "running" || s.status === "paused";
  const actionKey = `${s.name}:`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{s.label}</h3>
          <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
        </div>
        <StatusBadge status={s.status} />
      </CardHeader>

      <CardContent className="flex-1 space-y-2 text-xs">
        {isActive ? (
          <>
            <div className="space-y-1">
              <Progress
                value={s.percent ?? 0}
                className="h-2"
                style={{ ["--progress-color" as string]: s.status === "running" ? "hsl(142 71% 45%)" : "hsl(45 93% 47%)" } as React.CSSProperties}
              />
              <p className="text-muted-foreground tabular-nums">
                {s.progress ?? 0}/{s.total ?? 0} modèles ({(s.percent ?? 0).toFixed(1)}%)
              </p>
            </div>
            {s.current_model && <p className="truncate">→ <span className="text-foreground font-medium">{s.current_model}</span></p>}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
              {s.stats?.items_inserted != null && <span>{s.stats.items_inserted} obs</span>}
              {s.stats?.items_matched != null && <span>{s.stats.items_matched} match</span>}
              {(s.stats?.errors ?? 0) > 0 && <span className="text-destructive">{s.stats.errors} err</span>}
            </div>
            {s.started_at && <p className="text-muted-foreground">depuis {elapsed(s.started_at)}</p>}
          </>
        ) : s.status === "error" ? (
          <p className="text-destructive text-xs leading-snug line-clamp-3">{s.error_message || "Erreur inconnue"}</p>
        ) : (
          <>
            <p className="text-muted-foreground">Dernier run : {timeAgo(s.completed_at || s.updated_at)}</p>
            <p className="text-muted-foreground">Programmé : <span className="text-foreground">{s.schedule}</span></p>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-2 border-t">
        {(s.status === "idle" || s.status === "completed" || s.status === "error") && (
          <>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onAction(s.name, "start")} disabled={!!loadingAction}>
              {loadingAction === `${actionKey}start` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Lancer
            </Button>
            <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => onConfig(s)}>
              <Settings className="h-3 w-3" />
            </Button>
          </>
        )}
        {s.status === "running" && (
          <>
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25" onClick={() => onAction(s.name, "pause")} disabled={!!loadingAction}>
              {loadingAction === `${actionKey}pause` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
              Pause
            </Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => onAction(s.name, "stop")} disabled={!!loadingAction}>
              {loadingAction === `${actionKey}stop` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
              Stop
            </Button>
          </>
        )}
        {s.status === "paused" && (
          <>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onAction(s.name, "resume")} disabled={!!loadingAction}>
              {loadingAction === `${actionKey}resume` ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
              Reprendre
            </Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => onAction(s.name, "stop")} disabled={!!loadingAction}>
              {loadingAction === `${actionKey}stop` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
              Stop
            </Button>
          </>
        )}
        {isActive && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 ml-auto" onClick={() => onLogs(s.name)}>
            <ScrollText className="h-3 w-3" /> Logs
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============= Config modal =============
function ScraperConfigModal({ scraper, open, onClose }: { scraper: ScraperInfo | null; open: boolean; onClose: () => void }) {
  const [schedule, setSchedule] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { if (scraper) setSchedule(scraper.schedule); }, [scraper]);

  const handleSave = async () => {
    if (!scraper) return;
    setSaving(true);
    try {
      await adminApiFetch(ADMIN.SCRAPER_CONFIG(scraper.name), { method: "PATCH", body: JSON.stringify({ schedule }) });
      toast({ title: "Configuration enregistrée" });
      onClose();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuration — {scraper?.label}</DialogTitle>
          <DialogDescription>Modifier le schedule systemd OnCalendar</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="schedule">Schedule</Label>
            <Input id="schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Mon *-*-* 03:00:00" />
            <p className="text-[10px] text-muted-foreground">Format systemd OnCalendar (ex : Mon *-*-* 03:00:00)</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Log line coloring =============
function coloredLine(line: string) {
  if (line.includes("[ERROR]")) return "text-red-400";
  if (line.includes("[WARNING]") || line.includes("[WARN]")) return "text-yellow-400";
  return "text-zinc-300";
}

// ============= Logs panel =============
function ScraperLogsPanel({
  scraperNames,
  logs,
  selectedScraper,
  onSelect,
  onClear,
}: {
  scraperNames: string[];
  logs: string[];
  selectedScraper: string;
  onSelect: (name: string) => void;
  onClear: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs.length]);

  return (
    <div className="rounded-lg border bg-[hsl(var(--card))] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Logs</span>
          <Select value={selectedScraper} onValueChange={onSelect}>
            <SelectTrigger className="h-7 w-[200px] text-xs">
              <SelectValue placeholder="Sélectionner un scraper" />
            </SelectTrigger>
            <SelectContent>
              {scraperNames.map((n) => (
                <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>Effacer</Button>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-3 font-mono text-[11px] leading-relaxed space-y-px min-h-full bg-[hsl(230,25%,9%)]">
          {logs.length === 0 && (
            <p className="text-zinc-500 italic">Aucun log — sélectionnez un scraper ou cliquez "Logs" sur une carte.</p>
          )}
          {logs.map((line, i) => (
            <p key={i} className={coloredLine(line)}>{line}</p>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

// ============= Main component =============
export default function AdminScrapers() {
  const { scrapers: wsScrapers, logs: wsLogs, connected, watchLogs, unwatchLogs } = useScraperWebSocket();
  const [restScrapers, setRestScrapers] = useState<ScraperInfo[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [configScraper, setConfigScraper] = useState<ScraperInfo | null>(null);
  const [selectedLogScraper, setSelectedLogScraper] = useState("");
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const logsPanelRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const { toast } = useToast();

  // Merge: REST as base, WS overlay for real-time fields only
  const scraperList: ScraperInfo[] = restScrapers.length > 0
    ? restScrapers.map((rest) => {
        const ws = wsScrapers[rest.name];
        if (!ws) return rest;
        return {
          ...rest,
          ...ws,
          label: rest.label,
          description: rest.description,
          schedule: rest.schedule,
          timer: rest.timer,
        };
      })
    : Object.values(wsScrapers);

  // Initial REST fetch
  const fetchList = useCallback(async () => {
    try {
      const data = await adminApiGet<{ scrapers: ScraperInfo[] }>(ADMIN.SCRAPERS_LIST);
      setRestScrapers(data.scrapers);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Polling fallback when WS disconnected
  useEffect(() => {
    if (!connected) {
      pollingRef.current = setInterval(fetchList, 10000);
    } else {
      clearInterval(pollingRef.current);
    }
    return () => clearInterval(pollingRef.current);
  }, [connected, fetchList]);

  // Merge WS logs with local
  const displayedLogs = [...localLogs, ...wsLogs];

  // Actions
  const handleAction = async (name: string, action: string) => {
    const key = `${name}:${action}`;
    setLoadingAction(key);
    try {
      const endpoint = action === "start" ? ADMIN.SCRAPER_START(name)
        : action === "stop" ? ADMIN.SCRAPER_STOP(name)
        : action === "pause" ? ADMIN.SCRAPER_PAUSE(name)
        : ADMIN.SCRAPER_RESUME(name);
      await adminApiFetch(endpoint, { method: "POST" });
      toast({ title: "Commande envoyée" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setTimeout(() => setLoadingAction(null), 5000);
  };

  // Log selection
  const selectLogScraper = useCallback(async (name: string) => {
    unwatchLogs();
    setSelectedLogScraper(name);
    setLocalLogs([]);
    // Fetch existing logs
    try {
      const data = await adminApiGet<{ lines: string[] }>(ADMIN.SCRAPER_LOGS(name));
      setLocalLogs(data.lines);
    } catch { /* silent */ }
    watchLogs(name);
  }, [watchLogs, unwatchLogs]);

  const handleLogsClick = useCallback((name: string) => {
    selectLogScraper(name);
    setTimeout(() => logsPanelRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [selectLogScraper]);

  // Cleanup
  useEffect(() => () => unwatchLogs(), [unwatchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scrapers & Automatisation</h2>
          <p className="text-sm text-muted-foreground">Gérez vos scrapers en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Wifi className="h-3 w-3" /> Connecté
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 bg-destructive/10 text-destructive border-destructive/20">
              <WifiOff className="h-3 w-3" /> Déconnecté
            </Badge>
          )}
        </div>
      </div>

      {/* Scraper cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scraperList.map((s) => (
          <ScraperCard
            key={s.name}
            scraper={s}
            onAction={handleAction}
            onConfig={setConfigScraper}
            onLogs={handleLogsClick}
            loadingAction={loadingAction}
          />
        ))}
        {scraperList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Chargement des scrapers…
          </div>
        )}
      </div>

      {/* Logs panel */}
      <div ref={logsPanelRef}>
        <ScraperLogsPanel
          scraperNames={scraperList.map((s) => s.name)}
          logs={displayedLogs}
          selectedScraper={selectedLogScraper}
          onSelect={selectLogScraper}
          onClear={() => { setLocalLogs([]); }}
        />
      </div>

      {/* Config modal */}
      <ScraperConfigModal scraper={configScraper} open={!!configScraper} onClose={() => setConfigScraper(null)} />
    </div>
  );
}
