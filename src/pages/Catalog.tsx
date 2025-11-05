import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Search, TrendingUp, TrendingDown, Activity, SlidersHorizontal } from "lucide-react";
import { mockModels } from "@/lib/mockData";

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

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(true);

  // Get unique brands
  const brands = Array.from(new Set(mockModels.map((m) => m.brand))).sort();

  // Filter models
  const filteredModels = mockModels
    .filter((model) => {
      if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterCategory !== "all" && model.category !== filterCategory) {
        return false;
      }
      if (filterBrand !== "all" && model.brand !== filterBrand) {
        return false;
      }
      if (filterRarity !== "all" && model.rarity !== filterRarity) {
        return false;
      }
      if (minPrice && model.medianPrice < parseInt(minPrice)) {
        return false;
      }
      if (maxPrice && model.medianPrice > parseInt(maxPrice)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.volume - a.volume;
      if (sortBy === "price-asc") return a.medianPrice - b.medianPrice;
      if (sortBy === "price-desc") return b.medianPrice - a.medianPrice;
      if (sortBy === "change") return a.priceChange30d - b.priceChange30d;
      return 0;
    });

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterBrand("all");
    setFilterRarity("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("popular");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catalogue</h1>
          <p className="text-muted-foreground">
            Explorez {mockModels.length} modèles de matériel informatique d'occasion
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un modèle (ex: RTX 4060, Ryzen 7...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Masquer" : "Afficher"} les filtres
          </Button>
          <div className="text-sm text-muted-foreground">
            {filteredModels.length} modèle{filteredModels.length > 1 ? "s" : ""} trouvé{filteredModels.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtres avancés</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="GPU">Cartes graphiques</SelectItem>
                    <SelectItem value="CPU">Processeurs</SelectItem>
                    <SelectItem value="RAM">Mémoire RAM</SelectItem>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="Motherboard">Cartes mères</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Marque" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Toutes marques</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Rareté" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Toutes raretés</SelectItem>
                    <SelectItem value="Commun">Commun</SelectItem>
                    <SelectItem value="Peu courant">Peu courant</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Très rare">Très rare</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Prix min (€)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-background"
                />

                <Input
                  type="number"
                  placeholder="Prix max (€)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-background"
                />

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="popular">Plus populaire</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="change">Plus forte baisse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Models Grid */}
        {filteredModels.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredModels.map((model) => (
              <motion.div key={model.id} variants={itemVariants}>
                <Link to={`/model/${model.id}`}>
                  <Card className="hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2">
                            {model.category}
                          </Badge>
                          <CardTitle className="text-lg leading-tight">
                            {model.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {model.brand}
                          </p>
                        </div>
                        <Badge
                          variant={
                            model.rarity === "Commun"
                              ? "secondary"
                              : model.rarity === "Peu courant"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {model.rarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Price */}
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Prix médian</div>
                            <div className="text-3xl font-bold">{model.medianPrice}€</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Volume</div>
                            <div className="text-lg font-semibold">{model.volume}</div>
                          </div>
                        </div>

                        {/* Price Changes */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">7 jours</div>
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                model.priceChange7d < 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {model.priceChange7d < 0 ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : model.priceChange7d > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <Activity className="h-4 w-4" />
                              )}
                              <span>{model.priceChange7d > 0 ? "+" : ""}{model.priceChange7d.toFixed(1)}%</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">30 jours</div>
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                model.priceChange30d < 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {model.priceChange30d < 0 ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : model.priceChange30d > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <Activity className="h-4 w-4" />
                              )}
                              <span>{model.priceChange30d > 0 ? "+" : ""}{model.priceChange30d.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Price History Sparkline */}
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground mb-2">
                            Évolution du prix (30j)
                          </div>
                          <ResponsiveContainer width="100%" height={60}>
                            <LineChart data={model.priceHistory}>
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

                        {/* Last Update */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Dernière mise à jour : {new Date(model.lastUpdate).toLocaleDateString("fr-FR")}
                        </div>

                        <Button variant="outline" className="w-full mt-2">
                          Voir le détail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun modèle trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez d'ajuster vos critères de recherche ou vos filtres
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </Card>
        )}

        {/* Statistics Summary */}
        {filteredModels.length > 0 && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Prix moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    filteredModels.reduce((sum, m) => sum + m.medianPrice, 0) /
                      filteredModels.length
                  )}
                  €
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Volume total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredModels.reduce((sum, m) => sum + m.volume, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">annonces actives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Variation moyenne (30j)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    filteredModels.reduce((sum, m) => sum + m.priceChange30d, 0) /
                      filteredModels.length <
                    0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {(
                    filteredModels.reduce((sum, m) => sum + m.priceChange30d, 0) /
                    filteredModels.length
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Modèles en baisse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {filteredModels.filter((m) => m.priceChange30d < 0).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {filteredModels.length} modèles
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
