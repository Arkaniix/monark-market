import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminSystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchMaintenanceMode(); }, []);

  const fetchMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase.from('system_settings').select('maintenance_mode').eq('id', 1).single();
      if (error) throw error;
      if (data) setMaintenanceMode(data.maintenance_mode);
    } catch (error) {
      console.error('Error fetching maintenance mode:', error);
    }
  };

  const toggleMaintenanceMode = async (checked: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('system_settings').update({ maintenance_mode: checked, updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) throw error;
      setMaintenanceMode(checked);
      toast({ title: checked ? "Mode maintenance activé" : "Mode maintenance désactivé" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le mode maintenance", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres Système</h2>
        <p className="text-muted-foreground">Configuration globale et maintenance</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Fonctionnalités</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scraping communautaire</Label>
              <p className="text-sm text-muted-foreground">Autoriser les utilisateurs à participer aux scraps</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">Seuls les administrateurs peuvent accéder au site</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={toggleMaintenanceMode} disabled={loading} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nouvelles inscriptions</Label>
              <p className="text-sm text-muted-foreground">Autoriser la création de nouveaux comptes</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>RGPD & Rétention données</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Conservation des logs (jours)</Label>
            <Input type="number" defaultValue={90} />
          </div>
          <div className="space-y-2">
            <Label>Conservation données utilisateur après suppression (jours)</Label>
            <Input type="number" defaultValue={30} />
          </div>
          <div className="space-y-2">
            <Label>Conservation des scraps (jours)</Label>
            <Input type="number" defaultValue={180} />
          </div>
          <Button variant="outline">Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tâches planifiées</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-3">
              <Badge>Actif</Badge>
              <div>
                <p className="font-medium">Nettoyage quotidien</p>
                <p className="text-sm text-muted-foreground">Tous les jours à 03:00</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Exécuter</Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-3">
              <Badge>Actif</Badge>
              <div>
                <p className="font-medium">Mise à jour des métriques</p>
                <p className="text-sm text-muted-foreground">Toutes les heures</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Exécuter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
