import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch } from "@/lib/api/adminApi";
import { Category, ModelFormData, initialFormData } from "./types";
import { BasicInfoTab } from "./BasicInfoTab";

interface AddModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onModelAdded: (model: any) => void;
}

export function AddModelModal({ open, onOpenChange, categories, onModelAdded }: AddModelModalProps) {
  const [formData, setFormData] = useState<ModelFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFormChange = (field: keyof ModelFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      toast({ title: "Champs requis", description: "Nom et catégorie sont obligatoires", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || null,
        category_id: parseInt(formData.category_id),
        brand: formData.brand.trim() || null,
        family: formData.family.trim() || null,
        aliases: formData.aliases.split(',').map(a => a.trim()).filter(Boolean),
      };

      const newModel = await adminApiFetch<any>('/v1/admin/models', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      onModelAdded(newModel);
      setFormData(initialFormData);
      onOpenChange(false);
      toast({ title: "Modèle ajouté", description: `"${newModel.name}" créé avec succès` });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Impossible d'ajouter le modèle", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Ajouter un modèle</DialogTitle>
          <DialogDescription>Créez un nouveau modèle matériel dans le catalogue</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <BasicInfoTab formData={formData} categories={categories} onChange={handleFormChange} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le modèle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
