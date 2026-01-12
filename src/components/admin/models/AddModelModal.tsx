import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Info, Cpu, Settings, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category, ModelFormData, initialFormData } from "./types";
import { BasicInfoTab } from "./BasicInfoTab";
import { SpecsTab } from "./SpecsTab";
import { AdvancedSpecsTab } from "./AdvancedSpecsTab";
import { ImageUploadTab } from "./ImageUploadTab";

interface AddModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onModelAdded: (model: any) => void;
}

export function AddModelModal({ open, onOpenChange, categories, onModelAdded }: AddModelModalProps) {
  const [formData, setFormData] = useState<ModelFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const handleFormChange = (field: keyof ModelFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null, preview: string | null) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const uploadImage = async (modelId: number): Promise<string | null> => {
    if (!imageFile && !imagePreview) return null;
    
    // If it's a URL (not a file), just return the URL
    if (!imageFile && imagePreview) {
      return imagePreview;
    }

    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${modelId}-${Date.now()}.${fileExt}`;
    const filePath = `models/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('model-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('model-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.brand.trim() || !formData.category_id) {
      toast({ 
        title: "Champs requis", 
        description: "Nom, marque et catégorie sont obligatoires", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const aliasesArray = formData.aliases
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      // 1. Create the model
      const { data: modelData, error: modelError } = await supabase
        .from('hardware_models')
        .insert({
          name: formData.name.trim(),
          brand: formData.brand.trim(),
          manufacturer: formData.manufacturer.trim() || null,
          family: formData.family.trim() || null,
          category_id: parseInt(formData.category_id),
          aliases: aliasesArray.length > 0 ? aliasesArray : null,
        })
        .select('*, hardware_categories(name)')
        .single();

      if (modelError) throw modelError;

      // 2. Upload image and update model
      let imageUrl: string | null = null;
      try {
        imageUrl = await uploadImage(modelData.id);
        if (imageUrl) {
          await supabase
            .from('hardware_models')
            .update({ image_url: imageUrl })
            .eq('id', modelData.id);
        }
      } catch (imgError) {
        console.error('Image upload failed:', imgError);
        // Continue without image
      }

      // 3. Create specs if any spec field is filled
      const hasSpecs = formData.chip || formData.vram_gb || formData.memory_type || 
                       formData.bus_width_bit || formData.tdp_w || formData.release_date;
      
      if (hasSpecs) {
        const specsJson: Record<string, any> = {};
        
        if (formData.base_clock_mhz) specsJson.base_clock_mhz = parseInt(formData.base_clock_mhz);
        if (formData.boost_clock_mhz) specsJson.boost_clock_mhz = parseInt(formData.boost_clock_mhz);
        if (formData.memory_bandwidth_gbps) specsJson.memory_bandwidth_gbps = parseInt(formData.memory_bandwidth_gbps);
        if (formData.cuda_cores) specsJson.cuda_cores = parseInt(formData.cuda_cores);
        if (formData.stream_processors) specsJson.stream_processors = parseInt(formData.stream_processors);
        if (formData.ray_tracing) specsJson.ray_tracing = formData.ray_tracing;
        if (formData.dlss_fsr) specsJson.dlss_fsr = formData.dlss_fsr;
        if (formData.pcie_version) specsJson.pcie_version = formData.pcie_version;
        if (formData.power_connector) specsJson.power_connector = formData.power_connector;
        if (formData.recommended_psu_w) specsJson.recommended_psu_w = parseInt(formData.recommended_psu_w);
        if (formData.length_mm) specsJson.length_mm = parseInt(formData.length_mm);
        if (formData.slots) specsJson.slots = formData.slots;

        const { error: specsError } = await supabase
          .from('hardware_model_specs')
          .insert({
            model_id: modelData.id,
            chip: formData.chip || null,
            vram_gb: formData.vram_gb ? parseFloat(formData.vram_gb) : null,
            memory_type: formData.memory_type || null,
            bus_width_bit: formData.bus_width_bit ? parseInt(formData.bus_width_bit) : null,
            tdp_w: formData.tdp_w ? parseInt(formData.tdp_w) : null,
            outputs_count: formData.outputs_count ? parseInt(formData.outputs_count) : null,
            release_date: formData.release_date || null,
            specs_json: Object.keys(specsJson).length > 0 ? specsJson : null,
          });

        if (specsError) {
          console.error('Specs error:', specsError);
          // Don't fail the whole operation for specs
        }
      }

      onModelAdded({ ...modelData, image_url: imageUrl });
      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview(null);
      setActiveTab("basic");
      onOpenChange(false);
      
      toast({ 
        title: "Modèle ajouté", 
        description: `"${modelData.name}" a été ajouté avec succès` 
      });
    } catch (error: any) {
      console.error('Error adding model:', error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible d'ajouter le modèle", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setActiveTab("basic");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un modèle</DialogTitle>
          <DialogDescription>
            Créez un nouveau modèle matériel avec toutes ses spécifications
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Infos</span>
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">Specs</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Avancé</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 min-h-[300px]">
            <TabsContent value="basic" className="mt-0">
              <BasicInfoTab 
                formData={formData} 
                categories={categories}
                onChange={handleFormChange} 
              />
            </TabsContent>
            
            <TabsContent value="specs" className="mt-0">
              <SpecsTab 
                formData={formData} 
                onChange={handleFormChange} 
              />
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-0">
              <AdvancedSpecsTab 
                formData={formData} 
                onChange={handleFormChange} 
              />
            </TabsContent>
            
            <TabsContent value="image" className="mt-0">
              <ImageUploadTab 
                imageFile={imageFile}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
              />
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le modèle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
