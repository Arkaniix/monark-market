import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Cpu,
  MemoryStick,
  HardDrive,
  Zap,
  TrendingDown,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  Info,
  Eye,
  BarChart3,
  Sparkles,
  Monitor,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { useAdDetail } from "@/hooks/useProviderData";
import { PCDetailSkeleton } from "@/components/pc/PCDetailSkeleton";
import { toast } from "sonner";

export default function PCDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // PC ads have IDs starting at 1000
  const pcId = id ? (parseInt(id) < 1000 ? `${1000 + parseInt(id)}` : id) : undefined;
  const { data: ad, isLoading, error, refetch } = useAdDetail(pcId);

  // Loading state
  if (isLoading) {
    return <PCDetailSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/catalog")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au catalogue
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger ce PC.
            <Button variant="link" className="px-2" onClick={() => refetch()}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found or not a PC
  if (!ad || ad.item_type !== "pc" || !ad.pc_components) {
    return (
      <div className="container py-8">
        <Card className="p-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">PC non trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Ce PC n'existe pas ou n'est plus disponible dans notre catalogue.
            </p>
            <Button onClick={() => navigate("/catalog")}>Retour au catalogue</Button>
          </div>
        </Card>
      </div>
    );
  }

  const components = ad.pc_components;

  // Calculate PC score
  const calculatePCScore = () => {
    let score = 100;

    // Age depreciation
    if (components.age_years) {
      score -= components.age_years * 8;
    }

    // Condition bonus/malus
    if (components.condition === "Excellent") score += 10;
    else if (components.condition === "Bon") score += 5;
    else if (components.condition === "Correct") score -= 5;
    else if (components.condition === "Usé") score -= 15;

    // Warranty bonus
    if (components.warranty_months && components.warranty_months > 0) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  };

  const pcScore = calculatePCScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent état";
    if (score >= 70) return "Très bon état";
    if (score >= 55) return "Bon état";
    if (score >= 40) return "État correct";
    return "État moyen";
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return "default";
      case "Bon":
        return "secondary";
      case "Correct":
        return "outline";
      default:
        return "destructive";
    }
  };

  // Value analysis
  const expectedValue = ad.fair_value;
  const ageDepreciation = (components.age_years || 0) * 0.15;
  const adjustedValue = expectedValue * (1 - ageDepreciation);

  // Price history for chart
  const priceHistoryData = (ad.price_history_30d || []).map((price, i) => ({
    day: i + 1,
    price,
  }));

  const handleCreateAlert = () => {
    toast.success("Alerte créée avec succès !");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papiers !");
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <Button variant="ghost" onClick={() => navigate("/catalog")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au catalogue
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* PC Header */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="gap-1">
                    <Monitor className="h-3 w-3" />
                    PC Complet
                  </Badge>
                  <Badge variant="secondary">{ad.title.split(" ")[0]}</Badge>
                  <Badge variant={getConditionColor(components.condition || "Bon") as any}>
                    {components.condition}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
                <p className="text-lg text-muted-foreground">
                  {ad.city}, {ad.region}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Prix demandé</p>
                <p className="text-4xl font-bold">{ad.price}€</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-2 font-medium ${
                    ad.deviation_pct > 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {ad.deviation_pct > 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>
                    {ad.deviation_pct > 0 ? "" : "+"}
                    {Math.abs(ad.deviation_pct)}% vs valeur estimée
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Global score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Score de valeur globale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-4xl font-bold ${getScoreColor(pcScore)}`}>
                      {pcScore}/100
                    </span>
                    <Badge variant="outline" className={getScoreColor(pcScore)}>
                      {getScoreLabel(pcScore)}
                    </Badge>
                  </div>
                  <Progress value={pcScore} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Âge</p>
                      <p className="font-semibold">{components.age_years?.toFixed(1)} ans</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">État</p>
                      <p className="font-semibold">{components.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Garantie</p>
                      <p className="font-semibold">
                        {components.warranty_months
                          ? `${components.warranty_months} mois`
                          : "Aucune"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Configuration matérielle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* CPU */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <Cpu className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Processeur</p>
                      <p className="text-sm text-muted-foreground">{components.cpu}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/catalog?q=${encodeURIComponent(components.cpu)}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>

                  {/* GPU */}
                  {components.gpu && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Monitor className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Carte graphique</p>
                        <p className="text-sm text-muted-foreground">{components.gpu}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/catalog?q=${encodeURIComponent(components.gpu)}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* RAM */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <MemoryStick className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Mémoire RAM</p>
                      <p className="text-sm text-muted-foreground">{components.ram}</p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <HardDrive className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Stockage</p>
                      <p className="text-sm text-muted-foreground">{components.storage}</p>
                    </div>
                  </div>

                  {/* PSU */}
                  {components.psu && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Zap className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Alimentation</p>
                        <p className="text-sm text-muted-foreground">{components.psu}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Value analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyse de valeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Valeur estimée</p>
                      <p className="text-2xl font-bold">{expectedValue}€</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Valeur ajustée (âge)</p>
                      <p className="text-2xl font-bold">{Math.round(adjustedValue)}€</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Dépréciation estimée</p>
                        <p className="text-sm text-muted-foreground">
                          -{(ageDepreciation * 100).toFixed(0)}% due à l'âge (
                          {components.age_years?.toFixed(1)} ans)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {priceHistoryData.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Évolution du prix médian (30 derniers jours)
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={priceHistoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <RechartsTooltip
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
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <a href={ad.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir l'annonce
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/deals?category=PC`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les deals PC
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={handleCreateAlert}>
                  Créer une alerte
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  Partager
                </Button>
              </CardContent>
            </Card>

            {/* Component links */}
            <Card>
              <CardHeader>
                <CardTitle>Composants dans le catalogue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to={`/catalog?q=${encodeURIComponent(components.cpu)}`}>
                    <Cpu className="h-4 w-4 mr-2" />
                    {components.cpu}
                  </Link>
                </Button>
                {components.gpu && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to={`/catalog?q=${encodeURIComponent(components.gpu)}`}>
                      <Monitor className="h-4 w-4 mr-2" />
                      {components.gpu}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Market stats */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plateforme</p>
                  <Badge variant="outline">{ad.platform}</Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Première vue</p>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(ad.first_seen_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dernière mise à jour</p>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(ad.last_seen_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pcScore >= 70 ? (
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Bon rapport qualité/prix pour l'usage prévu</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Vérifier l'état général avant achat</p>
                  </div>
                )}

                {components.age_years && components.age_years > 3 && (
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Configuration ancienne, envisager une mise à jour future
                    </p>
                  </div>
                )}

                {!components.warranty_months && (
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Aucune garantie - privilégier achat avec facture</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
