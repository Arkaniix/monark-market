import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
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
import {
  Zap,
  Target,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { mockModels } from "@/lib/mockData";

interface ScrapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedModel?: string;
}

type ScrapType = "faible" | "fort" | "communautaire";

interface ScrapResult {
  analyzed: number;
  new: number;
  modified: number;
  priceChanges: number;
  creditsUsed: number;
  creditsEarned: number;
  duration: string;
}

export default function ScrapModal({ open, onOpenChange, preselectedModel }: ScrapModalProps) {
  const [scrapType, setScrapType] = useState<ScrapType>("faible");
  const [selectedModel, setSelectedModel] = useState(preselectedModel || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [includeShipping, setIncludeShipping] = useState(false);
  const [daysBack, setDaysBack] = useState("7");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScrapResult | null>(null);

  // Calculate credits cost and estimated time
  const getScrapDetails = () => {
    let credits = 0;
    let pages = 0;
    let minTime = 0;
    let maxTime = 0;

    if (scrapType === "faible") {
      credits = 3;
      pages = 5;
      minTime = 2;
      maxTime = 4;
    } else if (scrapType === "fort") {
      credits = 8;
      pages = 15;
      minTime = 5;
      maxTime = 8;
    } else {
      credits = -12; // Earn credits
      pages = 25;
      minTime = 7;
      maxTime = 12;
    }

    return { credits, pages, minTime, maxTime };
  };

  const details = getScrapDetails();

  const handleStartScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setResult(null);

    // Simulate scanning progress
    const duration = details.minTime * 1000 + Math.random() * (details.maxTime - details.minTime) * 1000;
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      setProgress((i / steps) * 100);
    }

    // Generate mock results
    const mockResult: ScrapResult = {
      analyzed: Math.floor(details.pages * 3 + Math.random() * 20),
      new: Math.floor(details.pages * 0.5 + Math.random() * 5),
      modified: Math.floor(details.pages * 0.3 + Math.random() * 3),
      priceChanges: Math.floor(details.pages * 0.2 + Math.random() * 3),
      creditsUsed: scrapType === "communautaire" ? 0 : details.credits,
      creditsEarned: scrapType === "communautaire" ? Math.abs(details.credits) : 0,
      duration: `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`,
    };

    setResult(mockResult);
    setIsScanning(false);
  };

  const resetModal = () => {
    setResult(null);
    setProgress(0);
    setScrapType("faible");
    setSelectedModel(preselectedModel || "");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRegion("all");
    setSelectedCondition("all");
    setIncludeShipping(false);
    setDaysBack("7");
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
            Configurez et lancez un scan d'annonces. Restez présent pour gérer les éventuels captchas.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Scrap Type Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Type de scan</Label>
                <RadioGroup value={scrapType} onValueChange={(value) => setScrapType(value as ScrapType)}>
                  <Card className={scrapType === "faible" ? "border-primary" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="faible" id="faible" />
                        <div className="flex-1">
                          <Label htmlFor="faible" className="cursor-pointer flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Scan faible</span>
                            <Badge variant="secondary">{details.credits === 3 ? "3" : ""} crédits</Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Scan basique d'un modèle précis sans filtres avancés. Rapide et économique.
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            📄 ~{scrapType === "faible" ? details.pages : 5} pages • ⏱️ {scrapType === "faible" ? `${details.minTime}-${details.maxTime}` : "2-4"} minutes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={scrapType === "fort" ? "border-primary" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="fort" id="fort" />
                        <div className="flex-1">
                          <Label htmlFor="fort" className="cursor-pointer flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Scan fort</span>
                            <Badge variant="secondary">{scrapType === "fort" ? details.credits : 8} crédits</Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Scan approfondi avec filtres personnalisés (prix, région, état). Plus précis.
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            📄 ~{scrapType === "fort" ? details.pages : 15} pages • ⏱️ {scrapType === "fort" ? `${details.minTime}-${details.maxTime}` : "5-8"} minutes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={scrapType === "communautaire" ? "border-accent" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="communautaire" id="communautaire" />
                        <div className="flex-1">
                          <Label htmlFor="communautaire" className="cursor-pointer flex items-center gap-2">
                            <Users className="h-4 w-4 text-accent" />
                            <span className="font-semibold">Scan communautaire</span>
                            <Badge className="bg-accent text-accent-foreground">
                              +{scrapType === "communautaire" ? Math.abs(details.credits) : 12} crédits
                            </Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Contribuez en scannant une portion définie par la plateforme. Gagnez des crédits !
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            📄 ~{scrapType === "communautaire" ? details.pages : 25} pages • ⏱️ {scrapType === "communautaire" ? `${details.minTime}-${details.maxTime}` : "7-12"} minutes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              {/* Model Selection */}
              <div>
                <Label htmlFor="model" className="mb-2 block">Modèle à scanner *</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model" className="bg-background">
                    <SelectValue placeholder="Sélectionner un modèle..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-[300px]">
                    {mockModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.medianPrice}€ ({model.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filters - Only for "fort" type */}
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
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="all">Toutes les régions</SelectItem>
                          <SelectItem value="idf">Île-de-France</SelectItem>
                          <SelectItem value="ara">Auvergne-Rhône-Alpes</SelectItem>
                          <SelectItem value="paca">PACA</SelectItem>
                          <SelectItem value="occ">Occitanie</SelectItem>
                          <SelectItem value="na">Nouvelle-Aquitaine</SelectItem>
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
                      id="shipping"
                      checked={includeShipping}
                      onCheckedChange={(checked) => setIncludeShipping(checked as boolean)}
                    />
                    <Label
                      htmlFor="shipping"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Uniquement les annonces avec livraison
                    </Label>
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div>
                <Label htmlFor="daysBack" className="mb-2 block">Annonces postées depuis</Label>
                <Select value={daysBack} onValueChange={setDaysBack}>
                  <SelectTrigger id="daysBack" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="1">Dernières 24 heures</SelectItem>
                    <SelectItem value="3">3 derniers jours</SelectItem>
                    <SelectItem value="7">7 derniers jours</SelectItem>
                    <SelectItem value="14">14 derniers jours</SelectItem>
                    <SelectItem value="30">30 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Card */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pages à scanner</span>
                      <span className="font-semibold">≈ {details.pages} pages</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Temps estimé</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {details.minTime}-{details.maxTime} minutes
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Coût en crédits</span>
                      <span className={`font-bold text-lg ${scrapType === "communautaire" ? "text-accent" : "text-primary"}`}>
                        {scrapType === "communautaire" ? `+${Math.abs(details.credits)}` : `-${details.credits}`}
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
                    Le scraping est manuel via l'extension navigateur. Restez présent pour gérer les éventuels captchas et vérifications de sécurité.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleStartScan}
                  disabled={!selectedModel || isScanning}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scan en cours...
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
                  disabled={isScanning}
                >
                  Annuler
                </Button>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression du scan</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Analyse en cours... Ne fermez pas cette fenêtre.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Success Header */}
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Scan terminé avec succès !</h3>
                <p className="text-muted-foreground">Durée totale : {result.duration}</p>
              </div>

              {/* Results Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {result.analyzed}
                      </div>
                      <p className="text-sm text-muted-foreground">Annonces analysées</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-success mb-2">
                        {result.new}
                      </div>
                      <p className="text-sm text-muted-foreground">Nouvelles annonces</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-warning mb-2">
                        {result.modified}
                      </div>
                      <p className="text-sm text-muted-foreground">Annonces modifiées</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-destructive mb-2">
                        {result.priceChanges}
                      </div>
                      <p className="text-sm text-muted-foreground">Changements de prix</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credits Summary */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Impact sur vos crédits</p>
                      <div className="flex items-center gap-2">
                        {result.creditsUsed > 0 ? (
                          <>
                            <TrendingDown className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">-{result.creditsUsed}</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-5 w-5 text-accent" />
                            <span className="text-2xl font-bold text-accent">+{result.creditsEarned}</span>
                          </>
                        )}
                        <span className="text-sm text-muted-foreground">crédits</span>
                      </div>
                    </div>
                    {result.creditsEarned > 0 && (
                      <Badge className="bg-accent text-accent-foreground">
                        Merci pour votre contribution !
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={resetModal} variant="outline" className="flex-1">
                  Lancer un autre scan
                </Button>
                <Button onClick={() => onOpenChange(false)} className="flex-1">
                  Fermer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
