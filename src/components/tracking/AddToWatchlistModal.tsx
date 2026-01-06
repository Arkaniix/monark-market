import { useState, useMemo } from "react";
import { Eye, Search, Package, Tag, Plus, ChevronRight, Check, RefreshCw, Target, TrendingDown, Sparkles, AlertCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAddToWatchlist } from "@/hooks/useProviderData";
import { useDataProvider } from "@/providers";
import { useQuery } from "@tanstack/react-query";

type TargetType = 'model' | 'ad';
type Step = 'type' | 'search' | 'confirm';

interface SearchResult {
  id: number;
  name: string;
  category?: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
}

interface AddToWatchlistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddToWatchlistModal({ open, onClose, onSuccess }: AddToWatchlistModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [targetType, setTargetType] = useState<TargetType>('model');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [createAlert, setCreateAlert] = useState(false);
  
  const provider = useDataProvider();
  const addToWatchlist = useAddToWatchlist();
  const { toast } = useToast();

  // Reset state when modal opens/closes
  const handleClose = () => {
    setCurrentStep('type');
    setTargetType('model');
    setSearchQuery('');
    setSelectedItem(null);
    setCreateAlert(false);
    onClose();
  };

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['watchlist-search', targetType, searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      if (targetType === 'model') {
        // Use autocomplete for models
        const results = await provider.getModelsAutocomplete(searchQuery);
        return results.map((r: { id: number; name: string; brand: string; category: string }) => ({
          id: r.id,
          name: r.name,
          brand: r.brand,
          category: r.category,
        }));
      } else {
        // For ads, search in deals using category filter as workaround
        // The search term will be used to filter client-side
        const response = await provider.getDeals({ 
          page: 1, 
          limit: 50 
        });
        // Filter client-side by search query
        const filtered = response.items.filter((deal: { title: string }) => 
          deal.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10);
        return filtered.map((deal: { id: number; title: string; category: string; price: number }) => ({
          id: deal.id,
          name: deal.title,
          category: deal.category,
          price: deal.price,
        }));
      }
    },
    enabled: open && searchQuery.length >= 2,
    staleTime: 30000,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;

    try {
      await addToWatchlist.mutateAsync({
        target_type: targetType,
        target_id: selectedItem.id,
      });
      
      toast({
        title: "Ajouté à la watchlist",
        description: `"${selectedItem.name}" est maintenant suivi.`,
      });
      
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter à la watchlist.",
        variant: "destructive",
      });
    }
  };

  const goToStep = (step: Step) => setCurrentStep(step);

  const selectItem = (item: SearchResult) => {
    setSelectedItem(item);
    setCurrentStep('confirm');
  };

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'type', label: 'Type', icon: <Target className="h-4 w-4" /> },
    { id: 'search', label: 'Recherche', icon: <Search className="h-4 w-4" /> },
    { id: 'confirm', label: 'Confirmer', icon: <Check className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            Ajouter à la Watchlist
          </DialogTitle>
          <DialogDescription>
            Suivez l'évolution des prix d'un modèle ou d'une annonce
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 py-3 border-b">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (step.id === 'type') goToStep('type');
                  else if (step.id === 'search' && targetType) goToStep('search');
                  else if (step.id === 'confirm' && selectedItem) goToStep('confirm');
                }}
                disabled={
                  (step.id === 'search' && !targetType) ||
                  (step.id === 'confirm' && !selectedItem)
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {step.icon}
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 1: Choose type */}
          {currentStep === 'type' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Que souhaitez-vous suivre ?</h3>

              <RadioGroup
                value={targetType}
                onValueChange={(v) => setTargetType(v as TargetType)}
                className="grid gap-3"
              >
                {/* Model option */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    targetType === 'model' 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                  onClick={() => setTargetType('model')}
                >
                  <RadioGroupItem value="model" id="model" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="model" className="flex items-center gap-2 cursor-pointer font-medium text-base">
                      <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Package className="h-5 w-5" />
                      </span>
                      Un modèle de matériel
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Suivez un modèle précis (ex: RTX 4070, Ryzen 5 5600X) pour être informé des variations de prix sur le marché.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Tendances prix
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Alertes bonne affaire
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Ad option */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    targetType === 'ad' 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                  onClick={() => setTargetType('ad')}
                >
                  <RadioGroupItem value="ad" id="ad" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="ad" className="flex items-center gap-2 cursor-pointer font-medium text-base">
                      <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Tag className="h-5 w-5" />
                      </span>
                      Une annonce spécifique
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Suivez une annonce en particulier pour être notifié si le vendeur baisse son prix.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Baisse de prix
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Statut annonce
                      </Badge>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Search */}
          {currentStep === 'search' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {targetType === 'model' ? (
                    <Package className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Tag className="h-4 w-4 text-purple-500" />
                  )}
                  Rechercher {targetType === 'model' ? 'un modèle' : 'une annonce'}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={targetType === 'model' ? "Ex: RTX 4070, Ryzen 7..." : "Ex: carte graphique, processeur..."}
                    className="pl-10"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saisissez au moins 2 caractères pour rechercher
                </p>
              </div>

              {/* Results */}
              <ScrollArea className="h-[300px] rounded-lg border">
                <div className="p-2">
                  {isSearching ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                          <Skeleton className="h-10 w-10 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length < 2 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Commencez à taper pour rechercher</p>
                    </div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun résultat pour "{searchQuery}"</p>
                      <p className="text-xs mt-1">Essayez avec d'autres termes</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((result: SearchResult) => (
                        <button
                          key={result.id}
                          onClick={() => selectItem(result)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className={`p-2 rounded-lg ${
                            targetType === 'model' 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}>
                            {targetType === 'model' ? (
                              <Package className="h-4 w-4" />
                            ) : (
                              <Tag className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {result.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {result.brand && <span>{result.brand}</span>}
                              {result.category && (
                                <>
                                  {result.brand && <span>•</span>}
                                  <span>{result.category}</span>
                                </>
                              )}
                              {result.price && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium">{formatPrice(result.price)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === 'confirm' && selectedItem && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Confirmer l'ajout
              </h3>

              {/* Selected item summary */}
              <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      targetType === 'model' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {targetType === 'model' ? (
                        <Package className="h-6 w-6" />
                      ) : (
                        <Tag className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant={targetType === 'model' ? 'default' : 'secondary'} className="mb-2">
                        {targetType === 'model' ? 'Modèle' : 'Annonce'}
                      </Badge>
                      <p className="font-semibold text-lg">{selectedItem.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        {selectedItem.brand && <span>{selectedItem.brand}</span>}
                        {selectedItem.category && (
                          <>
                            {selectedItem.brand && <span>•</span>}
                            <span>{selectedItem.category}</span>
                          </>
                        )}
                      </div>
                      {selectedItem.price && (
                        <p className="font-medium text-lg mt-2">{formatPrice(selectedItem.price)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* What will happen */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Ce que vous pourrez faire :</p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded bg-green-500/10">
                      <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>Suivre l'évolution des prix en temps réel</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded bg-amber-500/10">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>Créer des alertes personnalisées</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded bg-blue-500/10">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Visualiser l'historique des 30 derniers jours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          {currentStep === 'type' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={() => setCurrentStep('search')} className="gap-2">
                Continuer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : currentStep === 'search' ? (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('type')}>
                Retour
              </Button>
              <Button 
                onClick={() => selectedItem && setCurrentStep('confirm')} 
                disabled={!selectedItem}
                className="gap-2"
              >
                Continuer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('search')}>
                Retour
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={addToWatchlist.isPending}
                className="gap-2"
              >
                {addToWatchlist.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Ajouter à la Watchlist
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
