import { useState } from "react";
import { 
  useSavedSearches, 
  useCreateSavedSearch, 
  useDeleteSavedSearch,
  useRunSavedSearch 
} from "@/hooks/useSavedSearches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Trash2, 
  Play, 
  Bell, 
  Clock, 
  Loader2,
  Bookmark,
  ShoppingBag,
  LayoutGrid
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { SavedSearch, CreateSavedSearchPayload } from "@/types/userSettings";

const searchTypeLabels = {
  catalog: { label: 'Catalogue', icon: LayoutGrid, color: 'bg-blue-500' },
  deals: { label: 'Bons plans', icon: ShoppingBag, color: 'bg-green-500' },
  ads: { label: 'Annonces', icon: Search, color: 'bg-orange-500' },
};

interface SavedSearchCardProps {
  search: SavedSearch;
  onDelete: (id: number) => void;
  onRun: (id: number) => void;
  isDeleting: boolean;
  isRunning: boolean;
}

function SavedSearchCard({ search, onDelete, onRun, isDeleting, isRunning }: SavedSearchCardProps) {
  const typeConfig = searchTypeLabels[search.search_type];
  const Icon = typeConfig.icon;
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${typeConfig.color} text-white shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{search.name}</h4>
                {search.notify_on_new && (
                  <Bell className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {typeConfig.label}
                </Badge>
                {search.filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    {search.filters.category}
                  </Badge>
                )}
                {search.filters.search && (
                  <span className="truncate max-w-32">"{search.filters.search}"</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {search.results_count !== null && (
                  <span>{search.results_count} résultats</span>
                )}
                {search.last_run_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(search.last_run_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRun(search.id)}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(search.id)}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SavedSearchesPanel() {
  const { data, isLoading, error } = useSavedSearches();
  const createSearch = useCreateSavedSearch();
  const deleteSearch = useDeleteSavedSearch();
  const runSearch = useRunSavedSearch();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSearch, setNewSearch] = useState<Partial<CreateSavedSearchPayload>>({
    name: '',
    search_type: 'deals',
    filters: {},
    notify_on_new: false,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);
  
  const handleCreate = async () => {
    if (!newSearch.name || !newSearch.search_type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createSearch.mutateAsync(newSearch as CreateSavedSearchPayload);
      toast({
        title: "Recherche sauvegardée",
        description: `"${newSearch.name}" a été ajoutée à vos recherches.`,
      });
      setIsCreateOpen(false);
      setNewSearch({ name: '', search_type: 'deals', filters: {}, notify_on_new: false });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la recherche sauvegardée.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteSearch.mutateAsync(id);
      toast({
        title: "Recherche supprimée",
        description: "La recherche a été supprimée avec succès.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recherche.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleRun = async (id: number) => {
    setRunningId(id);
    try {
      const results = await runSearch.mutateAsync(id);
      toast({
        title: "Recherche exécutée",
        description: `${(results as any)?.total || 0} résultats trouvés.`,
      });
      // TODO: Navigate to results or show in modal
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter la recherche.",
        variant: "destructive",
      });
    } finally {
      setRunningId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>Impossible de charger les recherches sauvegardées</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const searches = data?.items || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Recherches sauvegardées
          </h3>
          <p className="text-sm text-muted-foreground">
            Retrouvez rapidement vos recherches favorites
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle recherche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle recherche sauvegardée</DialogTitle>
              <DialogDescription>
                Créez une recherche pour la réutiliser rapidement
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la recherche</Label>
                <Input
                  id="name"
                  placeholder="Ex: GPU haut de gamme pas chers"
                  value={newSearch.name}
                  onChange={(e) => setNewSearch(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type de recherche</Label>
                <Select
                  value={newSearch.search_type}
                  onValueChange={(v) => setNewSearch(prev => ({ 
                    ...prev, 
                    search_type: v as 'catalog' | 'deals' | 'ads' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deals">Bons plans</SelectItem>
                    <SelectItem value="catalog">Catalogue</SelectItem>
                    <SelectItem value="ads">Annonces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifier les nouveaux résultats</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez une alerte quand de nouveaux résultats apparaissent
                  </p>
                </div>
                <Switch
                  checked={newSearch.notify_on_new}
                  onCheckedChange={(v) => setNewSearch(prev => ({ ...prev, notify_on_new: v }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={createSearch.isPending}>
                {createSearch.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">Aucune recherche sauvegardée</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Sauvegardez vos recherches pour les retrouver rapidement
            </p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une recherche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              onDelete={handleDelete}
              onRun={handleRun}
              isDeleting={deletingId === search.id}
              isRunning={runningId === search.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
