import { useState, useEffect } from "react";
import { Bell, TrendingDown, TrendingUp, MapPin, Sparkles, Package, RefreshCw, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCreateAlert } from "@/hooks/useProviderData";
import type { AlertType, CreateAlertPayload } from "@/providers/types";

// Régions françaises
const REGIONS = [
  { value: "ile-de-france", label: "Île-de-France" },
  { value: "auvergne-rhone-alpes", label: "Auvergne-Rhône-Alpes" },
  { value: "nouvelle-aquitaine", label: "Nouvelle-Aquitaine" },
  { value: "occitanie", label: "Occitanie" },
  { value: "hauts-de-france", label: "Hauts-de-France" },
  { value: "provence-alpes-cote-d-azur", label: "Provence-Alpes-Côte d'Azur" },
  { value: "grand-est", label: "Grand Est" },
  { value: "pays-de-la-loire", label: "Pays de la Loire" },
  { value: "bretagne", label: "Bretagne" },
  { value: "normandie", label: "Normandie" },
  { value: "bourgogne-franche-comte", label: "Bourgogne-Franche-Comté" },
  { value: "centre-val-de-loire", label: "Centre-Val de Loire" },
  { value: "corse", label: "Corse" },
];

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "comme_neuf", label: "Comme neuf" },
  { value: "tres_bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "correct", label: "État correct" },
];

const PLATFORMS = [
  { value: "leboncoin", label: "Leboncoin" },
  { value: "facebook", label: "Facebook Marketplace" },
  { value: "vinted", label: "Vinted" },
  { value: "ebay", label: "eBay" },
];

const COOLDOWNS = [
  { value: "0", label: "Aucun" },
  { value: "1", label: "1 heure" },
  { value: "6", label: "6 heures" },
  { value: "12", label: "12 heures" },
  { value: "24", label: "24 heures" },
  { value: "48", label: "48 heures" },
];

export interface AlertTarget {
  type: 'ad' | 'model';
  id: number;
  name: string;
  category?: string;
  currentPrice?: number;
}

interface CreateAlertModalProps {
  open: boolean;
  onClose: () => void;
  target: AlertTarget | null;
  onSuccess?: () => void;
  defaultAlertType?: AlertType;
}

