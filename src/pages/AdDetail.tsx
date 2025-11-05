import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  Phone,
  Mail,
} from "lucide-react";
import { mockAds, mockModels } from "@/lib/mockData";

export default function AdDetail() {
  const { id } = useParams();
  const ad = mockAds.find((a) => a.id === id);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  if (!ad) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <Card className="p-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Annonce introuvable</h2>
              <p className="text-muted-foreground mb-4">
                L'annonce que vous recherchez n'existe pas ou a été supprimée.
              </p>
              <Link to="/deals">
                <Button>Retour aux deals</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Get model info
  const model = mockModels.find((m) => m.name === ad.model);

  // Generate price history with comparison
  const priceHistory = ad.priceHistory || [
    { date: "2025-01-01", adPrice: ad.price + 30, marketPrice: ad.fairValue + 10 },
    { date: "2025-01-05", adPrice: ad.price + 20, marketPrice: ad.fairValue + 5 },
    { date: "2025-01-10", adPrice: ad.price + 10, marketPrice: ad.fairValue },
    { date: "2025-01-15", adPrice: ad.price, marketPrice: ad.fairValue - 5 },
  ];

  // Similar ads
  const similarAds = mockAds
    .filter((a) => a.id !== ad.id && a.component === ad.component)
    .slice(0, 3);

  // Calculate savings and risk
  const savingsAmount = ad.fairValue - ad.price;
  const savingsPercent = Math.round((savingsAmount / ad.fairValue) * 100);
  const potentialMargin = Math.round(ad.fairValue * 0.9 - ad.price);
  const marginPercent = Math.round((potentialMargin / ad.price) * 100);

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
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
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{ad.component}</Badge>
                      <Badge variant={ad.dealScore > 85 ? "default" : "secondary"}>
                        {ad.dealScore > 85 && <Flame className="h-3 w-3 mr-1" />}
                        Score: {ad.dealScore}/100
                      </Badge>
                      <Badge
                        variant={
                          ad.condition === "Neuf" || ad.condition === "Comme neuf"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ad.condition}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
                    <p className="text-muted-foreground">Référence: #{ad.id.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{ad.price}€</div>
                    <div className="text-sm text-muted-foreground line-through mt-1">
                      Fair Value: {ad.fairValue}€
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Localisation</div>
                      <div className="font-medium">{ad.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Publié le</div>
                      <div className="font-medium">
                        {new Date(ad.date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Vendeur</div>
                      <div className="font-medium">{ad.seller}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Livraison</div>
                      <div className="font-medium">{ad.shipping ? "Oui" : "Non"}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Price Analysis */}
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  Analyse de prix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Fair Value</span>
                      <span className="text-xl font-bold">{ad.fairValue}€</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Prix annonce</span>
                      <span className="text-xl font-bold text-primary">{ad.price}€</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Économie</span>
                      <span className="text-xl font-bold text-success">
                        -{savingsAmount}€ ({savingsPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-sm mb-1">Excellent deal</div>
                          <div className="text-xs text-muted-foreground">
                            Prix {savingsPercent}% sous la valeur marché. Forte opportunité de
                            revente.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Marge potentielle</span>
                        <span className="font-bold text-accent">+{potentialMargin}€</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Revente à {Math.round(ad.fairValue * 0.9)}€ (10% sous Fair Value)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution du prix de cette annonce</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <ReferenceLine
                      y={ad.fairValue}
                      stroke="hsl(var(--success))"
                      strokeDasharray="5 5"
                      label={{
                        value: "Fair Value",
                        position: "right",
                        fill: "hsl(var(--success))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adPrice"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Prix annonce"
                    />
                    <Line
                      type="monotone"
                      dataKey="marketPrice"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Marché"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Le vendeur a baissé son prix de {savingsAmount}€ en 15 jours. Le prix
                    actuel est particulièrement attractif.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {ad.title} en {ad.condition.toLowerCase()}. Produit fonctionnel et testé.{" "}
                  {ad.shipping && "Envoi possible en Colissimo suivi."} Facture disponible.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Emballage d'origine {ad.condition === "Neuf" ? "scellé" : "conservé"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Garantie constructeur valide</span>
                  </div>
                  {ad.shipping && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Livraison possible (frais en supplément)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Similar Ads */}
            <Card>
              <CardHeader>
                <CardTitle>Annonces similaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {similarAds.map((similar) => (
                    <Link key={similar.id} to={`/ad/${similar.id}`}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{similar.title}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {similar.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(similar.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold">{similar.price}€</div>
                          <Badge variant={similar.dealScore > 85 ? "default" : "secondary"} className="text-xs">
                            Score: {similar.dealScore}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" size="lg" asChild>
                  <a
                    href={`https://www.leboncoin.fr/ad/${ad.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir sur Leboncoin
                  </a>
                </Button>
                <Button
                  variant={addedToWatchlist ? "secondary" : "outline"}
                  className="w-full gap-2"
                  onClick={() => setAddedToWatchlist(!addedToWatchlist)}
                >
                  <Eye className="h-4 w-4" />
                  {addedToWatchlist ? "Retiré de la watchlist" : "Ajouter à la watchlist"}
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendeur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {ad.seller === "Particulier" ? "Jean M." : "TechStore Pro"}
                      </div>
                      <div className="text-sm text-muted-foreground">{ad.seller}</div>
                    </div>
                  </div>

                  {ad.seller === "Professionnel" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>Vendeur vérifié</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>Garantie retour 14j</span>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Membre depuis: </span>
                      <span className="font-medium">Mars 2023</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Annonces actives: </span>
                      <span className="font-medium">
                        {ad.seller === "Professionnel" ? "47" : "3"}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-2 mt-4" disabled>
                    <Phone className="h-4 w-4" />
                    Voir le numéro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Insights */}
            {model && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Infos marché</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prix médian marché</span>
                    <span className="font-semibold">{model.medianPrice}€</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Volume annonces</span>
                    <span className="font-semibold">{model.volume}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Variation 7j</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        model.priceChange7d < 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {model.priceChange7d < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {model.priceChange7d.toFixed(1)}%
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <Link to={`/model/${model.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Voir fiche modèle
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Conseils sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Privilégiez la remise en main propre</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Vérifiez l'état avant paiement</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Demandez la facture d'achat</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Testez le matériel si possible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
