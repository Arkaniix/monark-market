import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, CreditCard, Settings, Zap, Crown, Building2, 
  Calendar, AlertTriangle, Mail, Shield, LogOut, Trash2, 
  Bell, Moon, Sun, Globe, Key, Loader2, Check, Coins,
  RefreshCw, TrendingUp, TrendingDown, X, Minus, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, subDays, subHours } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const mockUsageHistory = [
  { id: 1, date: subHours(new Date(), 2), action: "Estimation", cost: 3 },
  { id: 2, date: subHours(new Date(), 5), action: "Scrap avancé", cost: 20 },
  { id: 3, date: subDays(new Date(), 1), action: "Estimation", cost: 3 },
  { id: 4, date: subDays(new Date(), 1), action: "Scrap standard", cost: 5 },
  { id: 5, date: subDays(new Date(), 2), action: "Estimation", cost: 3 },
  { id: 6, date: subDays(new Date(), 3), action: "Scrap avancé", cost: 20 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

// ═══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function SettingItem({ 
  icon: Icon, 
  label, 
  description, 
  children 
}: { 
  icon: React.ElementType; 
  label: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{label}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function MyAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Form state
  const [displayName, setDisplayName] = useState("Jean");
  const [language, setLanguage] = useState("fr");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Plan change modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [pendingDowngrade, setPendingDowngrade] = useState<string | null>(null);
  
  // Loading states for mock
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Plan state
  const [currentPlan, setCurrentPlan] = useState<"starter" | "pro" | "elite">("pro");

  // ═══════════════════════════════════════════════════════════════════
  // MOCK DATA
  // ═══════════════════════════════════════════════════════════════════
  
  const mockPlanDisplayName = currentPlan === "starter" ? "Starter" : currentPlan === "pro" ? "Pro" : "Élite";
  const mockCreditsRemaining = 347;
  const mockMaxCredits = 500;
  const mockEmail = "jean.dupont@email.com";
  const mockMemberSince = subDays(new Date(), 180);
  const mockResetDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  
  const creditPercentage = Math.min((mockCreditsRemaining / mockMaxCredits) * 100, 100);
  const isCreditsLow = creditPercentage < 20;
  const daysUntilReset = differenceInDays(mockResetDate, new Date());

  // ═══════════════════════════════════════════════════════════════════
  // PLAN DATA
  // ═══════════════════════════════════════════════════════════════════
  
  const plans = [
    { 
      id: "starter", 
      name: "Starter", 
      price: 9.99, 
      credits: 120,
      features: ["3 alertes actives", "Scrap standard", "Catalogue complet"],
      hasAdvancedScrap: false,
      hasAdvancedStats: false,
      hasExport: false,
    },
    { 
      id: "pro", 
      name: "Pro", 
      price: 29, 
      credits: 500,
      features: ["20 alertes actives", "Scrap avancé", "Historique 90j", "Stats détaillées"],
      isPopular: true,
      hasAdvancedScrap: true,
      hasAdvancedStats: true,
      hasExport: false,
    },
    { 
      id: "elite", 
      name: "Élite", 
      price: 79, 
      credits: 1500,
      features: ["Alertes illimitées", "Tout illimité", "Export données", "Support prioritaire"],
      hasAdvancedScrap: true,
      hasAdvancedStats: true,
      hasExport: true,
    },
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan)!;
  const planOrder = { starter: 1, pro: 2, elite: 3 };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "starter": return <Zap className="h-5 w-5" />;
      case "pro": return <Crown className="h-5 w-5" />;
      case "elite": case "élite": return <Building2 className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
    toast({ title: "Déconnexion", description: "À bientôt !" });
  };

  const handleSaveDisplayName = () => {
    toast({ title: "Profil mis à jour", description: "Votre nom d'affichage a été enregistré." });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères.", variant: "destructive" });
      return;
    }
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour avec succès." });
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePlanChange = (targetPlan: string) => {
    const currentOrder = planOrder[currentPlan];
    const targetOrder = planOrder[targetPlan as keyof typeof planOrder] || 0;
    
    if (targetOrder < currentOrder) {
      setPendingDowngrade(targetPlan);
      setShowDowngradeWarning(true);
    } else {
      processPlanChange(targetPlan);
    }
  };

  const processPlanChange = (targetPlan: string) => {
    setChangingPlan(targetPlan);
    setShowDowngradeWarning(false);
    setPendingDowngrade(null);
    
    setTimeout(() => {
      setCurrentPlan(targetPlan as "starter" | "pro" | "elite");
      setChangingPlan(null);
      setPlanModalOpen(false);
      const targetName = plans.find(p => p.id === targetPlan)?.name || targetPlan;
      toast({ 
        title: "Plan modifié", 
        description: `Votre abonnement est maintenant ${targetName}.`
      });
    }, 2000);
  };

  const getDowngradeLosses = (targetPlan: string) => {
    const losses: string[] = [];
    const current = plans.find(p => p.id === currentPlan);
    const target = plans.find(p => p.id === targetPlan);
    
    if (current && target) {
      if (current.hasAdvancedScrap && !target.hasAdvancedScrap) losses.push("Scrap avancé");
      if (current.hasAdvancedStats && !target.hasAdvancedStats) losses.push("Statistiques avancées");
      if (current.hasExport && !target.hasExport) losses.push("Export de données");
      losses.push(`${current.credits - target.credits} crédits/mois`);
    }
    
    return losses;
  };

  // ═══════════════════════════════════════════════════════════════════
  // AUTH CHECK
  // ═══════════════════════════════════════════════════════════════════

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-72 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const userInitials = mockEmail.slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
        <p className="text-muted-foreground">Gérez votre profil, vos préférences et votre abonnement</p>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        className="space-y-8"
      >
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: PROFIL & IDENTITÉ
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants}>
          <SectionHeader 
            icon={User} 
            title="Profil & Identité" 
            description="Gérez vos informations personnelles"
          />
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Infos du compte */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{mockEmail}</p>
                      <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1">
                        {isAdmin ? "Administrateur" : "Utilisateur"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {format(mockMemberSince, "d MMMM yyyy", { locale: fr })}</span>
                  </div>
                </div>

                {/* Nom d'affichage */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="displayName" className="text-sm font-medium">Nom d'affichage</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ce nom est visible dans la communauté et les classements.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="displayName" 
                      placeholder="Votre pseudo"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveDisplayName}
                      disabled={!displayName.trim()}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: PRÉFÉRENCES UTILISATEUR
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants}>
          <SectionHeader 
            icon={Settings} 
            title="Préférences utilisateur" 
            description="Personnalisez votre expérience"
          />
          
          <Card>
            <CardContent className="pt-2 divide-y">
              <SettingItem
                icon={Globe}
                label="Langue"
                description="Définit la langue de toute l'interface."
              >
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </SettingItem>

              <SettingItem
                icon={theme === "dark" ? Moon : Sun}
                label="Thème sombre"
                description="Améliore le confort visuel, surtout en usage prolongé."
              >
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </SettingItem>

              <SettingItem
                icon={Bell}
                label="Notifications push"
                description="Recevez des alertes instantanées lors de la détection d'un bon deal."
              >
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled}
                />
              </SettingItem>

              <SettingItem
                icon={Mail}
                label="Alertes email"
                description="Recevez un email quand un prix passe sous votre seuil."
              >
                <Switch 
                  checked={emailAlerts} 
                  onCheckedChange={setEmailAlerts}
                />
              </SettingItem>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: ABONNEMENT & FACTURATION
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants}>
          <SectionHeader 
            icon={CreditCard} 
            title="Abonnement & Facturation" 
            description="Votre plan actuel et options de mise à niveau"
          />
          
          {/* Plan actuel */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/15 text-primary">
                    {getPlanIcon(currentPlan)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{mockPlanDisplayName}</CardTitle>
                      <Badge className="bg-primary text-primary-foreground">Plan actif</Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {currentPlanData.features.slice(0, 2).join(" • ")}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setPlanModalOpen(true)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Changer de plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prix mensuel</p>
                  <p className="text-2xl font-bold">{currentPlanData.price}€</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crédits / mois</p>
                  <p className="text-2xl font-bold">{currentPlanData.credits}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Réinitialisation</p>
                  <p className="text-lg font-semibold">{format(mockResetDate, "d MMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              
              {/* Fonctionnalités incluses */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Inclus dans votre plan</p>
                <div className="flex flex-wrap gap-2">
                  {currentPlanData.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: CRÉDITS & UTILISATION
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants}>
          <SectionHeader 
            icon={Coins} 
            title="Crédits & Utilisation" 
            description="Suivez votre consommation mensuelle"
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Crédits restants */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Crédits restants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-3xl font-bold">{mockCreditsRemaining}</span>
                    <span className="text-muted-foreground ml-1">/ {mockMaxCredits}</span>
                  </div>
                  {isCreditsLow && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Faible
                    </Badge>
                  )}
                </div>
                <Progress value={creditPercentage} className={`h-3 ${isCreditsLow ? "[&>div]:bg-destructive" : ""}`} />
                <p className="text-sm text-muted-foreground mt-3">
                  Réinitialisation le {format(mockResetDate, "d MMMM", { locale: fr })}
                  {daysUntilReset > 0 && ` (dans ${daysUntilReset} jour${daysUntilReset > 1 ? "s" : ""})`}
                </p>
                <Button className="w-full mt-4 gap-2" asChild>
                  <Link to="/billing">
                    <Coins className="h-4 w-4" />
                    Recharger des crédits
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Coût des actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Coût des actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Scrap standard</span>
                    <Badge variant="outline">5 crédits</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Scrap avancé</span>
                    <Badge variant="outline">20 crédits</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Estimation</span>
                    <Badge variant="outline">3 crédits</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historique d'utilisation */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique d'utilisation</CardTitle>
              <CardDescription>Vos dernières actions consommatrices de crédits</CardDescription>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : mockUsageHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune utilisation ce mois</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Crédits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsageHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">
                            {format(item.date, "d MMM, HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell>{item.action}</TableCell>
                          <TableCell className="text-right font-medium">-{item.cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: SÉCURITÉ & ACTIONS DE COMPTE
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants}>
          <SectionHeader 
            icon={Shield} 
            title="Sécurité & Actions de compte" 
            description="Gérez la sécurité de votre compte"
          />
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Changer mot de passe */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Mot de passe</p>
                  <p className="text-sm text-muted-foreground">Modifiez votre mot de passe de connexion</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => setPasswordModalOpen(true)}>
                  <Key className="h-4 w-4" />
                  Modifier
                </Button>
              </div>

              {/* Se déconnecter */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Se déconnecter</p>
                  <p className="text-sm text-muted-foreground">Fermer votre session sur cet appareil</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>

              <Separator />

              {/* Zone sensible */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  Zone sensible
                </p>
                
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-destructive">Supprimer mon compte</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cette action est <strong>irréversible</strong>. Toutes vos données, crédits et historique seront définitivement supprimés.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Supprimer votre compte ?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées :</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Votre profil et préférences</li>
                              <li>Votre watchlist et alertes</li>
                              <li>Votre historique d'estimations</li>
                              <li>Vos {mockCreditsRemaining} crédits restants</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              toast({ 
                                title: "Fonctionnalité à venir", 
                                description: "La suppression de compte sera disponible prochainement.",
                              });
                            }}
                          >
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Liens légaux */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
          <Link to="/cgu" className="hover:text-foreground transition-colors">Conditions d'utilisation</Link>
          <span>•</span>
          <Link to="/rgpd" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
          <span>•</span>
          <Link to="/legal-notice" className="hover:text-foreground transition-colors">Mentions légales</Link>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: CHANGER MOT DE PASSE
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel puis votre nouveau mot de passe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 caractères</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: CHANGER DE PLAN
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Changer de plan
            </DialogTitle>
            <DialogDescription>
              Comparez les plans et choisissez celui qui vous convient
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Comparaison des plans */}
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((p) => {
                const isActive = p.id === currentPlan;
                const currentOrder = planOrder[currentPlan];
                const targetOrder = planOrder[p.id as keyof typeof planOrder];
                const isUpgrade = targetOrder > currentOrder;
                const isDowngrade = targetOrder < currentOrder;
                
                return (
                  <Card 
                    key={p.id} 
                    className={`relative transition-all ${
                      isActive 
                        ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30" 
                        : p.isPopular && !isActive
                          ? "border-muted-foreground/30"
                          : "hover:border-muted-foreground/30"
                    }`}
                  >
                    {/* Badges */}
                    {isActive && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-primary shadow-sm">Votre plan</Badge>
                      </div>
                    )}
                    {p.isPopular && !isActive && (
                      <div className="absolute -top-3 left-4">
                        <Badge variant="outline" className="bg-background">Populaire</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pt-6 pb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-primary/15 text-primary" : "bg-muted"}`}>
                          {getPlanIcon(p.name)}
                        </div>
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                      </div>
                      <div className="mt-3">
                        <span className="text-3xl font-bold">{p.price}€</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.credits} crédits/mois</p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-4">
                        {p.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {isActive ? (
                        <Button disabled variant="secondary" className="w-full gap-2">
                          <Check className="h-4 w-4" />
                          Plan actuel
                        </Button>
                      ) : isUpgrade ? (
                        <Button 
                          className="w-full gap-2"
                          onClick={() => handlePlanChange(p.id)}
                          disabled={changingPlan !== null}
                        >
                          {changingPlan === p.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4" />
                              Passer à {p.name}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="w-full gap-2 text-muted-foreground"
                          onClick={() => handlePlanChange(p.id)}
                          disabled={changingPlan !== null}
                        >
                          {changingPlan === p.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4" />
                              Rétrograder
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Info */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Le changement de plan prend effet immédiatement. Les crédits non utilisés ne sont pas reportés au mois suivant.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOG: AVERTISSEMENT DOWNGRADE
          ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showDowngradeWarning} onOpenChange={setShowDowngradeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Rétrogradation de plan
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Vous êtes sur le point de passer de <strong>{mockPlanDisplayName}</strong> à{" "}
                  <strong>{plans.find(p => p.id === pendingDowngrade)?.name}</strong>.
                </p>
                
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="font-medium text-destructive mb-2">Vous perdrez l'accès à :</p>
                  <ul className="space-y-1">
                    {pendingDowngrade && getDowngradeLosses(pendingDowngrade).map((loss, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <X className="h-4 w-4 text-destructive shrink-0" />
                        <span>{loss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Ce changement prendra effet à la fin de votre période de facturation actuelle.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDowngradeWarning(false);
              setPendingDowngrade(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={() => pendingDowngrade && processPlanChange(pendingDowngrade)}
              disabled={changingPlan !== null}
            >
              {changingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                "Confirmer la rétrogradation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
