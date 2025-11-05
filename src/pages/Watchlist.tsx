import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Eye,
  Bell,
  TrendingDown,
  TrendingUp,
  Trash2,
  Settings,
  Zap,
  AlertCircle,
  Plus,
  Search,
  Activity,
} from "lucide-react";
import { mockModels } from "@/lib/mockData";
import ScrapModal from "@/components/ScrapModal";

interface WatchlistItem {
  modelId: string;
  addedAt: string;
  alertThreshold: number; // percentage
  alertType: "below" | "above" | "both";
  lastNotification?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Watchlist() {
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [selectedModelForScan, setSelectedModelForScan] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [selectedModelToAdd, setSelectedModelToAdd] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("10");
  const [alertType, setAlertType] = useState<"below" | "above" | "both">("below");

  // Mock watchlist items
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([
    {
      modelId: "1",
      addedAt: "2025-01-10",
      alertThreshold: 10,
      alertType: "below",
      lastNotification: "2025-01-14",
    },
    {
      modelId: "3",
      addedAt: "2025-01-08",
      alertThreshold: 5,
      alertType: "both",
    },
    {
      modelId: "4",
      addedAt: "2025-01-12",
      alertThreshold: 15,
      alertType: "below",
    },
  ]);

  // Mock alerts
  const alerts = [
    {
      id: "1",
      modelId: "1",
      type: "price_drop",
      message: "RTX 4060 Ti a baissé de 12% cette semaine !",
      date: "2025-01-14",
      isNew: true,
    },
    {
      id: "2",
      modelId: "4",
      type: "price_drop",
      message: "Samsung 980 Pro 2TB a baissé sous votre seuil d'alerte",
      date: "2025-01-13",
      isNew: true,
    },
    {
      id: "3",
      modelId: "3",
      type: "info",
      message: "Ryzen 7 7800X3D - Nouvelle analyse disponible (45 annonces)",
      date: "2025-01-12",
      isNew: false,
    },
  ];

  const handleRemoveItem = (modelId: string) => {
    setWatchlistItems(watchlistItems.filter((item) => item.modelId !== modelId));
  };

  const handleEditItem = (item: WatchlistItem) => {
    setEditingItem(item);
    setAlertThreshold(item.alertThreshold.toString());
    setAlertType(item.alertType);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setWatchlistItems(
        watchlistItems.map((item) =>
          item.modelId === editingItem.modelId
            ? { ...item, alertThreshold: parseFloat(alertThreshold), alertType }
            : item
        )
      );
      setShowEditDialog(false);
      setEditingItem(null);
    }
  };

  const handleAddToWatchlist = () => {
    if (selectedModelToAdd && !watchlistItems.find((i) => i.modelId === selectedModelToAdd)) {
      setWatchlistItems([
        ...watchlistItems,
        {
          modelId: selectedModelToAdd,
          addedAt: new Date().toISOString().split("T")[0],
          alertThreshold: parseFloat(alertThreshold),
          alertType,
        },
      ]);
      setShowAddDialog(false);
      setSelectedModelToAdd("");
      setAlertThreshold("10");
      setAlertType("below");
    }
  };

  const handleLaunchScan = (modelId: string) => {
    setSelectedModelForScan(modelId);
    setShowScrapModal(true);
  };

