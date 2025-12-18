import { useState } from "react";
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
  Users,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStartScrap, PLATFORMS, REGIONS, type Platform, type ScrapType } from "@/hooks/useScrapJob";
import { useScrapJobContext } from "@/context/ScrapJobContext";

interface ScrapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedModel?: string;
}

// Scrap type configuration
const SCRAP_TYPES = {
  faible: {
    credits: 3,
    pagesDefault: 5,
    minTime: 2,
    maxTime: 4,
    icon: Target,
    label: "Scan faible",
    description: "Scan basique d'un modèle précis sans filtres avancés. Rapide et économique.",
  },
  fort: {
    credits: 8,
    pagesDefault: 15,
    minTime: 5,
    maxTime: 8,
    icon: Sparkles,
    label: "Scan fort",
    description: "Scan approfondi avec filtres personnalisés (prix, région, état). Plus précis.",
  },
  communautaire: {
    credits: -12,
    pagesDefault: 25,
    minTime: 7,
    maxTime: 12,
    icon: Users,
    label: "Scan communautaire",
    description: "Contribuez en scannant une portion définie par la plateforme. Gagnez des crédits !",
  },
};

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
  const [pagesTarget, setPagesTarget] = useState([SCRAP_TYPES.faible.pagesDefault]);

  const typeConfig = SCRAP_TYPES[scrapType];

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
      const filters: Record<string, unknown> = {
        pages_target: pagesTarget[0],
      };

      if (scrapType === "fort") {
        if (minPrice) filters.price_min = parseInt(minPrice, 10);
        if (maxPrice) filters.price_max = parseInt(maxPrice, 10);
        if (selectedRegion !== "all") filters.region = selectedRegion;
        if (selectedCondition !== "all") filters.condition = selectedCondition;
        if (deliveryOnly) filters.delivery_only = true;
      }

      const response = await startScrap.mutateAsync({
        platform,
        type: scrapType,
        keyword: keyword.trim(),
        filters,
      });

      // Store job in context
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

      // Close modal and navigate to job page
      onOpenChange(false);
      navigate(`/jobs/${response.job_id}`);
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
    setPagesTarget([SCRAP_TYPES.faible.pagesDefault]);
  };

  // Update pages target when scrap type changes
  const handleScrapTypeChange = (value: ScrapType) => {
    setScrapType(value);
    setPagesTarget([SCRAP_TYPES[value].pagesDefault]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
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
            Configurez et lancez un scan d'annonces. L'extension navigateur se chargera du scraping.
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
            {/* Platform Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Plateforme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PLATFORMS.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={platform === p.value ? "default" : "outline"}
                    className="justify-start gap-2"
                    onClick={() => setPlatform(p.value)}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Scrap Type Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Type de scan</Label>
              <RadioGroup value={scrapType} onValueChange={(v) => handleScrapTypeChange(v as ScrapType)}>
                {(Object.entries(SCRAP_TYPES) as [ScrapType, typeof SCRAP_TYPES.faible][]).map(([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = scrapType === type;
                  const isCommunity = type === "communautaire";
                  
                  return (
                    <Card key={type} className={isSelected ? (isCommunity ? "border-accent" : "border-primary") : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={type} id={type} />
                          <div className="flex-1">
                            <Label htmlFor={type} className="cursor-pointer flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${isCommunity ? "text-accent" : "text-primary"}`} />
                              <span className="font-semibold">{config.label}</span>
                              <Badge variant={isCommunity ? "default" : "secondary"} className={isCommunity ? "bg-accent text-accent-foreground" : ""}>
                                {isCommunity ? `+${Math.abs(config.credits)}` : config.credits} crédits
                              </Badge>
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              📄 ~{config.pagesDefault} pages • ⏱️ {config.minTime}-{config.maxTime} minutes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
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

            {/* Pages Target Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Nombre de pages cible</Label>
                <span className="text-sm font-semibold">{pagesTarget[0]} pages</span>
              </div>
              <Slider
                value={pagesTarget}
                onValueChange={setPagesTarget}
                min={1}
                max={scrapType === "communautaire" ? 50 : 30}
                step={1}
                className="py-2"
              />
            </div>

            {/* Advanced Filters - Only for "fort" type */}
            {scrapType === "fort" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Filtres avancés</span>
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
            )}

            {/* Summary Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
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
                    <span className={`font-bold text-lg ${scrapType === "communautaire" ? "text-accent" : "text-primary"}`}>
                      {scrapType === "communautaire" ? `+${Math.abs(typeConfig.credits)}` : `-${typeConfig.credits}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Message */}
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Important</p>
                <p className="text-muted-foreground">
                  Le scraping est manuel via l'extension navigateur. Restez présent pour gérer les éventuels captchas.
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
