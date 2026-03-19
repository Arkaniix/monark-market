import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Pause, PlayCircle, Settings, ScrollText, Wifi, WifiOff, Loader2, Download, BarChart3, AlertTriangle, Activity } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiGet } from "@/lib/api/adminApi";
import { API_BASE_URL, getAccessToken } from "@/lib/api/client";
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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

// ============= Format schedule in French =============
function formatScheduleFr(schedule: string | null | undefined): string {
  if (!schedule) return "—";
  const dayMap: Record<string, string> = {
    Mon: "lundi", Tue: "mardi", Wed: "mercredi",
    Thu: "jeudi", Fri: "vendredi", Sat: "samedi", Sun: "dimanche",
  };
  const timeMatch = schedule.match(/(\*|\d{1,2}):(\d{2}):\d{2}$/);
  const hour = timeMatch?.[1];
  const minute = timeMatch?.[2] || "00";
  const timeStr = hour === "*" ? `toutes les heures à :${minute}` : `${parseInt(hour!)}h${minute !== "00" ? minute : ""}`;

  if (schedule.match(/\*-\*-\*\s+\*:/)) return `Toutes les heures à :${minute}`;
  if (schedule.match(/^\*-\*-\*\s+\d/)) return `Tous les jours à ${timeStr}`;
  const weeklyMatch = schedule.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\*-\*-\*\s+/);
  if (weeklyMatch) return `Tous les ${dayMap[weeklyMatch[1]]}s à ${timeStr}`;
  const biweeklyMatch = schedule.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\*-\*-/);
  if (biweeklyMatch && schedule.includes("..")) return `Un ${dayMap[biweeklyMatch[1]]} sur deux à ${timeStr}`;
  return schedule;
}

// ============= Report types =============
interface ScraperReport {
  report: {
    duration_s: number;
    models_total: number;
    models_processed: number;
    models_skipped: { name: string; reason: string }[];
    models_failed: { name: string; reason: string }[];
    items_found: number;
    items_matched: number;
    items_inserted: number;
    errors_count: number;
    diagnostic_summary?: {
      by_result: Record<string, number>;
      flag_summary: Record<string, number>;
      total_items: number;
      items_with_flags: number;
    };
    flag_summary?: Record<string, number>;
    not_found_details?: {
      name: string;
      category?: string;
      flags: string[];
      sources?: Record<string, { status?: number; results?: number; near_misses?: number }>;
    }[];
    variants_summary?: {
      found_cache: number;
      found_http: number;
      not_found_discontinued: number;
      not_found_brand: number;
      not_found_unknown: number;
      skipped_resume: number;
      error: number;
    };
  };
  started_at: string;
  completed_at: string;
}

// ============= Flag severity config =============
const FLAG_SEVERITY: Record<string, "high" | "medium" | "low"> = {
  RESULTS_NOT_MATCHED: "high",
  RESULTS_NOT_MATCHED_LDLC: "high",
  RESULTS_NOT_MATCHED_MATERIEL: "high",
  MAINSTREAM_NOT_FOUND: "high",
  MATCHING_ERROR: "high",
  FETCH_FAILED: "high",
  ZERO_MATCHED: "medium",
  LOW_MATCH_RATE: "medium",
  NEAR_MISS_LDLC: "medium",
  NEAR_MISS_MATERIEL: "medium",
  NEAR_MISS_AMAZON: "medium",
  SOFT_BLOCK: "medium",
  SEARCH_TERM_TOO_LONG: "medium",
  ZERO_RESULTS: "low",
  HTTP_503_AMAZON: "low",
  ZERO_RESULTS_ALL_SOURCES: "low",
};

const FLAG_SEVERITY_STYLES: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

function getFlagSeverityClass(flag: string): string {
  const severity = FLAG_SEVERITY[flag] ?? (flag.startsWith("NEAR_MISS") ? "medium" : "low");
  return FLAG_SEVERITY_STYLES[severity] ?? FLAG_SEVERITY_STYLES.low;
}

