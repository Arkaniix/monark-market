import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useModelSearch, useCreateItem, useUpdateItem, useListItem, type ModelAutocompleteResult } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";
import type { InventoryItem, InventoryCategory, CreateInventoryPayload, UpdateInventoryPayload } from "@/types/inventory";

const CATEGORIES: { value: InventoryCategory; label: string }[] = [
  { value: "gpu", label: "GPU" },
  { value: "cpu", label: "CPU" },
  { value: "ram", label: "RAM" },
  { value: "ssd", label: "SSD" },
  { value: "other", label: "Autre" },
];

const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "used", label: "Occasion" },
  { value: "for_parts", label: "Pour pièces" },
];

const PLATFORMS = [
  ...MARKETPLACE_PLATFORMS,
  { value: "hardware_fr" as const, label: "Hardware.fr" },
  { value: "other" as const, label: "Autre" },
];

interface AddEditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem | null;
}

export default function AddEditItemModal({ open, onOpenChange, editItem }: AddEditItemModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const listMutation = useListItem();

  const isEdit = !!editItem;

  // Form state
  const [useCustom, setUseCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<{ id: number; name: string } | null>(null);
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("gpu");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyPlatform, setBuyPlatform] = useState("");
  const [buyDate, setBuyDate] = useState<Date>(new Date());
  const [buyCondition, setBuyCondition] = useState("");
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");

  // For listed items edit
  const [listedPrice, setListedPrice] = useState("");
  const [listedPlatform, setListedPlatform] = useState("");

  const { data: searchResults } = useModelSearch(searchQuery);

  // Reset on open / populate on edit
  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setUseCustom(!editItem.model_id);
      setSelectedModel(editItem.model_id ? { id: editItem.model_id, name: editItem.model_name || "" } : null);
      setCustomName(editItem.custom_name || "");
      setCategory(editItem.category || "gpu");
      setBuyPrice(String(editItem.buy_price));
      setBuyPlatform(editItem.buy_platform || "");
      setBuyDate(new Date(editItem.buy_date));
      setBuyCondition(editItem.buy_condition || "");
      setFees(editItem.fees_eur ? String(editItem.fees_eur) : "");
      setNotes(editItem.notes || "");
      setListedPrice(editItem.listed_price ? String(editItem.listed_price) : "");
      setListedPlatform(editItem.listed_platform || "");
    } else {
      setUseCustom(false);
      setSearchQuery("");
      setSelectedModel(null);
      setCustomName("");
      setCategory("gpu");
      setBuyPrice("");
      setBuyPlatform("");
      setBuyDate(new Date());
      setBuyCondition("");
      setFees("");
      setNotes("");
      setListedPrice("");
      setListedPlatform("");
    }
  }, [open, editItem]);

  const isValid = useMemo(() => {
    const hasComponent = useCustom ? customName.trim().length > 0 : !!selectedModel;
    const hasPrice = parseFloat(buyPrice) > 0;
    return hasComponent && hasPrice;
  }, [useCustom, customName, selectedModel, buyPrice]);

  const isPending = createMutation.isPending || updateMutation.isPending || listMutation.isPending;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      if (isEdit && editItem) {
        const payload: UpdateInventoryPayload & { id: number } = {
          id: editItem.id,
          buy_price: parseFloat(buyPrice),
          buy_platform: buyPlatform || undefined,
          buy_date: format(buyDate, "yyyy-MM-dd"),
          buy_condition: buyCondition || undefined,
          fees_eur: fees ? parseFloat(fees) : undefined,
          notes: notes || undefined,
        };
        if (useCustom) {
          payload.custom_name = customName;
          payload.category = category;
        } else if (selectedModel) {
          payload.model_id = selectedModel.id;
        }
        await updateMutation.mutateAsync(payload);

        // If listed item and price/platform changed
        if (editItem.status === "listed" && (listedPrice || listedPlatform)) {
          const lp = parseFloat(listedPrice);
          const plat = listedPlatform;
          if (lp > 0 && plat) {
            await listMutation.mutateAsync({ id: editItem.id, listed_price: lp, listed_platform: plat });
          }
        }

        toast({ title: "Composant modifié" });
      } else {
        const payload: CreateInventoryPayload = {
          buy_price: parseFloat(buyPrice),
          buy_platform: buyPlatform || undefined,
          buy_date: format(buyDate, "yyyy-MM-dd"),
          buy_condition: buyCondition || undefined,
          fees_eur: fees ? parseFloat(fees) : undefined,
          notes: notes || undefined,
        };
        if (useCustom) {
          payload.custom_name = customName;
          payload.category = category;
        } else if (selectedModel) {
          payload.model_id = selectedModel.id;
        }
        await createMutation.mutateAsync(payload);
        toast({ title: "Composant ajouté au stock" });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Échec de l'opération", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le composant" : "Ajouter un composant"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Component selection */}
          {!useCustom ? (
            <div className="space-y-2">
              <Label>Composant (catalogue)</Label>
              {selectedModel ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 rounded-md border bg-muted text-sm font-medium">{selectedModel.name}</div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedModel(null); setSearchQuery(""); }}>Changer</Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un modèle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((m) => (
                        <button
                          key={m.id}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => { setSelectedModel({ id: m.id, name: m.name }); setSearchQuery(""); }}
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{m.brand}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button className="text-xs text-primary hover:underline" onClick={() => setUseCustom(true)}>Pas dans le catalogue ?</button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Nom du composant</Label>
              <Input placeholder="Ex: RTX 3060 EVGA XC" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as InventoryCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <button className="text-xs text-primary hover:underline" onClick={() => setUseCustom(false)}>Chercher dans le catalogue</button>
            </div>
          )}

          {/* Buy price */}
          <div className="space-y-1">
            <Label>Prix d'achat *</Label>
            <div className="relative">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <Label>Plateforme d'achat</Label>
            <Select value={buyPlatform} onValueChange={setBuyPlatform}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Date d'achat</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !buyDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {buyDate ? format(buyDate, "dd/MM/yyyy") : "Choisir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={buyDate} onSelect={(d) => d && setBuyDate(d)} className="p-3 pointer-events-auto" locale={fr} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Condition */}
          <div className="space-y-1">
            <Label>État</Label>
            <Select value={buyCondition} onValueChange={setBuyCondition}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Fees */}
          <div className="space-y-1">
            <Label>Frais (port, commission...)</Label>
            <div className="relative">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={fees} onChange={(e) => setFees(e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>

          {/* Listed fields (edit only) */}
          {isEdit && editItem?.status === "listed" && (
            <>
              <div className="border-t pt-3 space-y-1">
                <Label>Prix affiché (en vente)</Label>
                <div className="relative">
                  <Input type="number" min="0" step="0.01" value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Plateforme de vente</Label>
                <Select value={listedPlatform} onValueChange={setListedPlatform}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea placeholder="Notes libres..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? "..." : isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
