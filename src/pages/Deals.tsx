import { useState } from "react";
import { motion } from "framer-motion";
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
import { Flame, MapPin, Calendar, TrendingDown, Package, Truck } from "lucide-react";
import { mockAds } from "@/lib/mockData";

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

export default function Deals() {
  const [sortBy, setSortBy] = useState("dealScore");
  const [filterComponent, setFilterComponent] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  const filteredAds = mockAds
    .filter((ad) => {
      if (filterComponent !== "all" && ad.component !== filterComponent) return false;
      if (maxPrice && ad.price > parseInt(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dealScore") return b.dealScore - a.dealScore;
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deals en Direct</h1>
          <p className="text-muted-foreground">
            {filteredAds.length} opportunités disponibles
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtres & Tri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Select value={filterComponent} onValueChange={setFilterComponent}>
                <SelectTrigger>
                  <SelectValue placeholder="Composant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les composants</SelectItem>
                  <SelectItem value="GPU">Cartes graphiques</SelectItem>
                  <SelectItem value="CPU">Processeurs</SelectItem>
                  <SelectItem value="RAM">Mémoire RAM</SelectItem>
                  <SelectItem value="SSD">SSD</SelectItem>
                  <SelectItem value="Motherboard">Cartes mères</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Prix max (€)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dealScore">Meilleur deal</SelectItem>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="price">Prix croissant</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setFilterComponent("all");
                setMaxPrice("");
                setSortBy("dealScore");
              }}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ads List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAds.map((ad) => (
            <motion.div key={ad.id} variants={itemVariants}>
              <Card className="hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={ad.dealScore > 85 ? "default" : "secondary"} className="gap-1">
                      {ad.dealScore > 85 && <Flame className="h-3 w-3" />}
                      Score: {ad.dealScore}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{ad.price}€</div>
                      <div className="text-xs text-muted-foreground line-through">
                        {ad.fairValue}€
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-base leading-tight">{ad.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{ad.component}</Badge>
                      <Badge variant="outline">{ad.condition}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {ad.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(ad.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {ad.seller}
                      </div>
                      {ad.shipping && (
                        <div className="flex items-center gap-2 text-success">
                          <Truck className="h-4 w-4" />
                          Livraison disponible
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingDown className="h-4 w-4 text-success" />
                        <span className="font-medium text-success">
                          -{Math.round(((ad.fairValue - ad.price) / ad.fairValue) * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs Fair Value</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Marge: {ad.fairValue - ad.price}€
                      </span>
                    </div>

                    <Button className="w-full mt-2" variant="outline">
                      Voir l'annonce
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredAds.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p>Aucun deal trouvé avec ces critères.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setFilterComponent("all");
                setMaxPrice("");
              }}>
                Réinitialiser les filtres
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