const NOT_FOUND_CATEGORIES = {
  not_found_unknown: { label: "À investiguer", cls: "bg-destructive/20 text-destructive border-destructive/30" },
  not_found_brand: { label: "Marque niche", cls: "bg-muted text-muted-foreground border-border" },
  not_found_discontinued: { label: "Discontinué", cls: "bg-muted text-muted-foreground border-border" },
} as const;

// ============= Download logs helper =============
async function downloadLogs(name: string) {
  const token = getAccessToken();
  const url = `${API_BASE_URL}${ADMIN.SCRAPER_LOGS_DOWNLOAD(name)}`;
  const resp = await fetch(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const blob = await resp.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.log`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============= ScraperCard =============
interface ScraperCardProps {
  scraper: ScraperInfo;
  onAction: (name: string, action: string) => void;
  onConfig: (s: ScraperInfo) => void;
  onLogs: (name: string) => void;
  onReport: (name: string, label: string) => void;
  loadingAction: string | null;
}

function ScraperCard({ scraper: s, onAction, onConfig, onLogs, onReport, loadingAction }: ScraperCardProps) {
  const isActive = s.status === "running" || s.status === "paused";
  const canShowReport = s.status === "completed" || s.status === "error";
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
            <p className="text-muted-foreground">Programmé : <span className="text-foreground">{formatScheduleFr(s.schedule)}</span></p>
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
        {canShowReport && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 ml-auto" onClick={() => onReport(s.name, s.label)}>
            <BarChart3 className="h-3 w-3" /> Rapport
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============= Schedule helpers =============
type Frequency = "hourly" | "daily" | "weekly" | "biweekly";

interface ScheduleState {
  frequency: Frequency;
  day: string;
  hour: number;
  minute: number;
}

const DAY_MAP: Record<string, string> = { Mon: "Lun", Tue: "Mar", Wed: "Mer", Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim" };
const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function toOnCalendar(s: ScheduleState): string {
  const mm = String(s.minute).padStart(2, "0");
  const hh = String(s.hour).padStart(2, "0");
  if (s.frequency === "hourly") return `*-*-* *:${mm}:00`;
  if (s.frequency === "daily") return `*-*-* ${hh}:${mm}:00`;
  if (s.frequency === "weekly") return `${s.day} *-*-* ${hh}:${mm}:00`;
  return `${s.day} *-*-1..7,15..21 ${hh}:${mm}:00`;
}

function parseOnCalendar(raw: string): ScheduleState | null {
  const s = raw.trim();
  let m = s.match(/^\*-\*-\*\s+\*:(\d{2}):00$/);
  if (m) return { frequency: "hourly", day: "", hour: 0, minute: parseInt(m[1]) };
  m = s.match(/^\*-\*-\*\s+(\d{2}):(\d{2}):00$/);
  if (m) return { frequency: "daily", day: "", hour: parseInt(m[1]), minute: parseInt(m[2]) };
  m = s.match(/^(\w{3})\s+\*-\*-1\.\.7,15\.\.21\s+(\d{2}):(\d{2}):00$/);
  if (m) return { frequency: "biweekly", day: m[1], hour: parseInt(m[2]), minute: parseInt(m[3]) };
  m = s.match(/^(\w{3})\s+\*-\*-\*\s+(\d{2}):(\d{2}):00$/);
  if (m) return { frequency: "weekly", day: m[1], hour: parseInt(m[2]), minute: parseInt(m[3]) };
  return null;
}

function scheduleSummary(s: ScheduleState): string {
  const mm = String(s.minute).padStart(2, "0");
  const hh = String(s.hour).padStart(2, "0");
  if (s.frequency === "hourly") return s.minute === 0 ? "Toutes les heures" : `Toutes les heures à :${mm}`;
  if (s.frequency === "daily") return `Tous les jours à ${hh}:${mm}`;
  const dayFr = DAY_MAP[s.day] ?? s.day;
  if (s.frequency === "weekly") return `Tous les ${dayFr.toLowerCase()}s à ${hh}:${mm}`;
  return `Un ${dayFr.toLowerCase()} sur deux à ${hh}:${mm}`;
}

// ============= Config modal =============
function ScraperConfigModal({ scraper, open, onClose }: { scraper: ScraperInfo | null; open: boolean; onClose: () => void }) {
  const [state, setState] = useState<ScheduleState>({ frequency: "daily", day: "Mon", hour: 3, minute: 0 });
  const [fallbackRaw, setFallbackRaw] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!scraper) return;
    const parsed = parseOnCalendar(scraper.schedule);
    if (parsed) { setState(parsed); setFallbackRaw(null); }
    else { setFallbackRaw(scraper.schedule); }
  }, [scraper]);

  const scheduleValue = fallbackRaw ?? toOnCalendar(state);

  const handleSave = async () => {
    if (!scraper) return;
    setSaving(true);
    try {
      await adminApiFetch(ADMIN.SCRAPER_CONFIG(scraper.name), { method: "PATCH", body: JSON.stringify({ schedule: scheduleValue }) });
      toast({ title: "Configuration enregistrée" });
      onClose();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const setField = <K extends keyof ScheduleState>(k: K, v: ScheduleState[K]) => {
    setFallbackRaw(null);
    setState((prev) => ({ ...prev, [k]: v }));
  };

  const showDays = state.frequency === "weekly" || state.frequency === "biweekly";
  const showHour = state.frequency !== "hourly";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuration — {scraper?.label}</DialogTitle>
          <DialogDescription>Programmez la fréquence d'exécution du scraper</DialogDescription>
        </DialogHeader>

        {fallbackRaw != null ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Settings className="h-3.5 w-3.5" />
              <span>Format avancé — édition manuelle</span>
            </div>
            <Input value={fallbackRaw} onChange={(e) => setFallbackRaw(e.target.value)} className="font-mono text-sm" />
            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => { setFallbackRaw(null); setState({ frequency: "daily", day: "Mon", hour: 3, minute: 0 }); }}>
              Passer en mode visuel
            </Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fréquence</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {([["hourly", "Toutes les heures"], ["daily", "Quotidien"], ["weekly", "Hebdomadaire"], ["biweekly", "Bimensuel"]] as const).map(([val, label]) => (
                  <Button key={val} type="button" size="sm" variant={state.frequency === val ? "default" : "outline"} className="h-8 text-xs" onClick={() => setField("frequency", val)}>{label}</Button>
                ))}
              </div>
            </div>
            {showDays && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Jour</Label>
                <div className="flex gap-1">
                  {DAYS_ORDER.map((d) => (
                    <Button key={d} type="button" size="sm" variant={state.day === d ? "default" : "outline"} className="h-8 flex-1 text-xs px-0" onClick={() => setField("day", d)}>{DAY_MAP[d]}</Button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{showHour ? "Heure" : "Minutes"}</Label>
              <div className="flex gap-2">
                {showHour && (
                  <Select value={String(state.hour)} onValueChange={(v) => setField("hour", parseInt(v))}>
                    <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={String(h)} className="text-sm">{String(h).padStart(2, "0")}h</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Select value={String(state.minute)} onValueChange={(v) => setField("minute", parseInt(v))}>
                  <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={String(m)} className="text-sm">{String(m).padStart(2, "0")}min</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md bg-muted/50 border px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{scheduleSummary(state)}</span>
              <span className="block text-[10px] font-mono mt-0.5 text-muted-foreground">{toOnCalendar(state)}</span>
            </div>
          </div>
        )}

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

// ============= Start dialog =============
function StartDialog({
  scraper,
  open,
  onClose,
  onConfirm,
}: {
  scraper: { name: string; label: string } | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, mode: "resume" | "full") => void;
}) {
  const [mode, setMode] = useState<"resume" | "full">("resume");

  useEffect(() => { if (open) setMode("resume"); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lancer {scraper?.label}</DialogTitle>
          <DialogDescription>Choisissez le mode de scraping</DialogDescription>
        </DialogHeader>
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as "resume" | "full")} className="space-y-3 py-2">
          <div
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
            onClick={() => setMode("resume")}
          >
            <RadioGroupItem value="resume" id="resume" className="mt-0.5" />
            <div>
              <Label htmlFor="resume" className="font-medium cursor-pointer">Scraper les manquants</Label>
              <p className="text-xs text-muted-foreground">Ne traite que les modèles pas encore scrapés lors du dernier run.</p>
            </div>
          </div>
          <div
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
            onClick={() => setMode("full")}
          >
            <RadioGroupItem value="full" id="full" className="mt-0.5" />
            <div>
              <Label htmlFor="full" className="font-medium cursor-pointer">Tout scraper</Label>
              <p className="text-xs text-muted-foreground">Rescrape tous les modèles, même ceux déjà traités. Plus long mais plus complet.</p>
            </div>
          </div>
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => scraper && onConfirm(scraper.name, mode)}>
            <Play className="h-3 w-3 mr-1" /> Lancer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Report dialog =============
function ReportDialog({
  scraperName,
  scraperLabel,
  open,
  onClose,
}: {
  scraperName: string | null;
  scraperLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const [report, setReport] = useState<ScraperReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [nfFilter, setNfFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !scraperName) return;
    setLoading(true);
    setReport(null);
    setNfFilter("all");
    adminApiGet<ScraperReport>(ADMIN.SCRAPER_REPORT(scraperName))
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [open, scraperName]);

  const handleDownload = async () => {
    if (!scraperName) return;
    setDownloading(true);
    try {
      await downloadLogs(scraperName);
    } catch (e: any) {
      toast({ title: "Erreur téléchargement", description: e.message, variant: "destructive" });
    } finally { setDownloading(false); }
  };

  const r = report?.report;
  const skippedAndFailed = [...(r?.models_skipped ?? []), ...(r?.models_failed ?? [])];

  // Flag summary — merge top-level and diagnostic_summary
  const flagSummary = useMemo(() => {
    const fs = r?.flag_summary ?? r?.diagnostic_summary?.flag_summary;
    if (!fs || Object.keys(fs).length === 0) return null;
    return Object.entries(fs).sort((a, b) => b[1] - a[1]);
  }, [r]);

  // Not found details with default filter
  const notFoundDetails = r?.not_found_details;
  const hasUnknown = notFoundDetails?.some((d) => d.category === "not_found_unknown");

  const activeNfFilter = useMemo(() => {
    if (nfFilter !== "all") return nfFilter;
    return hasUnknown ? "not_found_unknown" : "all";
  }, [nfFilter, hasUnknown]);

  const filteredNotFound = useMemo(() => {
    if (!notFoundDetails) return [];
    if (activeNfFilter === "all") return notFoundDetails;
    return notFoundDetails.filter((d) => d.category === activeNfFilter);
  }, [notFoundDetails, activeNfFilter]);

  const vs = r?.variants_summary;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Rapport — {scraperLabel}</DialogTitle>
          <DialogDescription>
            {report?.started_at && report?.completed_at
              ? `${new Date(report.started_at).toLocaleDateString("fr-FR")} — ${new Date(report.completed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "Dernier rapport disponible"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !r ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucun rapport disponible pour ce scraper.</div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 pb-2">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Durée</p>
                  <p className="text-sm font-semibold">{formatDuration(r.duration_s)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Modèles</p>
                  <p className="text-sm font-semibold">{r.models_processed}/{r.models_total} <span className="text-muted-foreground font-normal">traités</span></p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Observations</p>
                  <p className="text-sm font-semibold">{r.items_inserted.toLocaleString("fr-FR")} <span className="text-muted-foreground font-normal">insérées</span></p>
                  <p className="text-[11px] text-muted-foreground">{r.items_matched.toLocaleString("fr-FR")} matchées / {r.items_found.toLocaleString("fr-FR")} trouvées</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Erreurs</p>
                  <p className={`text-sm font-semibold ${r.errors_count > 0 ? "text-destructive" : ""}`}>{r.errors_count}</p>
                </div>
              </div>

              {/* Section 1: Flag Summary */}
              {flagSummary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    Flags de diagnostic ({flagSummary.reduce((s, [, c]) => s + c, 0)})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {flagSummary.map(([flag, count]) => (
                      <Badge key={flag} variant="outline" className={`text-[11px] gap-1 ${getFlagSeverityClass(flag)}`}>
                        {flag} <span className="font-bold">{count}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Not Found Details */}
              {notFoundDetails && notFoundDetails.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                    Détails des problèmes ({notFoundDetails.length})
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { key: "all", label: "Tous" },
                      { key: "not_found_unknown", label: "À investiguer" },
                      { key: "not_found_brand", label: "Marque niche" },
                      { key: "not_found_discontinued", label: "Discontinué" },
                    ].map((f) => {
                      const count = f.key === "all" ? notFoundDetails.length : notFoundDetails.filter((d) => d.category === f.key).length;
                      if (count === 0 && f.key !== "all") return null;
                      return (
                        <Button
                          key={f.key}
                          size="sm"
                          variant={activeNfFilter === f.key ? "default" : "outline"}
                          className="h-6 text-[11px] px-2"
                          onClick={() => setNfFilter(f.key)}
                        >
                          {f.label} ({count})
                        </Button>
                      );
                    })}
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <ScrollArea className="max-h-[200px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="h-8 text-[11px]">Modèle</TableHead>
                            <TableHead className="h-8 text-[11px]">Catégorie</TableHead>
                            <TableHead className="h-8 text-[11px]">Flags</TableHead>
                            <TableHead className="h-8 text-[11px]">Sources</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNotFound.map((d, i) => {
                            const catCfg = NOT_FOUND_CATEGORIES[d.category as keyof typeof NOT_FOUND_CATEGORIES];
                            return (
                              <TableRow key={i}>
                                <TableCell className="py-1.5 text-[11px] font-medium max-w-[150px] truncate">{d.name}</TableCell>
                                <TableCell className="py-1.5">
                                  {catCfg ? (
                                    <Badge variant="outline" className={`text-[10px] ${catCfg.cls}`}>{catCfg.label}</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px]">{d.category ?? "—"}</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="py-1.5">
                                  <div className="flex flex-wrap gap-1">
                                    {d.flags.map((f) => (
                                      <Badge key={f} variant="outline" className={`text-[10px] ${getFlagSeverityClass(f)}`}>{f}</Badge>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="py-1.5 text-[10px] text-muted-foreground">
                                  {d.sources ? Object.entries(d.sources).map(([src, info]) => (
                                    <span key={src} className="mr-2">
                                      {src}: {info.status ?? "?"}
                                      {info.results != null && <> ({info.results}→{info.near_misses ?? 0})</>}
                                    </span>
                                  )) : "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Section 3: Variants Summary */}
              {vs && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    Résumé variantes
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {([
                      { key: "found_cache", label: "Cache TopAchat", cls: "text-emerald-400" },
                      { key: "found_http", label: "HTTP (LDLC/Mat.)", cls: "text-emerald-400" },
                      { key: "not_found_brand", label: "Marque niche", cls: "text-muted-foreground" },
                      { key: "not_found_discontinued", label: "Discontinué", cls: "text-muted-foreground" },
                      { key: "not_found_unknown", label: "À investiguer", cls: vs.not_found_unknown > 0 ? "text-destructive" : "text-muted-foreground" },
                      { key: "skipped_resume", label: "Déjà scrapé", cls: "text-muted-foreground" },
                      { key: "error", label: "Erreurs", cls: vs.error > 0 ? "text-destructive" : "text-muted-foreground" },
                    ] as { key: keyof typeof vs; label: string; cls: string }[]).map(({ key, label, cls }) => (
                      <div key={key} className="rounded-lg border bg-muted/30 p-2">
                        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                        <p className={`text-sm font-semibold ${cls}`}>{vs[key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped / failed models */}
              {skippedAndFailed.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                    Modèles non traités ({skippedAndFailed.length})
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 text-xs">Modèle</TableHead>
                          <TableHead className="h-8 text-xs">Raison</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skippedAndFailed.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-1.5 text-xs font-medium">{m.name}</TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground">{m.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="pt-2 border-t">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload} disabled={downloading || !scraperName}>
            {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Télécharger les logs
          </Button>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
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
  onDownload,
}: {
  scraperNames: string[];
  logs: string[];
  selectedScraper: string;
  onSelect: (name: string) => void;
  onClear: () => void;
  onDownload: (name: string) => void;
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
        <div className="flex items-center gap-1">
          {selectedScraper && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => onDownload(selectedScraper)}>
              <Download className="h-3 w-3" /> Télécharger
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>Effacer</Button>
        </div>
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
  const [startDialog, setStartDialog] = useState<{ name: string; label: string } | null>(null);
  const [reportDialog, setReportDialog] = useState<{ name: string; label: string } | null>(null);
  const logsPanelRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const { toast } = useToast();

  // Merge: REST as base, WS overlay for real-time fields only
  const scraperList: ScraperInfo[] = restScrapers.length > 0
    ? restScrapers.map((rest) => {
        const ws = wsScrapers[rest.name];
        if (!ws) return rest;
        return { ...rest, ...ws, label: rest.label, description: rest.description, schedule: rest.schedule, timer: rest.timer };
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
    if (!connected) { pollingRef.current = setInterval(fetchList, 10000); }
    else { clearInterval(pollingRef.current); }
    return () => clearInterval(pollingRef.current);
  }, [connected, fetchList]);

  // Merge WS logs with local
  const displayedLogs = [...localLogs, ...wsLogs];

  // Actions — intercept "start" to show dialog
  const handleAction = async (name: string, action: string) => {
    if (action === "start") {
      const label = scraperList.find(s => s.name === name)?.label || name;
      setStartDialog({ name, label });
      return;
    }
    await executeAction(name, action);
  };

  const executeAction = async (name: string, action: string, body?: object) => {
    const key = `${name}:${action}`;
    setLoadingAction(key);
    try {
      const endpoint = action === "start" ? ADMIN.SCRAPER_START(name)
        : action === "stop" ? ADMIN.SCRAPER_STOP(name)
        : action === "pause" ? ADMIN.SCRAPER_PAUSE(name)
        : ADMIN.SCRAPER_RESUME(name);
      await adminApiFetch(endpoint, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) });
      toast({ title: "Commande envoyée", description: `${action} → ${name}` });

      const expectedStatus = action === "start" ? "running"
        : action === "stop" ? "idle"
        : action === "pause" ? "paused"
        : "running";

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const data = await adminApiGet<{ scrapers: ScraperInfo[] }>(ADMIN.SCRAPERS_LIST);
          setRestScrapers(data.scrapers);
          const target = data.scrapers.find(s => s.name === name);
          if (target?.status === expectedStatus || attempts >= 10) {
            clearInterval(pollInterval);
            setLoadingAction(null);
            if (target?.status === expectedStatus) {
              toast({ title: "Statut mis à jour", description: `${name} → ${target.status}` });
            }
          }
        } catch { /* silent */ }
      }, 3000);
      setTimeout(() => { clearInterval(pollInterval); setLoadingAction(null); }, 30000);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
      setLoadingAction(null);
    }
  };

  const handleConfirmStart = (name: string, mode: "resume" | "full") => {
    setStartDialog(null);
    executeAction(name, "start", { mode });
  };

  const handleOpenReport = (name: string, label: string) => {
    setReportDialog({ name, label });
  };

  const handleDownloadLogs = async (name: string) => {
    try {
      await downloadLogs(name);
      toast({ title: "Téléchargement lancé" });
    } catch (e: any) {
      toast({ title: "Erreur téléchargement", description: e.message, variant: "destructive" });
    }
  };

  // Log selection
  const selectLogScraper = useCallback(async (name: string) => {
    unwatchLogs();
    setSelectedLogScraper(name);
    setLocalLogs([]);
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
            onReport={handleOpenReport}
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
          onDownload={handleDownloadLogs}
        />
      </div>

      {/* Config modal */}
      <ScraperConfigModal scraper={configScraper} open={!!configScraper} onClose={() => setConfigScraper(null)} />

      {/* Start dialog */}
      <StartDialog scraper={startDialog} open={!!startDialog} onClose={() => setStartDialog(null)} onConfirm={handleConfirmStart} />

      {/* Report dialog */}
      <ReportDialog scraperName={reportDialog?.name ?? null} scraperLabel={reportDialog?.label ?? ""} open={!!reportDialog} onClose={() => setReportDialog(null)} />
    </div>
  );
}
