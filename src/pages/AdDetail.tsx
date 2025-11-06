import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Truck,
  User,
  Eye,
  Share2,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Star,
  Bell,
  Flag,
  Calculator,
  ShieldAlert,
  CreditCard,
  MapPinned,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockAdDetail,
  mockPriceHistory,
  mockSimilarAds,
  mockMarketComparison,
  mockModelPriceSeries,
  getStatusBadge,
  getStateLabel,
  getScoreColor,
  getPriceDifference,
  generateAnalysis,
} from "@/lib/adDetailMockData";

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inWatchlist, setInWatchlist] = useState(false);

  // Use mock data (in real app, fetch by id)
  const ad = mockAdDetail;
  const statusBadge = getStatusBadge(ad.status);
  const priceDiff = getPriceDifference(ad.price, ad.price_median_model);
  const analysis = generateAnalysis(ad);

  const handleToggleWatchlist = () => {
    setInWatchlist(!inWatchlist);
    toast.success(inWatchlist ? "Retiré de la watchlist" : "Ajouté à la watchlist");
  };

  const handleCreateAlert = () => {
    toast.success("Alerte créée pour ce modèle");
  };

  const handleEstimate = () => {
    navigate(`/estimator?model=${ad.model_id}`);
  };

  const handleReport = () => {
    toast.info("Signalement envoyé à l'équipe modération");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Back Button */}
        <Link to="/deals">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux deals
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline">{ad.category}</Badge>
                        <Badge variant={statusBadge.variant} className={statusBadge.color}>
                          {statusBadge.label}
                        </Badge>
                        <Badge variant={ad.score_market >= 80 ? "default" : "secondary"}>
                          {ad.score_market >= 85 && <Flame className="h-3 w-3 mr-1" />}
                          Score: {ad.score_market}/100
                        </Badge>
                        <Badge variant="secondary">{getStateLabel(ad.state)}</Badge>
                      </div>
                      <h1 className="text-3xl font-bold mb-2">
                        {ad.category} d'occasion ({getStateLabel(ad.state)}) – {ad.model_name}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Référence: #{ad.ad_id}</span>
                        <Link
                          to={`/model/${ad.model_id}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Voir fiche modèle
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Actualisée il y a{" "}
                        {Math.round(
                          (Date.now() - new Date(ad.last_seen).getTime()) / (1000 * 60 * 60)
                        )}{" "}
                        h
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">{ad.price} €</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Médiane marché: {ad.price_median_model} €
                      </div>
                      <Badge variant={priceDiff.isGoodDeal ? "default" : "destructive"} className="mt-2">
                        {priceDiff.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Price & Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Prix et analyse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price comparison */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Prix actuel</div>
                      <div className="text-2xl font-bold text-primary">{ad.price} €</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Prix médian modèle</div>
                      <div className="text-2xl font-bold">{ad.price_median_model} €</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Écart</div>
                      <div className={`text-2xl font-bold ${priceDiff.color}`}>
                        {priceDiff.diffPercent} %
                      </div>
                    </div>
                  </div>

                  {/* Additional metrics */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tendance marché (30j)</span>
                        <span className="font-semibold flex items-center gap-1">
                          {ad.var_market_30d_pct < 0 ? (
                            <TrendingDown className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          )}
                          {ad.var_market_30d_pct.toFixed(1)} %
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Indice de rareté</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <Progress value={ad.rarity_index * 100} className="h-2" />
                          <span className="font-semibold text-xs">{(ad.rarity_index * 100).toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Note d'attractivité</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-semibold">
                            {(ad.score_market / 20).toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">{analysis}</AlertDescription>
                    </Alert>
                  </div>

                  {/* Mini price history chart */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Historique de prix</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockPriceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Technical Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Détails techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Catégorie</div>
                        <div className="font-medium">{ad.category}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Modèle</div>
                        <div className="font-medium">{ad.model_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Condition</div>
                        <div className="font-medium">{getStateLabel(ad.state)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Type vendeur</div>
                        <div className="font-medium capitalize">{ad.seller_type}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        {ad.delivery_possible ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Livraison possible</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {ad.secured_payment ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Paiement sécurisé</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {ad.remise_main_propre ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Remise en main propre</span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Description synthétique</div>
                    <p className="text-sm leading-relaxed">{ad.description_simplified}</p>
                  </div>
                  <div className="mt-4">
                    <Link to={`/model/${ad.model_id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        Afficher les spécifications du modèle
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location & Availability */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinned className="h-5 w-5" />
                    Localisation et disponibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Ville</div>
                          <div className="font-medium">{ad.city}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Code postal</div>
                          <div className="font-medium">{ad.postal_code}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Région</div>
                          <div className="font-medium">{ad.region}</div>
                        </div>
                      </div>
                      {ad.distance_km && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Distance</div>
                            <div className="font-medium">à {ad.distance_km} km de ta position</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertDescription className="text-sm space-y-2">
                        <p>Livraison disponible via LBC ou remise locale.</p>
                        <p>Paiement sécurisé recommandé.</p>
                        <p className="font-semibold">Vérifie la réputation du vendeur avant transaction.</p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* History Tracking */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Historique de suivi</CardTitle>
                  <CardDescription>Évolution du prix et du statut de l'annonce</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPriceHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <div className="font-medium text-sm">{entry.date}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {entry.modification || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{entry.price} €</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Comparison Charts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison avec le marché</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Histogram */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      Distribution des prix (annonces actives)
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={mockMarketComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {mockMarketComparison.map((entry, index) => (
                            <Bar
                              key={index}
                              dataKey="count"
                              fill={entry.is_current ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Line comparison */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Évolution marché vs annonce</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={mockModelPriceSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="median"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="Prix médian modèle"
                        />
                        <Line
                          type="monotone"
                          dataKey="ad_price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          name="Prix annonce"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Similar Ads */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Annonces similaires</CardTitle>
                  <CardDescription>Même modèle dans la région</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {mockSimilarAds.map((similar) => (
                      <Link key={similar.ad_id} to={`/ad/${similar.ad_id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{similar.model_name}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {similar.city}, {similar.region}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getStateLabel(similar.state)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold">{similar.price} €</div>
                            <div className={`text-xs font-semibold mt-1 ${getScoreColor(similar.score)}`}>
                              Score: {similar.score}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RGPD Notice */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-xs leading-relaxed">
                  Les titres, descriptions et images originales de cette annonce ne sont pas affichés
                  conformément au RGPD et aux conditions d'utilisation des plateformes sources. Les données
                  présentées ici sont dérivées, anonymisées et agrégées à des fins d'analyse de marché.
                  <Link to="/formation#rgpd" className="text-primary hover:underline ml-1">
                    Lire la charte RGPD
                  </Link>
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions utilisateur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gap-2" size="lg" asChild>
                    <a href={ad.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Voir sur Leboncoin
                    </a>
                  </Button>
                  <Button
                    variant={inWatchlist ? "secondary" : "outline"}
                    className="w-full gap-2"
                    onClick={handleToggleWatchlist}
                  >
                    <Eye className="h-4 w-4" />
                    {inWatchlist ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleCreateAlert}>
                    <Bell className="h-4 w-4" />
                    Créer une alerte
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleEstimate}>
                    <Calculator className="h-4 w-4" />
                    Lancer l'Estimator
                  </Button>
                  <Separator />
                  <Button variant="ghost" size="sm" className="w-full gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-destructive"
                    onClick={handleReport}
                  >
                    <Flag className="h-4 w-4" />
                    Signaler un problème
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Publication info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Publié le</span>
                    <span className="font-medium">
                      {new Date(ad.publication_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dernière vue</span>
                    <span className="font-medium">
                      {new Date(ad.last_seen).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
