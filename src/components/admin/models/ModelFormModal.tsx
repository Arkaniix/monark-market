import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Info, Cpu, ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiGet } from "@/lib/api/adminApi";
import { API_BASE_URL, getAccessToken } from "@/lib/api/client";
import { Category } from "./types";

interface ModelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: number | null; // null = add mode
  categories: Category[];
  onModelSaved: () => void;
}

interface ModelDetail {
  id: number;
  name: string;
  manufacturer: string | null;
  brand: string | null;
  category_id: number;
  family: string | null;
  aliases: string[] | null;
  image_url: string | null;
  new_price_eur: number | null;
  specs?: {
    chip?: string | null;
    vram_gb?: number | null;
    memory_type?: string | null;
    bus_width_bit?: number | null;
    tdp_w?: number | null;
    release_date?: string | null;
    specs_json?: Record<string, unknown> | null;
  } | null;
}

const MANUFACTURERS = ["NVIDIA", "AMD", "Intel", "Samsung", "Crucial", "Kingston", "Western Digital", "Corsair"];
const MEMORY_TYPES = ["GDDR5", "GDDR6", "GDDR6X", "HBM2", "HBM3", "DDR4", "DDR5"];

export function ModelFormModal({ open, onOpenChange, modelId, categories, onModelSaved }: ModelFormModalProps) {
  const isEdit = modelId !== null;
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [family, setFamily] = useState("");
  const [aliases, setAliases] = useState("");
  const [newPriceEur, setNewPriceEur] = useState("");

  // Specs state
  const [chip, setChip] = useState("");
  const [vramGb, setVramGb] = useState("");
  const [memoryType, setMemoryType] = useState("");
  const [busWidthBit, setBusWidthBit] = useState("");
  const [tdpW, setTdpW] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [cudaCores, setCudaCores] = useState("");
  const [streamProcessors, setStreamProcessors] = useState("");
  const [boostClockMhz, setBoostClockMhz] = useState("");
  const [bandwidthGbps, setBandwidthGbps] = useState("");
  const [capacityGb, setCapacityGb] = useState("");

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("infos");

  // Determine category name for conditional spec fields
  const categoryName = useMemo(() => {
    if (!categoryId) return "";
    const cat = categories.find(c => c.id === parseInt(categoryId));
    return cat?.name?.toLowerCase() || "";
  }, [categoryId, categories]);

  const isGpu = categoryName.includes("gpu");
  const isCpu = categoryName.includes("cpu");
  const isRam = categoryName.includes("ram");
  const isSsd = categoryName.includes("ssd");

  // Load model detail in edit mode
  useEffect(() => {
    if (!open) return;
    resetForm();
    if (isEdit && modelId) {
      loadModel(modelId);
    }
  }, [open, modelId]);

  const resetForm = () => {
    setName(""); setManufacturer(""); setBrand(""); setCategoryId(""); setFamily("");
    setAliases(""); setNewPriceEur(""); setChip(""); setVramGb(""); setMemoryType("");
    setBusWidthBit(""); setTdpW(""); setReleaseDate(""); setCudaCores("");
    setStreamProcessors(""); setBoostClockMhz(""); setBandwidthGbps(""); setCapacityGb("");
    setImageUrl(null); setImageFile(null); setImagePreview(null);
    setActiveTab("infos"); setLoading(false);
  };

  const loadModel = async (id: number) => {
    setLoading(true);
    try {
      const detail = await adminApiGet<ModelDetail>(`/v1/admin/models/${id}`);
      setName(detail.name || "");
      setManufacturer(detail.manufacturer || "");
      setBrand(detail.brand || "");
      setCategoryId(detail.category_id?.toString() || "");
      setFamily(detail.family || "");
      setAliases(detail.aliases?.join(", ") || "");
      setNewPriceEur(detail.new_price_eur?.toString() || "");
      setImageUrl(detail.image_url || null);

      if (detail.specs) {
        setChip(detail.specs.chip || "");
        setVramGb(detail.specs.vram_gb?.toString() || "");
        setMemoryType(detail.specs.memory_type || "");
        setBusWidthBit(detail.specs.bus_width_bit?.toString() || "");
        setTdpW(detail.specs.tdp_w?.toString() || "");
        setReleaseDate(detail.specs.release_date || "");

        const sj = detail.specs.specs_json as Record<string, unknown> | null;
        if (sj) {
          setCudaCores(sj.cuda_cores?.toString() || "");
          setStreamProcessors(sj.stream_processors?.toString() || "");
          setBoostClockMhz(sj.boost_clock_mhz?.toString() || "");
          setBandwidthGbps(sj.memory_bandwidth_gbps?.toString() || "");
          setCapacityGb(sj.capacity_gb?.toString() || "");
        }
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de charger le modèle", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const buildBody = () => {
    const specsJson: Record<string, unknown> = {};
    if (cudaCores) specsJson.cuda_cores = parseInt(cudaCores);
    if (streamProcessors) specsJson.stream_processors = parseInt(streamProcessors);
    if (boostClockMhz) specsJson.boost_clock_mhz = parseInt(boostClockMhz);
    if (bandwidthGbps) specsJson.memory_bandwidth_gbps = parseFloat(bandwidthGbps);
    if (capacityGb) specsJson.capacity_gb = parseInt(capacityGb);

    return {
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      brand: brand.trim() || null,
      category_id: parseInt(categoryId),
      family: family.trim() || null,
      aliases: aliases.split(",").map(a => a.trim()).filter(Boolean),
      new_price_eur: newPriceEur ? parseFloat(newPriceEur) : null,
      specs: {
        chip: chip.trim() || null,
        vram_gb: vramGb ? parseInt(vramGb) : null,
        memory_type: memoryType || null,
        bus_width_bit: busWidthBit ? parseInt(busWidthBit) : null,
        tdp_w: tdpW ? parseInt(tdpW) : null,
        release_date: releaseDate || null,
        specs_json: Object.keys(specsJson).length > 0 ? specsJson : null,
      },
    };
  };

  const uploadImage = async (id: number) => {
    if (!imageFile) return;
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await fetch(`${API_BASE_URL}/v1/admin/models/${id}/image`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) throw new Error("Échec de l'upload d'image");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) {
      toast({ title: "Champs requis", description: "Nom et catégorie sont obligatoires", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const body = buildBody();

      if (isEdit && modelId) {
        await adminApiFetch(`/v1/admin/models/${modelId}`, { method: "PUT", body: JSON.stringify(body) });
        if (imageFile) await uploadImage(modelId);
        toast({ title: "Modèle mis à jour", description: `"${name}" enregistré` });
      } else {
        const newModel = await adminApiFetch<{ id: number }>("/v1/admin/models", { method: "POST", body: JSON.stringify(body) });
        if (imageFile && newModel?.id) await uploadImage(newModel.id);
        toast({ title: "Modèle créé", description: `"${name}" ajouté au catalogue` });
      }

      onModelSaved();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'enregistrer", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const displayImage = imagePreview || imageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Modifier — ${name || "..."}` : "Ajouter un modèle"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations du modèle" : "Créez un nouveau modèle matériel dans le catalogue"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="infos" className="flex-1 gap-1.5"><Info className="h-3.5 w-3.5" />Infos</TabsTrigger>
              <TabsTrigger value="specs" className="flex-1 gap-1.5"><Cpu className="h-3.5 w-3.5" />Specs</TabsTrigger>
              <TabsTrigger value="image" className="flex-1 gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Image</TabsTrigger>
            </TabsList>

            {/* ===== TAB 1: INFOS ===== */}
            <TabsContent value="infos" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom du modèle *</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="RTX 4070 Ti" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manufacturer">Fabricant (chip) *</Label>
                  <Select value={manufacturer} onValueChange={setManufacturer}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {MANUFACTURERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brand">Marque (AIB)</Label>
                  <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="MSI, ASUS, Gigabyte..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="family">Famille / Gamme</Label>
                  <Input id="family" value={family} onChange={e => setFamily(e.target.value)} placeholder="RTX 40, Ryzen 7000..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Prix neuf (€)</Label>
                  <Input id="price" type="number" value={newPriceEur} onChange={e => setNewPriceEur(e.target.value)} placeholder="599" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aliases">Alias (séparés par virgules)</Label>
                <Input id="aliases" value={aliases} onChange={e => setAliases(e.target.value)} placeholder="4070Ti, RTX4070TI, RTX 4070 TI..." />
              </div>
            </TabsContent>

            {/* ===== TAB 2: SPECS ===== */}
            <TabsContent value="specs" className="space-y-4 pt-2">
              {!categoryId ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Sélectionnez d'abord une catégorie dans l'onglet Infos pour voir les champs de spécifications.
                </p>
              ) : (
                <>
                  {/* GPU fields */}
                  {isGpu && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Chip / Die</Label>
                        <Input value={chip} onChange={e => setChip(e.target.value)} placeholder="AD104, GA106..." />
                      </div>
                      <div className="space-y-1.5">
                        <Label>VRAM (GB)</Label>
                        <Input type="number" value={vramGb} onChange={e => setVramGb(e.target.value)} placeholder="12" />
                      </div>
                    </div>
                  )}

                  {/* Memory type: GPU, RAM */}
                  {(isGpu || isRam) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Type mémoire</Label>
                        <Select value={memoryType} onValueChange={setMemoryType}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>
                            {MEMORY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {isGpu && (
                        <div className="space-y-1.5">
                          <Label>Bus (bits)</Label>
                          <Input type="number" value={busWidthBit} onChange={e => setBusWidthBit(e.target.value)} placeholder="256" />
                        </div>
                      )}
                      {isRam && (
                        <div className="space-y-1.5">
                          <Label>Bandwidth (GB/s)</Label>
                          <Input type="number" value={bandwidthGbps} onChange={e => setBandwidthGbps(e.target.value)} placeholder="51.2" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* TDP: GPU, CPU */}
                  {(isGpu || isCpu) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>TDP (W)</Label>
                        <Input type="number" value={tdpW} onChange={e => setTdpW(e.target.value)} placeholder="285" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Boost Clock (MHz)</Label>
                        <Input type="number" value={boostClockMhz} onChange={e => setBoostClockMhz(e.target.value)} placeholder="2610" />
                      </div>
                    </div>
                  )}

                  {/* NVIDIA-specific */}
                  {isGpu && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>CUDA Cores</Label>
                        <Input type="number" value={cudaCores} onChange={e => setCudaCores(e.target.value)} placeholder="7680" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Stream Processors</Label>
                        <Input type="number" value={streamProcessors} onChange={e => setStreamProcessors(e.target.value)} placeholder="3840" />
                      </div>
                    </div>
                  )}

                  {/* Bandwidth for GPU */}
                  {isGpu && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Bandwidth (GB/s)</Label>
                        <Input type="number" value={bandwidthGbps} onChange={e => setBandwidthGbps(e.target.value)} placeholder="504" />
                      </div>
                      <div />
                    </div>
                  )}

                  {/* Capacity: RAM, SSD */}
                  {(isRam || isSsd) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Capacité (GB)</Label>
                        <Input type="number" value={capacityGb} onChange={e => setCapacityGb(e.target.value)} placeholder="16" />
                      </div>
                      <div />
                    </div>
                  )}

                  {/* Release date: all */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Date de sortie</Label>
                      <Input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
                    </div>
                    <div />
                  </div>
                </>
              )}
            </TabsContent>

            {/* ===== TAB 3: IMAGE ===== */}
            <TabsContent value="image" className="space-y-4 pt-2">
              <div className="flex flex-col items-center gap-4">
                <div className="w-[200px] h-[150px] rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                  {displayImage ? (
                    <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                <div className="w-full max-w-xs">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3 px-4 hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Choisir une image</span>
                    </div>
                  </Label>
                  <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                <p className="text-xs text-muted-foreground">L'image sera redimensionnée en 800×600 WebP</p>

                {imageFile && (
                  <p className="text-xs text-muted-foreground">Fichier sélectionné : {imageFile.name}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le modèle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
