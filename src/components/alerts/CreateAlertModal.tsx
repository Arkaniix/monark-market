import { useState, useEffect, useMemo } from "react";
import { Bell, TrendingDown, TrendingUp, MapPin, Sparkles, Package, RefreshCw, Lock, Crown, ChevronRight, ChevronLeft, Check, AlertCircle, Target, Clock, Filter, Settings2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCreateAlert } from "@/hooks/useProviderData";
import { useEntitlements } from "@/hooks/useEntitlements";
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
  { value: "0", label: "Immédiat", description: "Notifié à chaque déclenchement" },
  { value: "1", label: "1 heure", description: "Maximum 1 notification/heure" },
  { value: "6", label: "6 heures", description: "Maximum 4 notifications/jour" },
  { value: "12", label: "12 heures", description: "Maximum 2 notifications/jour" },
  { value: "24", label: "24 heures", description: "Maximum 1 notification/jour" },
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

type Step = 'type' | 'options' | 'summary';

export function CreateAlertModal({
  open,
  onClose,
  target,
  onSuccess,
  defaultAlertType = 'deal_detected',
}: CreateAlertModalProps) {
  // Entitlements
  const { plan, limits, helpers } = useEntitlements();
  const activeAlertsCount = helpers.getActiveAlertsCount();
  const maxAlerts = limits.maxAlerts;
  const canActivate = helpers.canActivateAlert();

  // Navigation
  const [currentStep, setCurrentStep] = useState<Step>('type');

  // State
  const [alertType, setAlertType] = useState<AlertType>(defaultAlertType);
  const [priceThreshold, setPriceThreshold] = useState<string>('');
  const [variationThreshold, setVariationThreshold] = useState<number>(10);
  const [region, setRegion] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [cooldown, setCooldown] = useState<string>('0');
  const [notifyOnPriceDrop, setNotifyOnPriceDrop] = useState<boolean>(true);
  const [notifyOnPriceRise, setNotifyOnPriceRise] = useState<boolean>(false);
  
  const createAlert = useCreateAlert();
  const { toast } = useToast();

  // Reset form when target changes or modal opens
  useEffect(() => {
    if (target && open) {
      setCurrentStep('type');
      setAlertType(defaultAlertType);
      setPriceThreshold(target.currentPrice ? Math.round(target.currentPrice * 0.9).toString() : '');
      setVariationThreshold(10);
      setRegion('');
      setCondition('');
      setPlatform('');
      setCooldown('0');
      setNotifyOnPriceDrop(true);
      setNotifyOnPriceRise(false);
    }
  }, [target, defaultAlertType, open]);

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
        return 'Détection automatique des bonnes affaires par notre algorithme';
      case 'price_below':
        return 'Notification quand le prix passe sous votre seuil cible';
      case 'price_above':
        return 'Notification quand le prix dépasse un certain montant';
      case 'variation':
        return 'Suivi des variations de prix significatives';
      case 'location':
        return 'Annonces disponibles dans une région spécifique';
      case 'new_listing':
        return 'Chaque nouvelle annonce correspondant à vos critères';
      default:
        return '';
    }
  };

  const getAlertTypeColor = (type: AlertType) => {
    switch (type) {
      case 'deal_detected':
        return 'text-green-600 dark:text-green-400 bg-green-500/10';
      case 'price_below':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
      case 'price_above':
        return 'text-red-600 dark:text-red-400 bg-red-500/10';
      case 'variation':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10';
      case 'location':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10';
      case 'new_listing':
        return 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  // Validation
  const isTypeStepValid = useMemo(() => {
    if (alertType === 'price_below' || alertType === 'price_above') {
      return !!priceThreshold && parseFloat(priceThreshold) > 0;
    }
    if (alertType === 'location') {
      return !!region;
    }
    return true;
  }, [alertType, priceThreshold, region]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  // Build summary items
  const summaryItems = useMemo(() => {
    const items: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }[] = [];

    // Target
    items.push({
      icon: target?.type === 'model' ? <Target className="h-4 w-4" /> : <Package className="h-4 w-4" />,
      label: 'Cible',
      value: target?.name || '',
      highlight: true,
    });

    // Type + condition
    let conditionText = '';
    switch (alertType) {
      case 'deal_detected':
        conditionText = 'Bonne affaire détectée automatiquement';
        break;
      case 'price_below':
        conditionText = `Prix inférieur à ${formatPrice(parseFloat(priceThreshold) || 0)}`;
        break;
      case 'price_above':
        conditionText = `Prix supérieur à ${formatPrice(parseFloat(priceThreshold) || 0)}`;
        break;
      case 'variation':
        conditionText = `Variation de prix > ${variationThreshold}%`;
        break;
      case 'location':
        const regionLabel = REGIONS.find(r => r.value === region)?.label || region;
        conditionText = `Annonces en ${regionLabel}`;
        break;
      case 'new_listing':
        conditionText = 'Nouvelle annonce correspondante';
        break;
    }
    items.push({
      icon: getAlertTypeIcon(alertType),
      label: 'Condition',
      value: conditionText,
      highlight: true,
    });

    // Filters
    const filters: string[] = [];
    if (condition) {
      filters.push(CONDITIONS.find(c => c.value === condition)?.label || condition);
    }
    if (platform) {
      filters.push(PLATFORMS.find(p => p.value === platform)?.label || platform);
    }
    if (region && alertType !== 'location') {
      filters.push(REGIONS.find(r => r.value === region)?.label || region);
    }
    if (filters.length > 0) {
      items.push({
        icon: <Filter className="h-4 w-4" />,
        label: 'Filtres',
        value: filters.join(', '),
      });
    }

    // Cooldown
    const cooldownLabel = COOLDOWNS.find(c => c.value === cooldown);
    items.push({
      icon: <Clock className="h-4 w-4" />,
      label: 'Fréquence',
      value: cooldownLabel?.description || cooldownLabel?.label || 'Immédiat',
    });

    return items;
  }, [target, alertType, priceThreshold, variationThreshold, region, condition, platform, cooldown]);

  const handleSubmit = () => {
    if (!target) return;

    const payload: CreateAlertPayload = {
      target_type: target.type,
      target_id: target.id,
      alert_type: alertType,
    };

    // Ajouter les paramètres selon le type
    if (alertType === 'price_below' || alertType === 'price_above') {
      payload.price_threshold = parseFloat(priceThreshold);
    }

    if (alertType === 'variation') {
      payload.variation_threshold = variationThreshold;
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
          title: "Alerte créée avec succès",
          description: `Vous serez notifié pour "${target.name}".`,
        });
        onClose();
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'alerte. Réessayez.",
          variant: "destructive",
        });
      },
    });
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === 'type' && isTypeStepValid) {
      setCurrentStep('options');
    } else if (currentStep === 'options') {
      setCurrentStep('summary');
    }
  };

  const prevStep = () => {
    if (currentStep === 'summary') {
      setCurrentStep('options');
    } else if (currentStep === 'options') {
      setCurrentStep('type');
    }
  };

  // Types disponibles selon la cible
  const availableTypes: AlertType[] = target?.type === 'model'
    ? ['deal_detected', 'price_below', 'price_above', 'variation', 'location', 'new_listing']
    : ['deal_detected', 'price_below', 'price_above', 'variation'];

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'type', label: 'Type', icon: <Bell className="h-4 w-4" /> },
    { id: 'options', label: 'Options', icon: <Settings2 className="h-4 w-4" /> },
    { id: 'summary', label: 'Résumé', icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            Créer une alerte
          </DialogTitle>
          <DialogDescription>
            {target && (
              <span className="flex items-center gap-2 mt-1">
                <Badge variant={target.type === 'model' ? 'default' : 'secondary'}>
                  {target.type === 'model' ? 'Modèle' : 'Annonce'}
                </Badge>
                <span className="font-medium text-foreground">{target.name}</span>
                {target.currentPrice && (
                  <span className="text-muted-foreground">• {formatPrice(target.currentPrice)}</span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 py-3 border-b">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (step.id === 'type') goToStep('type');
                  else if (step.id === 'options' && isTypeStepValid) goToStep('options');
                  else if (step.id === 'summary' && isTypeStepValid) goToStep('summary');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

        {/* Alert limit warning */}
        {!canActivate && (
          <Alert className="mx-4 mt-3 border-amber-500/50 bg-amber-500/5">
            <Lock className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Limite atteinte ({activeAlertsCount}/{maxAlerts}). L'alerte sera créée inactive.
              </span>
              {plan !== "pro" && (
                <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary">
                  <Link to="/account?tab=subscription">
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          {/* Step 1: Type */}
          {currentStep === 'type' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Choisissez le type d'alerte</h3>
                <Badge variant="outline" className="text-xs">
                  {activeAlertsCount}/{maxAlerts} alertes
                </Badge>
              </div>

              <RadioGroup
                value={alertType}
                onValueChange={(v) => setAlertType(v as AlertType)}
                className="grid gap-2"
              >
                {availableTypes.map((type) => (
                  <div
                    key={type}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      alertType === type 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'hover:bg-muted/50 hover:border-muted-foreground/20'
                    }`}
                    onClick={() => setAlertType(type)}
                  >
                    <RadioGroupItem value={type} id={type} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer font-medium">
                        <span className={`p-1.5 rounded ${getAlertTypeColor(type)}`}>
                          {getAlertTypeIcon(type)}
                        </span>
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
                <Card className="mt-4 border-dashed">
                  <CardContent className="p-4 space-y-3">
                    <Label className="flex items-center gap-2">
                      {alertType === 'price_below' ? (
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                      Seuil de prix
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={priceThreshold}
                          onChange={(e) => setPriceThreshold(e.target.value)}
                          placeholder="Ex: 300"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                      </div>
                      {target?.currentPrice && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Prix actuel</p>
                          <p className="font-medium">{formatPrice(target.currentPrice)}</p>
                        </div>
                      )}
                    </div>
                    {target?.currentPrice && priceThreshold && (
                      <p className="text-xs text-muted-foreground">
                        {alertType === 'price_below' 
                          ? `Vous serez notifié si le prix passe sous ${formatPrice(parseFloat(priceThreshold))} (${Math.round((1 - parseFloat(priceThreshold) / target.currentPrice) * 100)}% de réduction)`
                          : `Vous serez notifié si le prix dépasse ${formatPrice(parseFloat(priceThreshold))} (+${Math.round((parseFloat(priceThreshold) / target.currentPrice - 1) * 100)}%)`
                        }
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {alertType === 'variation' && (
                <Card className="mt-4 border-dashed">
                  <CardContent className="p-4 space-y-4">
                    <Label className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-amber-500" />
                      Seuil de variation
                    </Label>
                    <div className="space-y-3">
                      <Slider
                        value={[variationThreshold]}
                        onValueChange={(v) => setVariationThreshold(v[0])}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span className="font-medium text-foreground text-sm">{variationThreshold}%</span>
                        <span>50%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Notifié quand le prix varie de plus de {variationThreshold}% par rapport au dernier prix connu
                    </p>
                  </CardContent>
                </Card>
              )}

              {alertType === 'location' && (
                <Card className="mt-4 border-dashed">
                  <CardContent className="p-4 space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      Région cible
                    </Label>
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
                    {!region && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Sélectionnez une région pour continuer
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Options */}
          {currentStep === 'options' && (
            <div className="space-y-5">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Affinez vos critères (optionnel)
              </h3>

              <div className="grid gap-4">
                {/* Condition */}
                <div className="space-y-2">
                  <Label className="text-sm">État du produit</Label>
                  <Select
                    value={condition || "__all__"}
                    onValueChange={(v) => setCondition(v === "__all__" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les états" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous les états</SelectItem>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label className="text-sm">Plateforme</Label>
                  <Select
                    value={platform || "__all__"}
                    onValueChange={(v) => setPlatform(v === "__all__" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les plateformes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Toutes les plateformes</SelectItem>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Region (si pas déjà sélectionnée) */}
                {alertType !== 'location' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Région</Label>
                    <Select
                      value={region || "__all__"}
                      onValueChange={(v) => setRegion(v === "__all__" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les régions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Toutes les régions</SelectItem>
                        {REGIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cooldown */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Fréquence des notifications
                </Label>
                <RadioGroup value={cooldown} onValueChange={setCooldown} className="grid gap-2">
                  {COOLDOWNS.map((c) => (
                    <div
                      key={c.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        cooldown === c.value 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCooldown(c.value)}
                    >
                      <RadioGroupItem value={c.value} id={`cooldown-${c.value}`} />
                      <div className="flex-1">
                        <Label htmlFor={`cooldown-${c.value}`} className="cursor-pointer font-medium text-sm">
                          {c.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Résumé de votre alerte
              </h3>

              <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-4">
                  {summaryItems.map((item, index) => (
                    <div key={index} className={`flex items-start gap-3 ${item.highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <div className={`p-1.5 rounded ${item.highlight ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`text-sm ${item.highlight ? 'font-medium' : ''}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Status after creation */}
              <Alert className={canActivate ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
                {canActivate ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-amber-500" />
                )}
                <AlertDescription className="text-sm">
                  {canActivate ? (
                    <span className="text-green-700 dark:text-green-300">
                      Cette alerte sera <strong>active immédiatement</strong> après création.
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300">
                      Cette alerte sera créée <strong>inactive</strong> (limite atteinte: {activeAlertsCount}/{maxAlerts}).
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Alertes actives après création</span>
                  <span>{canActivate ? activeAlertsCount + 1 : activeAlertsCount} / {maxAlerts}</span>
                </div>
                <Progress 
                  value={((canActivate ? activeAlertsCount + 1 : activeAlertsCount) / maxAlerts) * 100} 
                  className={`h-1.5 ${(canActivate ? activeAlertsCount + 1 : activeAlertsCount) >= maxAlerts ? '[&>div]:bg-amber-500' : ''}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={currentStep === 'type' ? onClose : prevStep}
            disabled={createAlert.isPending}
          >
            {currentStep === 'type' ? (
              'Annuler'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour
              </>
            )}
          </Button>

          {currentStep === 'summary' ? (
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
                  <Check className="h-4 w-4" />
                  Créer l'alerte
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              disabled={!isTypeStepValid}
              className="gap-2"
            >
              Continuer
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
