// Barre de recherche d'annonces pour pré-remplir le formulaire
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Loader2, 
  ExternalLink,
  X,
  Package
} from "lucide-react";
import { useDataProvider } from "@/providers";
import type { DealItem } from "@/providers/types";

interface AdSearchBarProps {
  onAdSelect: (ad: DealItem) => void;
}

export default function AdSearchBar({ onAdSelect }: AdSearchBarProps) {
  const provider = useDataProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAd, setSelectedAd] = useState<DealItem | null>(null);
  
  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Utiliser le provider pour chercher des annonces
        const response = await provider.getDeals({ 
          page: 1, 
          limit: 8 
        });
        
        // Filtrer par le terme de recherche (côté client pour le mock)
        // Exclure les PC complets et les lots
        const filtered = response.items
          .filter(item => item.item_type === 'component') // Only components
          .filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.model_name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5);
        
        setResults(filtered);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, provider]);
  
  const handleSelect = (ad: DealItem) => {
    setSelectedAd(ad);
    setShowResults(false);
    setSearchQuery("");
    onAdSelect(ad);
  };
  
  const handleClear = () => {
    setSelectedAd(null);
    setSearchQuery("");
  };
  
  return (
    <Card className="mb-4 border-dashed">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Importer depuis une annonce existante</span>
            <Badge variant="outline" className="text-xs">Optionnel</Badge>
          </div>
          
          {selectedAd ? (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedAd.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedAd.model_name}</span>
                  <span>•</span>
                  <span>{selectedAd.price}€</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">{selectedAd.platform}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une annonce par titre ou modèle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-64 overflow-auto">
                  {results.map((ad) => (
                    <button
                      key={ad.id}
                      onClick={() => handleSelect(ad)}
                      className="w-full text-left p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ad.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{ad.model_name}</span>
                            <span>•</span>
                            <span>{ad.condition}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{ad.price}€</p>
                          <Badge variant="outline" className="text-xs">{ad.platform}</Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showResults && results.length === 0 && searchQuery.length >= 3 && !isLoading && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                  Aucune annonce trouvée
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
