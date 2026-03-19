import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Edit, ExternalLink, Loader2, Activity, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet, adminApiFetch } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import type { ModelVariantsResponse, VariantDetail } from "@/types/admin";

// ---- Tier badge colors ----

export const TIER_COLORS: Record<string, string> = {
  premium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  mid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  entry: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  reference: "bg-white/10 text-white border-white/20",
};

export function tierBadge(tier: string | null) {
  if (!tier) return <Badge variant="outline" className="text-[10px]">—</Badge>;
  const cls = TIER_COLORS[tier.toLowerCase()] || "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`text-[10px] capitalize ${cls}`}>{tier}</Badge>;
}

// ---- Diagnostic types & helpers ----

export interface VariantDiagnostic {
  flags: string[];
  category?: string;
  sources?: Record<string, { status?: number; results?: number; near_misses?: number }>;
}

const FLAG_SEVERITY: Record<string, "high" | "medium" | "low"> = {
  RESULTS_NOT_MATCHED: "high", RESULTS_NOT_MATCHED_LDLC: "high", RESULTS_NOT_MATCHED_MATERIEL: "high",
  MAINSTREAM_NOT_FOUND: "high", MATCHING_ERROR: "high", FETCH_FAILED: "high",
  ZERO_MATCHED: "medium", LOW_MATCH_RATE: "medium", SOFT_BLOCK: "medium", SEARCH_TERM_TOO_LONG: "medium",
  NEAR_MISS_LDLC: "medium", NEAR_MISS_MATERIEL: "medium", NEAR_MISS_AMAZON: "medium",
  ZERO_RESULTS: "low", HTTP_503_AMAZON: "low", ZERO_RESULTS_ALL_SOURCES: "low",
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

const NOT_FOUND_CATEGORIES: Record<string, { label: string; cls: string }> = {
  not_found_unknown: { label: "À investiguer", cls: "bg-destructive/20 text-destructive border-destructive/30" },
  not_found_brand: { label: "Marque niche", cls: "bg-muted text-muted-foreground border-border" },
  not_found_discontinued: { label: "Discontinué", cls: "bg-muted text-muted-foreground border-border" },
};

// ---- Variant Detail Sheet ----

function VariantDetailSheet({
  variant,
  open,
  onClose,
  diagnostic,
}: {
  variant: VariantDetail | null;
  open: boolean;
  onClose: () => void;
  diagnostic?: VariantDiagnostic | null;
}) {
  if (!variant) return null;
  const v = variant;
  const fmtPrice = (val: number | null) => val == null ? "—" : `${Math.round(val).toLocaleString("fr-FR")} €`;

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            {v.brand} {v.variant_name}
            {v.tier && tierBadge(v.tier)}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-0">
            <InfoRow label="Marque" value={v.brand} />
            <Separator />
            <InfoRow label="Tier" value={v.tier ? <span className="capitalize">{v.tier}</span> : "—"} />
            <Separator />
            <InfoRow label="Delta prix" value={
              v.price_delta_pct != null ? (
                <span className={v.price_delta_pct > 0 ? "text-emerald-400" : v.price_delta_pct < 0 ? "text-destructive" : ""}>
                  {v.price_delta_pct > 0 ? "+" : ""}{v.price_delta_pct.toFixed(1)}%
                </span>
              ) : "—"
            } />
            <Separator />
            <InfoRow label="Prix neuf" value={
              v.new_price_eur != null ? (
                <span>{fmtPrice(v.new_price_eur)} {v.new_price_source && <span className="text-xs text-muted-foreground">({v.new_price_source})</span>}</span>
              ) : "—"
            } />
            <Separator />
            <InfoRow label="MAJ prix neuf" value={v.new_price_updated_at ? new Date(v.new_price_updated_at).toLocaleDateString("fr-FR") : "—"} />
            <Separator />
            <InfoRow label="Prix médian occasion" value={fmtPrice(v.median_price)} />
            <Separator />
            <InfoRow label="Min – Max" value={v.min_price != null && v.max_price != null ? `${Math.round(v.min_price)} – ${Math.round(v.max_price)} €` : "—"} />
            <Separator />
            <InfoRow label="Observations" value={v.observations_count} />
            <Separator />
            <InfoRow label="Signaux" value={v.signals_count} />
            <Separator />
            <InfoRow label="Boost Clock" value={v.boost_clock_mhz ? `${v.boost_clock_mhz} MHz` : "—"} />
            <Separator />
            <InfoRow label="Core Clock" value={v.core_clock_mhz ? `${v.core_clock_mhz} MHz` : "—"} />
            <Separator />
            <InfoRow label="Mémoire" value={v.memory_gb ? `${v.memory_gb} GB` : "—"} />
            <Separator />
            <InfoRow label="Longueur" value={v.length_mm ? `${v.length_mm} mm` : "—"} />
            <Separator />
            <InfoRow label="Couleur" value={v.color || "—"} />
            <Separator />
            <InfoRow label="Prix USD" value={v.price_usd != null ? `$${v.price_usd}` : "—"} />
          </div>

          {/* Diagnostic flags */}
          {diagnostic && diagnostic.flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-muted-foreground" /> Diagnostic scraper
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {diagnostic.flags.map((f) => (
                  <Badge key={f} variant="outline" className={`text-[10px] ${getFlagSeverityClass(f)}`}>{f}</Badge>
                ))}
              </div>
              {diagnostic.category && (
                <p className="text-xs text-muted-foreground">
                  Catégorie : <span className="font-medium text-foreground">
                    {NOT_FOUND_CATEGORIES[diagnostic.category]?.label ?? diagnostic.category}
                  </span>
                </p>
              )}
              {diagnostic.sources && Object.keys(diagnostic.sources).length > 0 && (
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  {Object.entries(diagnostic.sources).map(([src, info]) => (
                    <p key={src}>
                      <span className="font-medium text-foreground">{src}</span>: status {info.status ?? "?"}{info.results != null && <>, {info.results} résultats → {info.near_misses ?? 0} proches</>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---- Variant Edit Modal ----

function VariantEditModal({
  variant,
  open,
  onOpenChange,
  onSaved,
}: {
  variant: VariantDetail;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tier: variant.tier || "",
    price_delta_pct: variant.price_delta_pct?.toString() || "",
    brand: variant.brand || "",
    variant_name: variant.variant_name || "",
    boost_clock_mhz: variant.boost_clock_mhz?.toString() || "",
    core_clock_mhz: variant.core_clock_mhz?.toString() || "",
    memory_gb: variant.memory_gb?.toString() || "",
    length_mm: variant.length_mm?.toString() || "",
    color: variant.color || "",
    new_price_eur: variant.new_price_eur?.toString() || "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        tier: variant.tier || "",
        price_delta_pct: variant.price_delta_pct?.toString() || "",
        brand: variant.brand || "",
        variant_name: variant.variant_name || "",
        boost_clock_mhz: variant.boost_clock_mhz?.toString() || "",
        core_clock_mhz: variant.core_clock_mhz?.toString() || "",
        memory_gb: variant.memory_gb?.toString() || "",
        length_mm: variant.length_mm?.toString() || "",
        color: variant.color || "",
        new_price_eur: variant.new_price_eur?.toString() || "",
      });
    }
  }, [open, variant]);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.tier !== (variant.tier || "")) body.tier = form.tier || null;
      if (form.brand !== (variant.brand || "")) body.brand = form.brand;
      if (form.variant_name !== (variant.variant_name || "")) body.variant_name = form.variant_name;
      if (form.color !== (variant.color || "")) body.color = form.color || null;

      const numFields = [
        ["price_delta_pct", variant.price_delta_pct],
        ["boost_clock_mhz", variant.boost_clock_mhz],
        ["core_clock_mhz", variant.core_clock_mhz],
        ["memory_gb", variant.memory_gb],
        ["length_mm", variant.length_mm],
        ["new_price_eur", variant.new_price_eur],
      ] as const;

      for (const [key, original] of numFields) {
        const val = form[key as keyof typeof form];
        const parsed = val ? parseFloat(val) : null;
        if (parsed !== original) body[key] = parsed;
      }

      if (Object.keys(body).length === 0) {
        onOpenChange(false);
        return;
      }

      await adminApiFetch(ADMIN.VARIANT_UPDATE(variant.id), {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast({ title: "Variante mise à jour" });
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier — {variant.variant_name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Marque</Label>
            <Input value={form.brand} onChange={e => set("brand", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Nom variante</Label>
            <Input value={form.variant_name} onChange={e => set("variant_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select value={form.tier} onValueChange={v => set("tier", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Delta prix (%)</Label>
            <Input type="number" value={form.price_delta_pct} onChange={e => set("price_delta_pct", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Boost clock (MHz)</Label>
            <Input type="number" value={form.boost_clock_mhz} onChange={e => set("boost_clock_mhz", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Core clock (MHz)</Label>
            <Input type="number" value={form.core_clock_mhz} onChange={e => set("core_clock_mhz", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Mémoire (GB)</Label>
            <Input type="number" value={form.memory_gb} onChange={e => set("memory_gb", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Longueur (mm)</Label>
            <Input type="number" value={form.length_mm} onChange={e => set("length_mm", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Couleur</Label>
            <Input value={form.color} onChange={e => set("color", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix neuf EUR</Label>
            <Input type="number" value={form.new_price_eur} onChange={e => set("new_price_eur", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Panel ----

interface VariantsPanelProps {
  modelId: number;
  modelName: string;
  colSpan?: number;
  diagnosticsByName?: Map<string, VariantDiagnostic>;
}

export function VariantsPanel({ modelId, modelName, colSpan = 10, diagnosticsByName }: VariantsPanelProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<ModelVariantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<VariantDetail | null>(null);
  const [detailVariant, setDetailVariant] = useState<VariantDetail | null>(null);

  const getVariantDiag = (v: VariantDetail): VariantDiagnostic | null => {
    if (!diagnosticsByName) return null;
    return diagnosticsByName.get(v.variant_name.toLowerCase()) ?? null;
  };

  const fetchVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<ModelVariantsResponse>(ADMIN.MODEL_VARIANTS(modelId));
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApiGet<ModelVariantsResponse>(ADMIN.MODEL_VARIANTS(modelId));
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [modelId]);

  const formatPrice = (v: number | null) => v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`;

  if (loading) return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-muted/30 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </TableCell>
    </TableRow>
  );

  if (error) return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-muted/30 p-4 text-destructive text-sm">
        <AlertCircle className="h-4 w-4 inline mr-2" />{error}
      </TableCell>
    </TableRow>
  );

  if (!data || data.variants.length === 0) return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-muted/30 p-4 text-center text-muted-foreground text-sm">
        Aucune variante trouvée pour {modelName}
      </TableCell>
    </TableRow>
  );

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="!p-0 border-0">
        <div className="bg-muted/20 border-y border-border/50 px-6 py-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-sm font-semibold">Variantes de {modelName}</h4>
            <Badge variant="outline" className="text-xs">{data.total_variants} variantes</Badge>
            {Object.entries(data.tier_summary).map(([tier, count]) => (
              <Badge key={tier} variant="outline" className={`text-[10px] capitalize ${TIER_COLORS[tier.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                {tier}: {count}
              </Badge>
            ))}
          </div>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-xs">
                  <th className="text-left px-3 py-2 font-medium">Marque</th>
                  <th className="text-left px-3 py-2 font-medium">Variante</th>
                  <th className="text-left px-3 py-2 font-medium">Tier</th>
                  <th className="text-right px-3 py-2 font-medium">Delta prix</th>
                  <th className="text-right px-3 py-2 font-medium">Prix neuf</th>
                  <th className="text-right px-3 py-2 font-medium">Médiane</th>
                  <th className="text-left px-3 py-2 font-medium">Specs</th>
                  <th className="text-right px-3 py-2 font-medium">Obs.</th>
                  <th className="text-right px-3 py-2 font-medium">Signaux</th>
                  <th className="text-center px-3 py-2 font-medium w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TooltipProvider>
                  {data.variants.map((v) => (
                    <tr key={v.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 text-sm">{v.brand}</td>
                      <td className="px-3 py-2 font-medium text-sm">
                        <span
                          className="cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => navigate(`/variants/${v.id}`)}
                        >
                          {v.variant_name}
                        </span>
                      </td>
                      <td className="px-3 py-2">{tierBadge(v.tier)}</td>
                      <td className="px-3 py-2 text-right">
                        {v.price_delta_pct != null ? (
                          <span className={v.price_delta_pct > 0 ? "text-emerald-400" : v.price_delta_pct < 0 ? "text-destructive" : "text-muted-foreground"}>
                            {v.price_delta_pct > 0 ? "+" : ""}{v.price_delta_pct.toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {v.new_price_eur != null ? (
                          v.new_price_source ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{formatPrice(v.new_price_eur)}</span>
                              </TooltipTrigger>
                              <TooltipContent>{v.new_price_source}</TooltipContent>
                            </Tooltip>
                          ) : formatPrice(v.new_price_eur)
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {v.median_price != null ? (
                          <div>
                            <span>{formatPrice(v.median_price)}</span>
                            {(v.min_price != null && v.max_price != null) && (
                              <p className="text-[10px] text-muted-foreground">
                                {Math.round(v.min_price)} – {Math.round(v.max_price)} €
                              </p>
                            )}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {[
                          v.boost_clock_mhz ? `${v.boost_clock_mhz} MHz` : null,
                          v.length_mm ? `${v.length_mm} mm` : null,
                        ].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-sm">{v.observations_count}</td>
                      <td className="px-3 py-2 text-right text-sm">{v.signals_count}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingVariant(v)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(`/variants/${v.id}`)}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TooltipProvider>
              </tbody>
            </table>
          </div>
        </div>

        {editingVariant && (
          <VariantEditModal
            variant={editingVariant}
            open={!!editingVariant}
            onOpenChange={(v) => { if (!v) setEditingVariant(null); }}
            onSaved={fetchVariants}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
