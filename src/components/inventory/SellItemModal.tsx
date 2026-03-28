import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSellItem } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";
import type { InventoryItem } from "@/types/inventory";

const PLATFORMS = [
  ...MARKETPLACE_PLATFORMS,
  { value: "hardware_fr" as const, label: "Hardware.fr" },
  { value: "other" as const, label: "Autre" },
];

const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "used", label: "Occasion" },
  { value: "for_parts", label: "Pour pièces" },
];

interface SellItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export default function SellItemModal({ open, onOpenChange, item }: SellItemModalProps) {
  const { toast } = useToast();
  const mutation = useSellItem();

  const [sellPrice, setSellPrice] = useState("");
  const [sellPlatform, setSellPlatform] = useState("");
  const [sellDate, setSellDate] = useState<Date>(new Date());
  const [sellCondition, setSellCondition] = useState("");
  const [fees, setFees] = useState("");

  useEffect(() => {
    if (open && item) {
      setSellPrice("");
      setSellPlatform(item.listed_platform || "");
      setSellDate(new Date());
      setSellCondition("");
      setFees("");
    }
  }, [open, item]);

  const sp = parseFloat(sellPrice) || 0;
  const f = parseFloat(fees) || 0;
  const bp = item?.buy_price ?? 0;
  const profitGross = sp - bp;
  const profitNet = sp - bp - f;
  const marginPct = bp > 0 ? (profitNet / bp) * 100 : 0;

  const isValid = sp > 0 && sellPlatform;

  const handleSubmit = async () => {
    if (!item || !isValid) return;
    try {
      await mutation.mutateAsync({
        id: item.id,
        sell_price: sp,
        sell_platform: sellPlatform,
        sell_date: format(sellDate, "yyyy-MM-dd"),
        sell_condition: sellCondition || undefined,
        fees_eur: f > 0 ? f : undefined,
      });
      toast({ title: "Marqué comme vendu" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marquer vendu — {item?.model_name || item?.custom_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Prix de vente *</Label>
            <div className="relative">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Plateforme de vente *</Label>
            <Select value={sellPlatform} onValueChange={setSellPlatform}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Date de vente</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(sellDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={sellDate} onSelect={(d) => d && setSellDate(d)} className="p-3 pointer-events-auto" locale={fr} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label>État à la vente</Label>
            <Select value={sellCondition} onValueChange={setSellCondition}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Frais plateforme (commission, port...)</Label>
            <div className="relative">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={fees} onChange={(e) => setFees(e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>

          {/* Live preview */}
          {sp > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Profit brut</span><span>{profitGross.toFixed(2)} €</span></div>
              {f > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Frais</span><span>-{f.toFixed(2)} €</span></div>}
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Profit net</span>
                <span className={profitNet >= 0 ? "text-green-600" : "text-red-500"}>{profitNet >= 0 ? "+" : ""}{profitNet.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Marge</span>
                <span className={marginPct >= 0 ? "text-green-600" : "text-red-500"}>{marginPct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!isValid || mutation.isPending}>{mutation.isPending ? "..." : "Marquer vendu"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
