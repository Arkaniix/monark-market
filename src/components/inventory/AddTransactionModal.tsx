import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";
import type { Transaction, TransactionType, TransactionCategory, CreateTransactionPayload } from "@/types/inventory";
import { TRANSACTION_CATEGORY_OPTIONS } from "@/types/inventory";

const PLATFORMS = [
  ...MARKETPLACE_PLATFORMS,
  { value: "hardware_fr" as const, label: "Hardware.fr" },
  { value: "other" as const, label: "Autre" },
];

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
}

export default function AddTransactionModal({ open, onOpenChange, editTransaction }: AddTransactionModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isEdit = !!editTransaction;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "none">("none");
  const [platform, setPlatform] = useState<string>("none");
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setDescription(editTransaction.description);
      setCategory(editTransaction.category || "none");
      setPlatform(editTransaction.platform || "none");
      setTransactionDate(new Date(editTransaction.transaction_date));
      setNotes(editTransaction.notes || "");
    } else {
      setType("expense");
      setAmount("");
      setDescription("");
      setCategory("none");
      setPlatform("none");
      setTransactionDate(new Date());
      setNotes("");
    }
  }, [open, editTransaction]);

  const isValid = useMemo(() => {
    return parseFloat(amount) > 0 && description.trim().length > 0;
  }, [amount, description]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      const payload: CreateTransactionPayload = {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        category: category !== "none" ? category as TransactionCategory : undefined,
        platform: platform !== "none" ? platform : null,
        transaction_date: format(transactionDate, "yyyy-MM-dd"),
        notes: notes.trim() || null,
      };

      if (isEdit && editTransaction) {
        await updateMutation.mutateAsync({ id: editTransaction.id, ...payload });
        toast({ title: "Transaction modifiée" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Transaction ajoutée" });
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
          <DialogTitle>{isEdit ? "Modifier la transaction" : "Ajouter une transaction"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type toggle */}
          <div className="space-y-1">
            <Label>Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className={cn(
                  "w-full",
                  type === "expense"
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                    : "border-border hover:border-red-300"
                )}
                onClick={() => setType("expense")}
              >
                Dépense
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={cn(
                  "w-full",
                  type === "income"
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "border-border hover:border-green-300"
                )}
                onClick={() => setType("income")}
              >
                Gain
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label>Montant *</Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description *</Label>
            <Input
              placeholder="Lot 50 enveloppes matelassées"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/300</p>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TransactionCategory | "none")}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {TRANSACTION_CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <Label>Plateforme</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(transactionDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={(d) => d && setTransactionDate(d)}
                  className="p-3 pointer-events-auto"
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

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
