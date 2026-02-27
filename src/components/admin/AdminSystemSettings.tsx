import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le mode maintenance", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold mb-2">Paramètres</h2><p className="text-muted-foreground">Configuration globale et maintenance</p></div>

      {/* Plans (read-only) */}
      <Card>
        <CardHeader><CardTitle>Plans & Tarifs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Free", desc: "10 cr/mois, rollover 0, collecte passive 8 cr/sem", price: "0 €" },
            { name: "Standard", desc: "180 cr/mois, rollover 40 cr, collecte passive 30 cr/sem, missions ×1.5", price: "11,99 €" },
            { name: "Pro", desc: "600 cr/mois, rollover 120 cr, collecte passive 80 cr/sem, missions ×2", price: "22,99 €" },
          ].map(plan => (
            <div key={plan.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div><p className="font-medium">Plan {plan.name}</p><p className="text-sm text-muted-foreground">{plan.desc}</p></div>
              <Badge variant={plan.name === 'Pro' ? 'default' : plan.name === 'Standard' ? 'secondary' : 'outline'}>{plan.price}/mois</Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground italic">Les tarifs sont configurés dans le code (useEntitlements).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fonctionnalités</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Mode maintenance", desc: "Seuls les administrateurs peuvent accéder", controlled: true },
            { label: "Nouvelles inscriptions", desc: "Autoriser la création de nouveaux comptes", default: true },
            { label: "Collecte passive", desc: "Crédits gagnés via l'extension Lens", default: true },
            { label: "Missions communautaires", desc: "Missions d'enrichissement de la base", default: true },
          ].map((feat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>{feat.label}</Label><p className="text-sm text-muted-foreground">{feat.desc}</p></div>
              {feat.controlled ? (
                <Switch checked={maintenanceMode} onCheckedChange={toggleMaintenanceMode} disabled={loading} />
              ) : (
                <Switch defaultChecked={feat.default} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>RGPD & Rétention</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Conservation des logs (jours)</Label><Input type="number" defaultValue={90} /></div>
          <div className="space-y-2"><Label>Conservation données après suppression (jours)</Label><Input type="number" defaultValue={30} /></div>
          <div className="space-y-2"><Label>Conservation des scraps (jours)</Label><Input type="number" defaultValue={180} /></div>
          <Button variant="outline">Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tâches planifiées</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Nettoyage quotidien", schedule: "Tous les jours à 03:00" },
            { name: "Mise à jour des métriques", schedule: "Toutes les heures" },
            { name: "Reset crédits + rollover", schedule: "1er du mois à 00:01" },
          ].map((task, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge>Actif</Badge>
                <div><p className="font-medium">{task.name}</p><p className="text-sm text-muted-foreground">{task.schedule}</p></div>
              </div>
              <Button variant="ghost" size="sm">Exécuter</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
