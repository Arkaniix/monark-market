import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { History, Calculator, Coins, RefreshCw, Eye, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Plan credit constants (aligned with useEntitlements)
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

const CREDIT_COSTS = {
  signal: 0,
  qualify: 5,
  decision: 20,
};

export default function AdminCredits() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [creditLogs, setCreditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simulator state
  const [simAction, setSimAction] = useState<"signal" | "qualify" | "decision">("qualify");
  const [simPlan, setSimPlan] = useState<"free" | "standard" | "pro">("standard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const policiesRes = await supabase.from('scrape_policies').select('*');
      
      const mockLogs = [
        { id: 1, user_id: 'b9d133e5', delta: -20, reason: 'decision_complete', created_at: '2026-02-26T14:30:00', profiles: { display_name: 'Etienne' } },
        { id: 2, user_id: 'da1fbc02', delta: 180, reason: 'monthly_refill', created_at: '2026-02-25T10:00:00', profiles: { display_name: 'Emre' } },
        { id: 3, user_id: 'b9d133e5', delta: -5, reason: 'qualify_annonce', created_at: '2026-02-25T16:20:00', profiles: { display_name: 'Etienne' } },
        { id: 4, user_id: 'user-3', delta: 2, reason: 'collecte_passive', created_at: '2026-02-25T12:45:00', profiles: { display_name: 'Jean Dupont' } },
        { id: 5, user_id: 'da1fbc02', delta: 8, reason: 'mission_scarce', created_at: '2026-02-24T09:15:00', profiles: { display_name: 'Emre' } },
        { id: 6, user_id: 'user-3', delta: 40, reason: 'rollover', created_at: '2026-02-24T00:01:00', profiles: { display_name: 'Jean Dupont' } },
      ];

      if (policiesRes.error) throw policiesRes.error;

      setPolicies(policiesRes.data || []);
      setCreditLogs(mockLogs);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      monthly_refill: "Recharge mensuelle",
      rollover: "Report crédits",
      qualify_annonce: "Qualifier annonce",
      decision_complete: "Décision complète",
      collecte_passive: "Collecte passive",
      mission_documented: "Mission — documenté",
      mission_scarce: "Mission — peu documenté",
      mission_orphan: "Mission — orphelin",
      mission_special: "Mission spéciale",
      topup_pack: "Achat pack crédits",
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crédits & Économie</h2>
        <p className="text-muted-foreground">Modèle économique, coûts d'actions et gains utilisateurs</p>
      </div>

      {/* Plan Credit Overview */}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crédits mensuels</span>
                <span className="font-semibold">{PLAN_CREDITS[plan].monthly}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rollover max</span>
                <span className="font-semibold">{PLAN_CREDITS[plan].rollover || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collecte passive</span>
                <span className="font-semibold">{PASSIVE_EARN[plan].creditsPerAd} cr/annonce ({PASSIVE_EARN[plan].weeklyCapCredits}/sem)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missions ×</span>
                <span className="font-semibold">×{MISSION_MULTIPLIERS[plan]} — {MISSION_MONTHLY_CAP[plan]} cr/mois max</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cost Reference */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Coûts des actions utilisateur
          </CardTitle>
          <CardDescription>Crédits consommés par type d'analyse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Eye className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="font-semibold">Signal (Market Score)</p>
              <p className="text-2xl font-bold text-primary">0 cr</p>
              <p className="text-xs text-muted-foreground">Gratuit — via extension Lens</p>
            </div>
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Zap className="h-6 w-6 mx-auto text-amber-500" />
              <p className="font-semibold">Qualifier une annonce</p>
              <p className="text-2xl font-bold text-primary">5 cr</p>
              <p className="text-xs text-muted-foreground">Médiane, écart, tendance, volume</p>
            </div>
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Target className="h-6 w-6 mx-auto text-green-500" />
              <p className="font-semibold">Décision complète</p>
              <p className="text-2xl font-bold text-primary">20 cr</p>
              <p className="text-xs text-muted-foreground">Estimator complet — buy/negotiate/wait/pass</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Récompenses missions communautaires
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(MISSION_REWARDS).map(([key, reward]) => (
                <div key={key} className="p-3 border rounded-lg text-center">
                  <p className="font-semibold text-primary">{reward.base} cr</p>
                  <p className="text-xs text-muted-foreground">{reward.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Politiques de scraping par plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plateforme</TableHead>
                <TableHead>Pages (liste)</TableHead>
                <TableHead>Pages (détail)</TableHead>
                <TableHead>Délai item (ms)</TableHead>
                <TableHead>Délai page (ms)</TableHead>
                <TableHead>Cooldown (min)</TableHead>
                <TableHead>Max jobs/jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium capitalize">{policy.site}</TableCell>
                  <TableCell>{policy.list_only_pages_max}</TableCell>
                  <TableCell>{policy.open_new_pages_max}</TableCell>
                  <TableCell>{policy.min_delay_item_ms} - {policy.max_delay_item_ms}</TableCell>
                  <TableCell>{policy.min_delay_page_ms} - {policy.max_delay_page_ms}</TableCell>
                  <TableCell>{policy.min_cooldown_minutes}</TableCell>
                  <TableCell>{policy.max_comm_jobs_per_day}</TableCell>
                  <TableCell><Button size="sm" variant="outline">Modifier</Button></TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Marketplace Facebook</TableCell>
                <TableCell>30</TableCell><TableCell>15</TableCell>
                <TableCell>800 - 2500</TableCell><TableCell>1500 - 4000</TableCell>
                <TableCell>45</TableCell><TableCell>8</TableCell>
                <TableCell><Button size="sm" variant="outline">Modifier</Button></TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">eBay</TableCell>
                <TableCell>40</TableCell><TableCell>25</TableCell>
                <TableCell>600 - 1800</TableCell><TableCell>1200 - 3500</TableCell>
                <TableCell>35</TableCell><TableCell>12</TableCell>
                <TableCell><Button size="sm" variant="outline">Modifier</Button></TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Vinted</TableCell>
                <TableCell>35</TableCell><TableCell>18</TableCell>
                <TableCell>700 - 2200</TableCell><TableCell>1400 - 3800</TableCell>
                <TableCell>40</TableCell><TableCell>10</TableCell>
                <TableCell><Button size="sm" variant="outline">Modifier</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Credit History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des crédits</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.profiles?.display_name || 'Utilisateur'}</TableCell>
                  <TableCell className={log.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                    {log.delta > 0 ? '+' : ''}{log.delta}
                  </TableCell>
                  <TableCell>{getReasonLabel(log.reason)}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
