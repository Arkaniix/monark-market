import { useState, useMemo } from "react";
import { Bell, Plus, Trash2, RefreshCw, AlertCircle, TrendingDown, TrendingUp, Power, Pencil, ChevronLeft, ChevronRight, Target, Package, Clock, BarChart3, X, Check, MapPin, Sparkles, Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useUpdateAlert, useDeleteAlert } from "@/hooks/useProviderData";
import { useEntitlements } from "@/hooks/useEntitlements";
import { AlertLimitModal } from "@/components/alerts/AlertLimitModal";
import type { Alert as AlertType } from "@/providers/types";

interface AlertsTabProps {
  alerts: AlertType[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const ITEMS_PER_PAGE = 5;

// Analyse des alertes pour générer des métriques utiles
const analyzeAlerts = (alerts: AlertType[]) => {
  const activeAlerts = alerts.filter(a => a.is_active);
  const inactiveAlerts = alerts.filter(a => !a.is_active);
  
  // Répartition par type
  const byType = alerts.reduce((acc, alert) => {
    acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Répartition par cible
  const modelAlerts = alerts.filter(a => a.target_type === 'model');
  const adAlerts = alerts.filter(a => a.target_type === 'ad');
  
  // Alertes avec seuils de prix
  const priceAlerts = alerts.filter(a => a.price_threshold);
  const avgThreshold = priceAlerts.length > 0 
    ? priceAlerts.reduce((sum, a) => sum + (a.price_threshold || 0), 0) / priceAlerts.length 
    : 0;
  
  // Alertes créées récemment (7 derniers jours)
  const recentAlerts = alerts.filter(a => {
    const createdAt = new Date(a.created_at);
    const weekAgo = subDays(new Date(), 7);
    return createdAt >= weekAgo;
  });

  return {
    total: alerts.length,
    active: activeAlerts.length,
    inactive: inactiveAlerts.length,
    byType,
    modelAlerts: modelAlerts.length,
    adAlerts: adAlerts.length,
    avgThreshold,
    recentAlerts: recentAlerts.length,
  };
};

export function AlertsTab({ alerts, isLoading, error, refetch }: AlertsTabProps) {
  // Entitlements for plan-based limits
  const { plan, limits, helpers } = useEntitlements();
  const activeAlertsCount = helpers.getActiveAlertsCount();
  const maxAlerts = limits.maxAlerts;
  const canActivate = helpers.canActivateAlert();

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  
  // Modal édition
  const [editingAlert, setEditingAlert] = useState<AlertType | null>(null);
  const [editAlertType, setEditAlertType] = useState<string>("");
  const [editThreshold, setEditThreshold] = useState<string>("");
  
  // Modal limite atteinte
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Mutations
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();
  
  // Analyse des alertes
  const alertStats = useMemo(() => analyzeAlerts(alerts), [alerts]);

  // Filtrage
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && alert.is_active) ||
        (statusFilter === "inactive" && !alert.is_active);
      const matchesType = typeFilter === "all" || alert.alert_type === typeFilter;
      const matchesTarget = targetFilter === "all" || alert.target_type === targetFilter;
      return matchesStatus && matchesType && matchesTarget;
    });
  }, [alerts, statusFilter, typeFilter, targetFilter]);

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAlerts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlerts, page]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'deal_detected':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'price_above':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'variation':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'location':
        return <MapPin className="h-4 w-4 text-purple-500" />;
      case 'new_listing':
        return <Package className="h-4 w-4 text-cyan-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'deal_detected':
        return 'Bonne affaire';
      case 'price_above':
        return 'Prix au-dessus';
      case 'price_below':
        return 'Prix en-dessous';
      case 'variation':
        return 'Variation';
      case 'location':
        return 'Localisation';
      case 'new_listing':
        return 'Nouvelle annonce';
      default:
        return type;
    }
  };

  const getConditionText = (alert: AlertType) => {
    switch (alert.alert_type) {
      case 'deal_detected':
        return 'Bonne affaire détectée';
      case 'price_below':
        return alert.price_threshold ? `Prix < ${formatPrice(alert.price_threshold)}` : 'Prix en baisse';
      case 'price_above':
        return alert.price_threshold ? `Prix > ${formatPrice(alert.price_threshold)}` : 'Prix en hausse';
      case 'variation':
        return alert.variation_threshold ? `Variation > ${alert.variation_threshold}%` : 'Variation de prix';
      case 'location':
        return alert.region ? `Région: ${alert.region}` : 'Localisation spécifique';
      case 'new_listing':
        return 'Nouvelle annonce correspondante';
      default:
        return 'Alerte active';
    }
  };

  const handleToggleActive = async (alert: AlertType) => {
    // If trying to activate and limit reached, show modal
    if (!alert.is_active && !canActivate) {
      setShowLimitModal(true);
      return;
    }
    
    await updateAlert.mutateAsync({
      id: alert.id,
      data: { is_active: !alert.is_active }
    });
  };

  const handleDelete = async (id: number) => {
    await deleteAlert.mutateAsync(id);
  };

  const openEditModal = (alert: AlertType) => {
    setEditingAlert(alert);
    setEditAlertType(alert.alert_type);
    setEditThreshold(alert.price_threshold?.toString() || "");
  };

  const handleSaveEdit = async () => {
    if (!editingAlert) return;
    await updateAlert.mutateAsync({
      id: editingAlert.id,
      data: {
        alert_type: editAlertType as AlertType['alert_type'],
        price_threshold: editThreshold ? parseFloat(editThreshold) : undefined,
      }
    });
    setEditingAlert(null);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setTargetFilter("all");
    setPage(1);
  };

  // Skeleton
  const ListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const start = (page - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(page * ITEMS_PER_PAGE, filteredAlerts.length);
    
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {start}-{end} sur {filteredAlerts.length}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Dashboard alertes - Statistiques réelles */}
      <Card className="bg-gradient-to-br from-amber-500/5 via-transparent to-transparent border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Vue d'ensemble
            </span>
            <Badge variant="outline" className="gap-1 text-xs">
              {plan === "starter" && <Bell className="h-3 w-3" />}
              {plan === "pro" && <Crown className="h-3 w-3 text-primary" />}
              {plan === "elite" && <Crown className="h-3 w-3 text-amber-500" />}
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Alertes actives avec jauge limite */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Alertes actives</p>
                <p className="text-xs font-medium">
                  {activeAlertsCount} / {maxAlerts}
                </p>
              </div>
              <Progress 
                value={(activeAlertsCount / maxAlerts) * 100} 
                className={`h-2 ${activeAlertsCount >= maxAlerts ? '[&>div]:bg-amber-500' : ''}`}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={activeAlertsCount >= maxAlerts ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}>
                  {activeAlertsCount >= maxAlerts ? (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Limite atteinte
                    </span>
                  ) : (
                    `${maxAlerts - activeAlertsCount} disponibles`
                  )}
                </span>
                {activeAlertsCount >= maxAlerts && plan !== "elite" && (
                  <Link to="/account?tab=subscription" className="text-primary hover:underline flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Augmenter
                  </Link>
                )}
              </div>
            </div>

            {/* Répartition cibles */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cibles surveillées</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-500" />
                  <span className="font-bold">{alertStats.modelAlerts}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-purple-500" />
                  <span className="font-bold">{alertStats.adAlerts}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">modèles / annonces</p>
            </div>

            {/* Seuil moyen */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Seuil prix moyen</p>
              <p className="text-xl font-bold">
                {alertStats.avgThreshold > 0 ? formatPrice(alertStats.avgThreshold) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">sur les alertes prix</p>
            </div>

            {/* Types d'alertes */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Types configurés</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(alertStats.byType).slice(0, 3).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs gap-1">
                    {getAlertIcon(type)}
                    {count}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {alertStats.recentAlerts > 0 ? `+${alertStats.recentAlerts} cette semaine` : 'Aucune récente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste alertes */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-amber-500" />
                Mes alertes
                <Badge variant="outline">{filteredAlerts.length}</Badge>
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Panneau de contrôle de vos alertes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Link to="/catalog">
                <Button size="sm" className="gap-2 h-8">
                  <Plus className="h-4 w-4" />
                  Créer
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="deal_detected">Bonne affaire</SelectItem>
                <SelectItem value="price_below">Prix en-dessous</SelectItem>
                <SelectItem value="price_above">Prix au-dessus</SelectItem>
                <SelectItem value="variation">Variation</SelectItem>
                <SelectItem value="location">Localisation</SelectItem>
                <SelectItem value="new_listing">Nouvelle annonce</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={(v) => { setTargetFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue placeholder="Cible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes cibles</SelectItem>
                <SelectItem value="model">Modèles</SelectItem>
                <SelectItem value="ad">Annonces</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== "all" || typeFilter !== "all" || targetFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                <X className="h-3 w-3" />
                Réinitialiser
              </Button>
            )}
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Impossible de charger les alertes.
                <Button variant="link" className="p-0 ml-2" onClick={refetch}>
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                <Bell className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {alerts.length === 0 ? "Aucune alerte configurée" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {alerts.length === 0 
                  ? "Créez des alertes pour être notifié quand un modèle atteint votre prix cible ou qu'une bonne affaire apparaît." 
                  : "Aucune alerte ne correspond à vos critères de filtrage."}
              </p>
              {alerts.length === 0 ? (
                <Link to="/catalog">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une alerte
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors group ${
                      alert.is_active ? 'bg-card hover:bg-muted/50' : 'bg-muted/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icône type */}
                      <div className={`p-2.5 rounded-lg shrink-0 ${alert.is_active ? 'bg-amber-500/10' : 'bg-muted'}`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      
                      {/* Infos principales */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-medium truncate ${!alert.is_active && 'text-muted-foreground'}`}>
                            {alert.target_name || `Cible #${alert.target_id}`}
                          </span>
                          <Badge variant={alert.target_type === 'model' ? 'default' : 'secondary'} className="text-xs">
                            {alert.target_type === 'model' ? (
                              <><Target className="h-3 w-3 mr-1" />Modèle</>
                            ) : (
                              <><Package className="h-3 w-3 mr-1" />Annonce</>
                            )}
                          </Badge>
                          {!alert.is_active && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        
                        {/* Condition */}
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`font-medium ${
                            alert.alert_type === 'deal_detected' ? 'text-green-600 dark:text-green-400' :
                            alert.alert_type === 'price_below' ? 'text-blue-600 dark:text-blue-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {getConditionText(alert)}
                          </span>
                          {alert.target_category && (
                            <span className="text-muted-foreground">• {alert.target_category}</span>
                          )}
                        </div>

                        {/* Infos secondaires */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          {alert.current_price && (
                            <span>Prix actuel: {formatPrice(alert.current_price)}</span>
                          )}
                          {/* Date de création - toujours affichée */}
                          <span className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Créée {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: fr })}
                          </span>
                          {/* Date de déclenchement - uniquement si déclenchée */}
                          {alert.last_triggered_at && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Bell className="h-3 w-3" />
                              Déclenchée {formatDistanceToNow(new Date(alert.last_triggered_at), { addSuffix: true, locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      {/* Bouton Activer/Désactiver avec gestion limite */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${!alert.is_active && !canActivate ? 'opacity-50' : ''}`}
                        onClick={() => handleToggleActive(alert)}
                        title={
                          alert.is_active 
                            ? "Désactiver" 
                            : canActivate 
                              ? "Activer" 
                              : `Limite atteinte (${activeAlertsCount}/${maxAlerts})`
                        }
                      >
                        {!alert.is_active && !canActivate ? (
                          <Lock className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Power className={`h-4 w-4 ${alert.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(alert)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(alert.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal édition */}
      <Dialog open={!!editingAlert} onOpenChange={(open) => !open && setEditingAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'alerte</DialogTitle>
            <DialogDescription>
              {editingAlert?.target_name || `Cible #${editingAlert?.target_id}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type d'alerte</Label>
              <Select value={editAlertType} onValueChange={setEditAlertType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deal_detected">Bonne affaire détectée</SelectItem>
                  <SelectItem value="price_below">Prix en-dessous du seuil</SelectItem>
                  <SelectItem value="price_above">Prix au-dessus du seuil</SelectItem>
                  <SelectItem value="variation">Variation de prix</SelectItem>
                  <SelectItem value="location">Localisation spécifique</SelectItem>
                  <SelectItem value="new_listing">Nouvelle annonce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editAlertType === 'price_below' || editAlertType === 'price_above') && (
              <div className="space-y-2">
                <Label>Seuil de prix (€)</Label>
                <Input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                  placeholder="Ex: 300"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAlert(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} className="gap-2">
              <Check className="h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal limite atteinte */}
      <AlertLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentPlan={plan}
        activeAlerts={activeAlertsCount}
        maxAlerts={maxAlerts}
      />
    </div>
  );
}
