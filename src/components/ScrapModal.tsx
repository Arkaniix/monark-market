import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Zap,
  Target,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStartScrap, REGIONS } from "@/hooks/useScrapJob";
import { useScrapJobContext } from "@/context/ScrapJobContext";

interface ScrapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedModel?: string;
}

// Platform configuration with Vinted added
type Platform = 'leboncoin' | 'ebay' | 'amazon' | 'ldlc' | 'fbmarket' | 'vinted';

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'leboncoin', label: 'Leboncoin', icon: '🟠' },
  { value: 'ebay', label: 'eBay', icon: '🔵' },
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'ldlc', label: 'LDLC', icon: '💻' },
  { value: 'fbmarket', label: 'FB Marketplace', icon: '📱' },
  { value: 'vinted', label: 'Vinted', icon: '👗' },
];

// Scan types without communautaire
type ScrapType = 'faible' | 'fort';

const SCRAP_TYPES = {
  faible: {
    credits: 3,
    pagesDefault: 5,
    minTime: 2,
    maxTime: 4,
    icon: Target,
    label: "Scan rapide",
    description: "Analyse basique d'un modèle précis sans filtres avancés. Rapide et économique.",
  },
  fort: {
    credits: 8,
    pagesDefault: 15,
    minTime: 5,
    maxTime: 8,
    icon: Sparkles,
    label: "Scan approfondi",
    description: "Analyse complète multi-plateformes avec filtres personnalisés par plateforme.",
  },
};

// Per-platform parameters for deep scan
interface PlatformParams {
  pagesTarget: number;
  fromDate: string;
}