  // Get available models not in watchlist
  const availableModels = mockModels.filter(
    (model) => !watchlistItems.find((item) => item.modelId === model.id)
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Watchlist</h1>
            <p className="text-muted-foreground">
              Suivez {watchlistItems.length} modèle{watchlistItems.length > 1 ? "s" : ""} et
              recevez des alertes personnalisées
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un modèle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter à la watchlist</DialogTitle>
                <DialogDescription>
                  Sélectionnez un modèle et configurez vos alertes de prix
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model-select">Modèle</Label>
                  <Select value={selectedModelToAdd} onValueChange={setSelectedModelToAdd}>
                    <SelectTrigger id="model-select" className="bg-background mt-2">
                      <SelectValue placeholder="Choisir un modèle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} - {model.medianPrice}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="threshold">Seuil d'alerte (%)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    placeholder="10"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous serez alerté si le prix varie de plus de ce pourcentage
                  </p>
                </div>

                <div>
                  <Label htmlFor="alert-type">Type d'alerte</Label>
                  <Select value={alertType} onValueChange={(v) => setAlertType(v as any)}>
                    <SelectTrigger id="alert-type" className="bg-background mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="below">Baisse de prix uniquement</SelectItem>
                      <SelectItem value="above">Hausse de prix uniquement</SelectItem>
                      <SelectItem value="both">Baisse et hausse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAddToWatchlist}
                    disabled={!selectedModelToAdd}
                    className="flex-1"
                  >
                    Ajouter
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alertes récentes ({alerts.filter((a) => a.isNew).length} nouvelles)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const model = mockModels.find((m) => m.id === alert.modelId);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.isNew ? "bg-background border-primary/30" : "bg-muted/50"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          alert.type === "price_drop"
                            ? "bg-success/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {alert.type === "price_drop" ? (
                          <TrendingDown className="h-5 w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{model?.name}</span>
                          {alert.isNew && (
                            <Badge variant="default" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLaunchScan(alert.modelId)}
                      >
                        Scanner
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Items */}
        {watchlistItems.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-6"
          >
            {watchlistItems.map((item) => {
              const model = mockModels.find((m) => m.id === item.modelId);
              if (!model) return null;

              return (
                <motion.div key={item.modelId} variants={itemVariants}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{model.category}</Badge>
                            <Badge
                              variant={
                                item.alertType === "below"
                                  ? "default"
                                  : item.alertType === "above"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="gap-1"
                            >
                              <Bell className="h-3 w-3" />
                              {item.alertType === "below"
                                ? "Baisse"
                                : item.alertType === "above"
                                ? "Hausse"
                                : "Les deux"}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mb-1">{model.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{model.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{model.medianPrice}€</div>
                          <div
                            className={`text-sm font-medium flex items-center gap-1 justify-end ${
                              model.priceChange7d < 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {model.priceChange7d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            {model.priceChange7d.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Price Chart */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Évolution du prix (30j)
                          </div>
                          <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={model.priceHistory}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                              <XAxis dataKey="date" className="text-xs" hide />
                              <YAxis className="text-xs" hide />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value: number) => [`${value}€`, "Prix"]}
                              />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={
                                  model.priceChange30d < 0
                                    ? "hsl(var(--success))"
                                    : "hsl(var(--destructive))"
                                }
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Alert Info */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Seuil d'alerte</span>
                            <span className="font-semibold">±{item.alertThreshold}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Suivi depuis</span>
                            <span className="font-semibold">
                              {new Date(item.addedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {item.lastNotification && (
                            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                              <span className="text-muted-foreground">Dernière alerte</span>
                              <span className="font-semibold text-primary">
                                {new Date(item.lastNotification).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => handleLaunchScan(item.modelId)}
                          >
                            <Zap className="h-4 w-4" />
                            Scanner
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEditItem(item)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveItem(item.modelId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Votre watchlist est vide</h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez des modèles pour suivre leurs prix et recevoir des alertes
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter votre premier modèle
              </Button>
            </div>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier les alertes</DialogTitle>
              <DialogDescription>
                Ajustez les paramètres d'alerte pour{" "}
                {editingItem && mockModels.find((m) => m.id === editingItem.modelId)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-threshold">Seuil d'alerte (%)</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-alert-type">Type d'alerte</Label>
                <Select value={alertType} onValueChange={(v) => setAlertType(v as any)}>
                  <SelectTrigger id="edit-alert-type" className="bg-background mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="below">Baisse de prix uniquement</SelectItem>
                    <SelectItem value="above">Hausse de prix uniquement</SelectItem>
                    <SelectItem value="both">Baisse et hausse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scrap Modal */}
        <ScrapModal
          open={showScrapModal}
          onOpenChange={setShowScrapModal}
          preselectedModel={selectedModelForScan}
        />
      </div>
    </div>
  );
}
