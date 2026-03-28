import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListItem } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";
import type { InventoryItem } from "@/types/inventory";

const PLATFORMS = [
  ...MARKETPLACE_PLATFORMS,
  { value: "hardware_fr" as const, label: "Hardware.fr" },
  { value: "other" as const, label: "Autre" },
];

interface ListItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export default function ListItemModal({ open, onOpenChange, item }: ListItemModalProps) {
  const { toast } = useToast();
  const mutation = useListItem();
  const [platform, setPlatform] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (open) { setPlatform(""); setPrice(""); }
  }, [open]);

  const isValid = platform && parseFloat(price) > 0;

  const handleSubmit = async () => {
    if (!item || !isValid) return;
    try {
      await mutation.mutateAsync({ id: item.id, listed_platform: platform, listed_price: parseFloat(price) });
      toast({ title: "Mis en vente" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mettre en vente — {item?.model_name || item?.custom_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Plateforme *</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Prix affiché *</Label>
            <div className="relative">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!isValid || mutation.isPending}>{mutation.isPending ? "..." : "Mettre en vente"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