export default function ScrapModal({ open, onOpenChange, preselectedModel }: ScrapModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const startScrap = useStartScrap();
  const { setActiveJob } = useScrapJobContext();

  // Form state
  const [platform, setPlatform] = useState<Platform>("leboncoin");
  const [scrapType, setScrapType] = useState<ScrapType>("faible");
  const [keyword, setKeyword] = useState(preselectedModel || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  
  // Global date filter for all scan types
  const [globalFromDate, setGlobalFromDate] = useState("");
  
  // Single platform mode
  const [pagesTarget, setPagesTarget] = useState([SCRAP_TYPES.faible.pagesDefault]);
  
  // Multi-platform mode for deep scan
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["leboncoin"]);
  const [platformParams, setPlatformParams] = useState<Record<Platform, PlatformParams>>({
    leboncoin: { pagesTarget: 15, fromDate: "" },
    ebay: { pagesTarget: 15, fromDate: "" },
    amazon: { pagesTarget: 15, fromDate: "" },
    ldlc: { pagesTarget: 15, fromDate: "" },
    fbmarket: { pagesTarget: 15, fromDate: "" },
    vinted: { pagesTarget: 15, fromDate: "" },
  });

  const typeConfig = SCRAP_TYPES[scrapType];

  // Toggle platform selection for deep scan
  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(p)) {
        // Don't allow removing the last platform
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== p);
      }
      return [...prev, p];
    });
  };

  // Update platform-specific params
  const updatePlatformParams = (p: Platform, updates: Partial<PlatformParams>) => {
    setPlatformParams(prev => ({
      ...prev,
      [p]: { ...prev[p], ...updates },
    }));
  };

  // Calculate total credits and time for deep scan
  const deepScanSummary = useMemo(() => {
    if (scrapType !== "fort") return null;
    
    const totalPages = selectedPlatforms.reduce((sum, p) => sum + platformParams[p].pagesTarget, 0);
    const creditsPerPlatform = SCRAP_TYPES.fort.credits;
    const totalCredits = selectedPlatforms.length * creditsPerPlatform;
    const minTime = selectedPlatforms.length * SCRAP_TYPES.fort.minTime;
    const maxTime = selectedPlatforms.length * SCRAP_TYPES.fort.maxTime;
    
    return { totalPages, totalCredits, minTime, maxTime };
  }, [scrapType, selectedPlatforms, platformParams]);

  const handleStartScan = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un mot-clé à rechercher.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (scrapType === "fort") {
        // For deep scan, we could create multiple jobs or send all platforms at once
        // For now, we'll send the first platform and include multi-platform info in filters
        const primaryPlatform = selectedPlatforms[0];
        const filters: Record<string, unknown> = {
          platforms: selectedPlatforms.map(p => ({
            platform: p,
            pages_target: platformParams[p].pagesTarget,
            from_date: platformParams[p].fromDate || undefined,
          })),
        };

        if (minPrice) filters.price_min = parseInt(minPrice, 10);
        if (maxPrice) filters.price_max = parseInt(maxPrice, 10);
        if (selectedRegion !== "all") filters.region = selectedRegion;
        if (selectedCondition !== "all") filters.condition = selectedCondition;
        if (deliveryOnly) filters.delivery_only = true;

        const response = await startScrap.mutateAsync({
          platform: primaryPlatform,
          type: scrapType,
          keyword: keyword.trim(),
          filters,
        });

        setActiveJob({
          job_id: response.job_id,
          upload_token: response.upload_token,
          platform: primaryPlatform,
          keyword: keyword.trim(),
          type: scrapType,
          params: filters,
        });

        toast({
          title: "Job créé",
          description: `Job #${response.job_id} créé pour ${selectedPlatforms.length} plateforme(s).`,
        });

        onOpenChange(false);
        navigate(`/jobs/${response.job_id}`);
      } else {
        // Simple scan
        const filters: Record<string, unknown> = {
          pages_target: pagesTarget[0],
        };
        
        if (globalFromDate) filters.from_date = globalFromDate;

        const response = await startScrap.mutateAsync({
          platform,
          type: scrapType,
          keyword: keyword.trim(),
          filters,
        });

        setActiveJob({
          job_id: response.job_id,
          upload_token: response.upload_token,
          platform: response.params?.platform || platform,
          keyword: response.params?.keyword || keyword.trim(),
          type: response.params?.type || scrapType,
          params: response.params?.filters || {},
        });

        toast({
          title: "Job créé",
          description: `Job #${response.job_id} créé avec succès.`,
        });

        onOpenChange(false);
        navigate(`/jobs/${response.job_id}`);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le job.",
        variant: "destructive",
      });
    }
  };

  const resetModal = () => {
    setPlatform("leboncoin");
    setScrapType("faible");
    setKeyword(preselectedModel || "");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRegion("all");
    setSelectedCondition("all");
    setDeliveryOnly(false);
    setGlobalFromDate("");
    setPagesTarget([SCRAP_TYPES.faible.pagesDefault]);
    setSelectedPlatforms(["leboncoin"]);
    setPlatformParams({
      leboncoin: { pagesTarget: 15, fromDate: "" },
      ebay: { pagesTarget: 15, fromDate: "" },
      amazon: { pagesTarget: 15, fromDate: "" },
      ldlc: { pagesTarget: 15, fromDate: "" },
      fbmarket: { pagesTarget: 15, fromDate: "" },
      vinted: { pagesTarget: 15, fromDate: "" },
    });
  };

  const handleScrapTypeChange = (value: ScrapType) => {
    setScrapType(value);
    setPagesTarget([SCRAP_TYPES[value].pagesDefault]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setTimeout(resetModal, 300);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Lancer un scan
          </DialogTitle>
          <DialogDescription>
            Configurez et lancez une analyse d'annonces. L'extension navigateur se chargera de la collecte.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Scan Type Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Type de scan</Label>
              <RadioGroup value={scrapType} onValueChange={(v) => handleScrapTypeChange(v as ScrapType)}>
                {(Object.entries(SCRAP_TYPES) as [ScrapType, typeof SCRAP_TYPES.faible][]).map(([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = scrapType === type;
                  
                  return (
                    <Card key={type} className={isSelected ? "border-primary" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={type} id={type} />
                          <div className="flex-1">
                            <Label htmlFor={type} className="cursor-pointer flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{config.label}</span>
                              <Badge variant="secondary">
                                {config.credits} crédits{type === "fort" ? "/plateforme" : ""}
                              </Badge>
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                            {type === "faible" && (
                              <p className="text-xs text-muted-foreground mt-2">
                                📄 ~{config.pagesDefault} pages • ⏱️ {config.minTime}-{config.maxTime} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Platform Selection - Different behavior based on scan type */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                {scrapType === "fort" ? "Plateformes (sélection multiple)" : "Plateforme"}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((p) => {
                  const isSelected = scrapType === "fort" 
                    ? selectedPlatforms.includes(p.value)
                    : platform === p.value;
                  
                  return (
                    <Button
                      key={p.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="justify-start gap-2"
                      onClick={() => {
                        if (scrapType === "fort") {
                          togglePlatform(p.value);
                        } else {
                          setPlatform(p.value);
                        }
                      }}
                    >
                      <span>{p.icon}</span>
                      <span className="truncate">{p.label}</span>
                      {scrapType === "fort" && isSelected && (
                        <X className="h-3 w-3 ml-auto" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Keyword Input */}
            <div>
              <Label htmlFor="keyword" className="mb-2 block">Mot-clé de recherche *</Label>
              <Input
                id="keyword"
                placeholder="Ex: RTX 4070, iPhone 15 Pro, PS5..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Simple scan: pages slider and global date */}
            {scrapType === "faible" && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Nombre de pages cible</Label>
                    <span className="text-sm font-semibold">{pagesTarget[0]} pages</span>
                  </div>
                  <Slider
                    value={pagesTarget}
                    onValueChange={setPagesTarget}
                    min={1}
                    max={30}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div>
                  <Label htmlFor="globalFromDate" className="mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Analyser à partir de (date)
                  </Label>
                  <Input
                    id="globalFromDate"
                    type="date"
                    value={globalFromDate}
                    onChange={(e) => setGlobalFromDate(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Limiter aux annonces publiées après cette date
                  </p>
                </div>
              </>
            )}

            {/* Deep scan: per-platform parameters */}
            {scrapType === "fort" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Paramètres par plateforme</span>
                </div>

                <div className="space-y-3">
                  {selectedPlatforms.map((p) => {
                    const platformInfo = PLATFORMS.find(x => x.value === p)!;
                    const params = platformParams[p];
                    
                    return (
                      <Card key={p} className="border-primary/30">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">{platformInfo.icon}</span>
                            <span className="font-semibold">{platformInfo.label}</span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm">Pages à analyser</Label>
                                <span className="text-sm font-semibold">{params.pagesTarget}</span>
                              </div>
                              <Slider
                                value={[params.pagesTarget]}
                                onValueChange={([value]) => updatePlatformParams(p, { pagesTarget: value })}
                                min={1}
                                max={50}
                                step={1}
                                className="py-2"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm mb-2 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                À partir de
                              </Label>
                              <Input
                                type="date"
                                value={params.fromDate}
                                onChange={(e) => updatePlatformParams(p, { fromDate: e.target.value })}
                                className="bg-background mt-1"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Global filters for deep scan */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">Filtres globaux</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice" className="text-sm">Prix minimum (€)</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="Ex: 200"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-background mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxPrice" className="text-sm">Prix maximum (€)</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="Ex: 500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-background mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="region" className="text-sm">Région</Label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger id="region" className="bg-background mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50 max-h-[200px]">
                          {REGIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="condition" className="text-sm">État</Label>
                      <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                        <SelectTrigger id="condition" className="bg-background mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">Tous les états</SelectItem>
                          <SelectItem value="neuf">Neuf</SelectItem>
                          <SelectItem value="comme-neuf">Comme neuf</SelectItem>
                          <SelectItem value="tres-bon">Très bon état</SelectItem>
                          <SelectItem value="bon">Bon état</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delivery"
                      checked={deliveryOnly}
                      onCheckedChange={(checked) => setDeliveryOnly(checked as boolean)}
                    />
                    <Label
                      htmlFor="delivery"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Uniquement les annonces avec livraison
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  {scrapType === "fort" && deepScanSummary ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plateformes</span>
                        <span className="font-semibold">{selectedPlatforms.length} sélectionnée(s)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total pages</span>
                        <span className="font-semibold">≈ {deepScanSummary.totalPages} pages</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Temps estimé</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {deepScanSummary.minTime}-{deepScanSummary.maxTime} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Coût total</span>
                        <span className="font-bold text-lg text-primary">
                          -{deepScanSummary.totalCredits} crédits
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pages à scanner</span>
                        <span className="font-semibold">≈ {pagesTarget[0]} pages</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Temps estimé</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {typeConfig.minTime}-{typeConfig.maxTime} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Coût en crédits</span>
                        <span className="font-bold text-lg text-primary">
                          -{typeConfig.credits}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Warning Message */}
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Important</p>
                <p className="text-muted-foreground">
                  La collecte est manuelle via l'extension navigateur. Restez présent pour gérer les éventuels captchas.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleStartScan}
                disabled={!keyword.trim() || startScrap.isPending}
                className="flex-1 gap-2"
                size="lg"
              >
                {startScrap.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création du job...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Lancer le scan
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={startScrap.isPending}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
