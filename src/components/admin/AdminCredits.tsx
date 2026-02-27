import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { History, Calculator, Coins, RefreshCw, Eye, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLAN_CREDITS = {
  free: { monthly: 10, rollover: 0, price: 0 },
  standard: { monthly: 180, rollover: 40, price: 11.99 },
  pro: { monthly: 600, rollover: 120, price: 22.99 },
};

const PASSIVE_EARN = {
  free: { creditsPerAd: 1, weeklyCapCredits: 8 },
  standard: { creditsPerAd: 1, weeklyCapCredits: 30 },
  pro: { creditsPerAd: 2, weeklyCapCredits: 80 },
};

const MISSION_REWARDS = {
  documented: { base: 3, label: "Composant bien documenté" },
  scarce: { base: 8, label: "Composant peu documenté" },
  orphan: { base: 20, label: "Composant orphelin" },
  special: { base: 40, label: "Mission spéciale" },
};

const MISSION_MULTIPLIERS = { free: 1, standard: 1.5, pro: 2 };
const MISSION_MONTHLY_CAP = { free: 15, standard: 40, pro: 80 };

export default function AdminCredits() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [creditLogs, setCreditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, logsRes] = await Promise.all([
        supabase.from('scrape_policies').select('*'),
        supabase.from('credit_logs').select('*, profiles:user_id(display_name)').order('created_at', { ascending: false }).limit(20),
      ]);
      if (policiesRes.error) throw policiesRes.error;
      setPolicies(policiesRes.data || []);
      setCreditLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      monthly_refill: "Recharge mensuelle", rollover: "Report crédits", qualify_annonce: "Qualifier annonce",
      decision_complete: "Décision complète", collecte_passive: "Collecte passive", mission_documented: "Mission — documenté",
      mission_scarce: "Mission — peu documenté", mission_orphan: "Mission — orphelin", mission_special: "Mission spéciale",
      topup_pack: "Achat pack crédits", scrap_faible: "Scrap faible", scrap_fort: "Scrap fort",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold mb-2">Crédits & Économie</h2><p className="text-muted-foreground">Modèle économique, coûts d'actions et gains utilisateurs</p></div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["free", "standard", "pro"] as const).map((plan) => (
          <Card key={plan} className={plan === "pro" ? "border-primary/30" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{plan}</span>
                <Badge variant={plan === "free" ? "outline" : plan === "standard" ? "secondary" : "default"}>
                  {PLAN_CREDITS[plan].price === 0 ? "Gratuit" : `${PLAN_CREDITS[plan].price}€/mois`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Crédits mensuels</span><span className="font-semibold">{PLAN_CREDITS[plan].monthly}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rollover max</span><span className="font-semibold">{PLAN_CREDITS[plan].rollover || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Collecte passive</span><span className="font-semibold">{PASSIVE_EARN[plan].creditsPerAd} cr/ad ({PASSIVE_EARN[plan].weeklyCapCredits}/sem)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Missions ×</span><span className="font-semibold">×{MISSION_MULTIPLIERS[plan]} — {MISSION_MONTHLY_CAP[plan]} cr/mois</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Costs */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Coûts des actions</CardTitle>
          <CardDescription>Crédits consommés par type d'analyse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center space-y-2"><Eye className="h-6 w-6 mx-auto text-muted-foreground" /><p className="font-semibold">Signal</p><p className="text-2xl font-bold text-primary">0 cr</p><p className="text-xs text-muted-foreground">Gratuit — via Lens</p></div>
            <div className="p-4 border rounded-lg text-center space-y-2"><Zap className="h-6 w-6 mx-auto text-yellow-500" /><p className="font-semibold">Qualifier</p><p className="text-2xl font-bold text-primary">5 cr</p><p className="text-xs text-muted-foreground">Médiane, tendance, volume</p></div>
            <div className="p-4 border rounded-lg text-center space-y-2"><Target className="h-6 w-6 mx-auto text-green-500" /><p className="font-semibold">Décision</p><p className="text-2xl font-bold text-primary">20 cr</p><p className="text-xs text-muted-foreground">Estimator complet</p></div>
          </div>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2"><RefreshCw className="h-4 w-4" />Missions communautaires</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(MISSION_REWARDS).map(([key, r]) => <div key={key} className="p-3 border rounded-lg text-center"><p className="font-semibold text-primary">{r.base} cr</p><p className="text-xs text-muted-foreground">{r.label}</p></div>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader><CardTitle>Politiques de scraping</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : policies.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucune politique configurée</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Site</TableHead><TableHead>Pages liste</TableHead><TableHead>Pages détail</TableHead><TableHead>Délai item</TableHead><TableHead>Cooldown</TableHead><TableHead>Max jobs/j</TableHead></TableRow></TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}><TableCell className="font-medium capitalize">{p.site}</TableCell><TableCell>{p.list_only_pages_max}</TableCell><TableCell>{p.open_new_pages_max}</TableCell><TableCell>{p.min_delay_item_ms}-{p.max_delay_item_ms}ms</TableCell><TableCell>{p.min_cooldown_minutes}min</TableCell><TableCell>{p.max_comm_jobs_per_day}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Credit History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Historique des crédits</CardTitle><History className="h-4 w-4 text-muted-foreground" /></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : creditLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucun historique disponible</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Delta</TableHead><TableHead>Raison</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {creditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{(log.profiles as any)?.display_name || 'Utilisateur'}</TableCell>
                    <TableCell className={log.delta > 0 ? 'text-green-600' : 'text-red-600'}>{log.delta > 0 ? '+' : ''}{log.delta}</TableCell>
                    <TableCell>{getReasonLabel(log.reason)}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