export function CreateAlertModal({
  open,
  onClose,
  target,
  onSuccess,
  defaultAlertType = 'deal_detected',
}: CreateAlertModalProps) {
  // State
  const [alertType, setAlertType] = useState<AlertType>(defaultAlertType);
  const [priceThreshold, setPriceThreshold] = useState<string>('');
  const [variationThreshold, setVariationThreshold] = useState<string>('10');
  const [region, setRegion] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [cooldown, setCooldown] = useState<string>('0');
  
  const createAlert = useCreateAlert();
  const { toast } = useToast();

  // Reset form when target changes
  useEffect(() => {
    if (target) {
      setAlertType(defaultAlertType);
      setPriceThreshold(target.currentPrice ? Math.round(target.currentPrice * 0.9).toString() : '');
      setVariationThreshold('10');
      setRegion('');
      setCondition('');
      setPlatform('');
      setCooldown('0');
    }
  }, [target, defaultAlertType]);

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'deal_detected':
        return <Sparkles className="h-4 w-4" />;
      case 'price_below':
        return <TrendingDown className="h-4 w-4" />;
      case 'price_above':
        return <TrendingUp className="h-4 w-4" />;
      case 'variation':
        return <RefreshCw className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'new_listing':
        return <Package className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    switch (type) {
      case 'deal_detected':
        return 'Bonne affaire';
      case 'price_below':
        return 'Prix en-dessous';
      case 'price_above':
        return 'Prix au-dessus';
      case 'variation':
        return 'Variation de prix';
      case 'location':
        return 'Localisation';
      case 'new_listing':
        return 'Nouvelle annonce';
      default:
        return type;
    }
  };

  const getAlertTypeDescription = (type: AlertType) => {
    switch (type) {
      case 'deal_detected':
        return 'Alerté quand une bonne affaire est détectée automatiquement';
      case 'price_below':
        return 'Alerté quand le prix passe en dessous du seuil';
      case 'price_above':
        return 'Alerté quand le prix dépasse le seuil';
      case 'variation':
        return 'Alerté sur les variations de prix importantes';
      case 'location':
        return 'Alerté pour les annonces dans une région spécifique';
      case 'new_listing':
        return 'Alerté pour chaque nouvelle annonce correspondante';
      default:
        return '';
    }
  };

  const handleSubmit = () => {
    if (!target) return;

    const payload: CreateAlertPayload = {
      target_type: target.type,
      target_id: target.id,
      alert_type: alertType,
    };

    // Ajouter les paramètres selon le type
    if (alertType === 'price_below' || alertType === 'price_above') {
      if (!priceThreshold) {
        toast({
          title: "Seuil requis",
          description: "Veuillez définir un seuil de prix.",
          variant: "destructive",
        });
        return;
      }
      payload.price_threshold = parseFloat(priceThreshold);
    }

    if (alertType === 'variation') {
      payload.variation_threshold = parseFloat(variationThreshold);
    }

    if (region) {
      payload.region = region;
    }

    if (condition) {
      payload.condition = condition;
    }

    if (platform) {
      payload.platform = platform;
    }

    if (cooldown && cooldown !== '0') {
      payload.cooldown_hours = parseInt(cooldown);
    }

    createAlert.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Alerte créée",
          description: `Vous serez notifié selon vos critères pour "${target.name}".`,
        });
        onClose();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'alerte. Réessayez.",
          variant: "destructive",
        });
      },
    });
  };

  // Types disponibles selon la cible
  const availableTypes: AlertType[] = target?.type === 'model'
    ? ['deal_detected', 'price_below', 'price_above', 'variation', 'location', 'new_listing']
    : ['deal_detected', 'price_below', 'price_above', 'variation'];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Créer une alerte
          </DialogTitle>
          <DialogDescription>
            {target && (
              <span className="flex items-center gap-2 mt-1">
                <Badge variant={target.type === 'model' ? 'default' : 'secondary'}>
                  {target.type === 'model' ? 'Modèle' : 'Annonce'}
                </Badge>
                <span className="font-medium text-foreground">{target.name}</span>
                {target.category && (
                  <span className="text-muted-foreground">• {target.category}</span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="type" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="type">Type d'alerte</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          {/* Onglet Type d'alerte */}
          <TabsContent value="type" className="space-y-4 mt-4">
            <RadioGroup
              value={alertType}
              onValueChange={(v) => setAlertType(v as AlertType)}
              className="space-y-2"
            >
              {availableTypes.map((type) => (
                <div
                  key={type}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    alertType === type ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setAlertType(type)}
                >
                  <RadioGroupItem value={type} id={type} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer font-medium">
                      {getAlertTypeIcon(type)}
                      {getAlertTypeLabel(type)}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getAlertTypeDescription(type)}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {/* Paramètres spécifiques selon le type */}
            {(alertType === 'price_below' || alertType === 'price_above') && (
              <div className="space-y-2 pt-2">
                <Label>Seuil de prix (€)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={priceThreshold}
                    onChange={(e) => setPriceThreshold(e.target.value)}
                    placeholder="Ex: 300"
                    className="flex-1"
                  />
                  {target?.currentPrice && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Prix actuel: {target.currentPrice}€
                    </span>
                  )}
                </div>
              </div>
            )}

            {alertType === 'variation' && (
              <div className="space-y-2 pt-2">
                <Label>Variation minimum (%)</Label>
                <Select value={variationThreshold} onValueChange={setVariationThreshold}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {alertType === 'location' && (
              <div className="space-y-2 pt-2">
                <Label>Région</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          {/* Onglet Options avancées */}
          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Filtrer par état</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les états" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les états</SelectItem>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filtrer par plateforme</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les plateformes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les plateformes</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {alertType !== 'location' && (
              <div className="space-y-2">
                <Label>Filtrer par région</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les régions</SelectItem>
                    {REGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Délai entre notifications
                <Badge variant="outline" className="text-xs">Anti-spam</Badge>
              </Label>
              <Select value={cooldown} onValueChange={setCooldown}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COOLDOWNS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Évite les notifications répétées trop fréquentes
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createAlert.isPending}
            className="gap-2"
          >
            {createAlert.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Créer l'alerte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
