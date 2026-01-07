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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, CreditCard, Settings, Zap, Crown, Building2, 
  Calendar, ArrowUpRight, RefreshCw, AlertTriangle, 
  Mail, Shield, LogOut, Trash2, Bell, Moon, Sun, 
  Globe, Key, Monitor, Loader2, Check, Info, Coins, 
  ChevronRight, Sparkles, Clock, HelpCircle, Copy,
  Smartphone, Laptop, MapPin, Eye, EyeOff, Plus,
  AlertCircle, Lock, FileText, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, subDays, subHours } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useEntitlements, CREDIT_COSTS, type CreditActionType } from "@/hooks/useEntitlements";
import { useUserSubscription, useSubscriptionPlans } from "@/hooks/useProviderData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Mock data for usage history
const mockUsageHistory = [
  { id: 1, date: subHours(new Date(), 2), action: "Estimation", cost: 3, target: "RTX 4090 Founders Edition" },
  { id: 2, date: subHours(new Date(), 5), action: "Scrap avancé", cost: 20, target: "Recherche GPU" },
  { id: 3, date: subDays(new Date(), 1), action: "Estimation", cost: 3, target: "AMD RX 7900 XTX" },
  { id: 4, date: subDays(new Date(), 1), action: "Scrap standard", cost: 5, target: "Recherche CPU Intel" },
  { id: 5, date: subDays(new Date(), 2), action: "Estimation", cost: 3, target: "Intel Core i9-14900K" },
  { id: 6, date: subDays(new Date(), 3), action: "Scrap avancé", cost: 20, target: "Recherche Cartes mères" },
  { id: 7, date: subDays(new Date(), 4), action: "Estimation", cost: 3, target: "NVIDIA RTX 4080 Super" },
];

// Mock data for API keys
const mockApiKeys = [
  { id: 1, name: "Production", prefix: "hm_live_7a8b", createdAt: subDays(new Date(), 45), lastUsed: subHours(new Date(), 3) },
  { id: 2, name: "Development", prefix: "hm_test_9c2d", createdAt: subDays(new Date(), 12), lastUsed: subDays(new Date(), 2) },
];

// Mock data for sessions
const mockSessions = [
  { id: 1, device: "Chrome", os: "Windows 11", location: "Paris, France", lastActive: new Date(), isCurrent: true },
  { id: 2, device: "Safari", os: "macOS Sonoma", location: "Lyon, France", lastActive: subHours(new Date(), 4), isCurrent: false },
  { id: 3, device: "Firefox", os: "Ubuntu 22.04", location: "Marseille, France", lastActive: subDays(new Date(), 2), isCurrent: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

// Helper component for settings with description
function SettingRow({ 
  icon: Icon, 
  label, 
  description, 
  children,
  tooltip
}: { 
  icon: React.ElementType; 
  label: string; 
  description?: string; 
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{label}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function MyAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("profile");
  
  // Preferences state (mock)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [displayName, setDisplayName] = useState("admin@test.com".split("@")[0]);
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("Europe/Paris");
  
  // Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // API key modal state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Entitlements & subscription data
  const { 
    plan, 
    planDisplayName, 
    creditsRemaining, 
    creditsResetDate, 
    limits,
    isLoading: entitlementsLoading 
  } = useEntitlements();
  
  const { data: currentSubscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();

  // Mock Elite plan for demo
  const mockPlan: "starter" | "pro" | "elite" = "elite";
  const mockPlanDisplayName = "Élite";
  const mockCreditsRemaining = 1247;
  const mockMaxCredits = 1500;

  // Credit calculations
  const maxCreditsForPlan = mockMaxCredits;
  const creditPercentage = Math.min((mockCreditsRemaining / maxCreditsForPlan) * 100, 100);
  const isCreditsLow = creditPercentage < 20;
  const resetDate = creditsResetDate ? new Date(creditsResetDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const daysUntilReset = differenceInDays(resetDate, new Date());

  // Action costs
  const actionCosts: { action: string; label: string; cost: number; description: string }[] = [
    { action: "scrap_standard", label: "Scrap standard", cost: 5, description: "Recherche basique dans les annonces" },
    { action: "scrap_advanced", label: "Scrap avancé", cost: 20, description: "Recherche approfondie avec plus de résultats" },
    { action: "estimation", label: "Estimation", cost: 3, description: "Estimation de prix d'un composant" },
  ];

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "starter": return <Zap className="h-5 w-5" />;
      case "pro": return <Crown className="h-5 w-5" />;
      case "elite": case "élite": return <Building2 className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planName: string, isActive: boolean) => {
    if (isActive) return "border-primary bg-primary/5";
    return "border-border hover:border-muted-foreground/30";
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
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour avec succès." });
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleGenerateApiKey = () => {
    const key = `hm_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(key);
    toast({ title: "Clé API créée", description: "Copiez votre clé maintenant, elle ne sera plus affichée." });
  };

  const handleRevokeApiKey = (keyId: number) => {
    toast({ title: "Clé révoquée", description: "La clé API a été révoquée avec succès." });
  };

  const handleRevokeSession = (sessionId: number) => {
    toast({ title: "Session déconnectée", description: "L'appareil a été déconnecté." });
  };

  const handleRevokeAllSessions = () => {
    toast({ title: "Sessions déconnectées", description: "Tous les autres appareils ont été déconnectés." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié", description: "Clé copiée dans le presse-papiers." });
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const isLoading = authLoading || entitlementsLoading || subscriptionLoading || plansLoading;

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="container mx-auto py-8 max-w-5xl">
          <div className="mb-8">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  const userEmail = "admin@test.com"; // Mock for demo
  const userInitials = userEmail.slice(0, 2).toUpperCase();
  const memberSince = format(subDays(new Date(), 180), "d MMMM yyyy", { locale: fr });
  const isElite = (mockPlan as string) === "elite";
  const isPro = (mockPlan as string) === "pro" || isElite;

  // Plan comparison data
  const planComparison = [
    { 
      id: "starter", 
      name: "Starter", 
      price: 9.99, 
      credits: 120,
      features: ["3 alertes actives", "Scrap standard", "Catalogue complet", "Support email"],
      isPopular: false
    },
    { 
      id: "pro", 
      name: "Pro", 
      price: 29, 
      credits: 500,
      features: ["20 alertes actives", "Scrap avancé", "Historique 90 jours", "Statistiques détaillées", "Support prioritaire"],
      isPopular: true
    },
    { 
      id: "elite", 
      name: "Élite", 
      price: 79, 
      credits: 1500,
      features: ["Alertes illimitées", "Scrap illimité", "Export données", "Accès API", "Support dédié", "Formation incluse"],
      isPopular: false
    },
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres du compte</h1>
          <p className="text-muted-foreground">Gérez votre profil, préférences, abonnement et sécurité</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="profile" className="gap-2 py-2.5">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2 py-2.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2 py-2.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-2.5">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2 py-2.5">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: PROFIL
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="profile">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Informations du compte (read-only) */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Informations du compte
                    </CardTitle>
                    <CardDescription>Ces informations ne peuvent pas être modifiées</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-lg">{userEmail}</p>
                        <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1">
                          {isAdmin ? "Administrateur" : "Utilisateur"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Adresse email
                        </span>
                        <span className="font-medium">{userEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Rôle
                        </span>
                        <Badge variant="outline">{isAdmin ? "Admin" : "User"}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Membre depuis
                        </span>
                        <span className="font-medium">{memberSince}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Paramètres modifiables */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      Paramètres du profil
                    </CardTitle>
                    <CardDescription>Personnalisez votre expérience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Nom d'affichage */}
                    <div>
                      <Label htmlFor="displayName" className="text-sm font-medium">Nom d'affichage</Label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                        Ce nom sera visible dans la communauté
                      </p>
                      <div className="flex gap-2">
                        <Input 
                          id="displayName" 
                          placeholder="Votre pseudo"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSaveDisplayName}
                          disabled={!displayName}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Mot de passe */}
                    <div>
                      <Label className="text-sm font-medium">Mot de passe</Label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                        Dernière modification il y a 45 jours
                      </p>
                      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Key className="h-4 w-4" />
                            Changer le mot de passe
                          </Button>
                        </DialogTrigger>
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
                              <div className="relative mt-1.5">
                                <Input
                                  id="currentPassword"
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                              <div className="relative mt-1.5">
                                <Input
                                  id="newPassword"
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: PRÉFÉRENCES
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="preferences">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      Préférences générales
                    </CardTitle>
                    <CardDescription>Personnalisez l'interface et les notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y">
                    <SettingRow
                      icon={Globe}
                      label="Langue"
                      description="Langue de l'interface utilisateur"
                      tooltip="La traduction complète est en cours pour l'anglais"
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
                    </SettingRow>

                    <SettingRow
                      icon={theme === "dark" ? Moon : Sun}
                      label="Thème"
                      description="Apparence de l'interface"
                      tooltip="Le thème sombre est recommandé pour réduire la fatigue oculaire"
                    >
                      <Switch 
                        checked={theme === "dark"} 
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    </SettingRow>

                    <SettingRow
                      icon={Bell}
                      label="Notifications push"
                      description="Alertes dans le navigateur"
                      tooltip="Recevez des notifications pour les nouvelles opportunités"
                    >
                      <Switch 
                        checked={notificationsEnabled} 
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </SettingRow>

                    <SettingRow
                      icon={Mail}
                      label="Alertes email"
                      description="Récapitulatifs et alertes importantes"
                      tooltip="Maximum 1 email par jour avec les meilleures opportunités"
                    >
                      <Switch 
                        checked={emailAlerts} 
                        onCheckedChange={setEmailAlerts}
                      />
                    </SettingRow>

                    <SettingRow
                      icon={Clock}
                      label="Fuseau horaire"
                      description="Pour les horaires de notifications"
                      tooltip="Les heures de réinitialisation des crédits suivent ce fuseau"
                    >
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-44 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                          <SelectItem value="Europe/London">Londres (UTC)</SelectItem>
                          <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: ABONNEMENT
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="subscription">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              className="space-y-6"
            >
              {/* Plan actuel */}
              <motion.div variants={itemVariants}>
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/15 text-primary">
                          {getPlanIcon(mockPlan)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{mockPlanDisplayName}</CardTitle>
                            <Badge className="bg-primary text-primary-foreground">Plan actif</Badge>
                          </div>
                          <CardDescription className="mt-1">
                            Accès complet à toutes les fonctionnalités HardwareMarket
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" className="gap-2" asChild>
                        <Link to="/pricing">
                          <RefreshCw className="h-4 w-4" />
                          Changer de plan
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prix</p>
                        <p className="text-2xl font-bold">79€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crédits</p>
                        <p className="text-2xl font-bold">{maxCreditsForPlan}<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Renouvellement</p>
                        <p className="text-lg font-semibold">{format(resetDate, "d MMM yyyy", { locale: fr })}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inclus</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">API</Badge>
                          <Badge variant="secondary" className="text-xs">Export</Badge>
                          <Badge variant="secondary" className="text-xs">Illimité</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Crédits & Utilisation */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Crédits & Utilisation
                    </CardTitle>
                    <CardDescription>Suivi de votre consommation mensuelle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Barre de progression */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-3xl font-bold">{mockCreditsRemaining}</span>
                          <span className="text-muted-foreground"> / {maxCreditsForPlan} crédits</span>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Réinitialisation</p>
                          <p className="font-medium">{format(resetDate, "d MMMM", { locale: fr })}</p>
                        </div>
                      </div>
                      <Progress value={creditPercentage} className="h-3" />
                    </div>

                    {/* Coûts par action */}
                    <div>
                      <p className="text-sm font-medium mb-3">Coût par action</p>
                      <div className="grid gap-2 md:grid-cols-3">
                        {actionCosts.map(({ action, label, cost, description }) => (
                          <div key={action} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                            <Badge variant="outline">{cost} cr</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historique d'utilisation */}
                    <div>
                      <p className="text-sm font-medium mb-3">Historique récent</p>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Cible</TableHead>
                              <TableHead className="text-right">Coût</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockUsageHistory.slice(0, 5).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground">
                                  {format(item.date, "d MMM, HH:mm", { locale: fr })}
                                </TableCell>
                                <TableCell>{item.action}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{item.target}</TableCell>
                                <TableCell className="text-right font-medium">-{item.cost}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2 gap-1" asChild>
                        <Link to="/billing">
                          Voir tout l'historique
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Comparaison des plans */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comparer les plans</CardTitle>
                    <CardDescription>Découvrez les fonctionnalités de chaque offre</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {planComparison.map((p) => {
                        const isActive = p.id === mockPlan;
                        return (
                          <Card 
                            key={p.id} 
                            className={`relative transition-all ${isActive 
                              ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" 
                              : "hover:border-muted-foreground/30"
                            }`}
                          >
                            {isActive && (
                              <div className="absolute -top-3 left-4">
                                <Badge className="bg-primary">Votre plan</Badge>
                              </div>
                            )}
                            {p.isPopular && !isActive && (
                              <div className="absolute -top-3 left-4">
                                <Badge variant="secondary">Populaire</Badge>
                              </div>
                            )}
                            <CardHeader className="pt-6 pb-3">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isActive ? "bg-primary/15 text-primary" : "bg-muted"}`}>
                                  {getPlanIcon(p.name)}
                                </div>
                                <CardTitle className="text-lg">{p.name}</CardTitle>
                              </div>
                              <div className="mt-2">
                                <span className="text-2xl font-bold">{p.price}€</span>
                                <span className="text-muted-foreground">/mois</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{p.credits} crédits/mois</p>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <ul className="space-y-2">
                                {p.features.map((feature, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              {!isActive && (
                                <Button 
                                  className="w-full mt-4 gap-2" 
                                  variant={p.isPopular ? "default" : "outline"}
                                  asChild
                                >
                                  <Link to="/pricing">
                                    <ArrowUpRight className="h-4 w-4" />
                                    Choisir
                                  </Link>
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* FAQ */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Questions fréquentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="credits">
                        <AccordionTrigger className="text-sm">À quoi servent les crédits ?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          Les crédits sont utilisés pour les actions consommatrices de ressources : scrap de données, 
                          estimations de prix, exports. Chaque action a un coût fixe en crédits. Les crédits non utilisés 
                          ne sont pas cumulables d'un mois à l'autre.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="scrap">
                        <AccordionTrigger className="text-sm">Différence entre scrap standard et avancé ?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          Le scrap standard (5 crédits) recherche dans les annonces récentes. Le scrap avancé (20 crédits) 
                          effectue une recherche plus approfondie avec plus de résultats et des données enrichies.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="export">
                        <AccordionTrigger className="text-sm">Comment fonctionne l'export de données ?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          L'export vous permet de télécharger vos données (watchlist, historique, estimations) au format 
                          CSV ou JSON. Cette fonctionnalité est réservée aux plans Élite.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="api">
                        <AccordionTrigger className="text-sm">Qu'est-ce que l'accès API ?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          L'API REST vous permet d'intégrer HardwareMarket dans vos propres outils. Vous pouvez automatiser 
                          les recherches, récupérer les estimations et surveiller les prix programmatiquement. Réservé aux 
                          plans Pro et Élite.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: SÉCURITÉ
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="security">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              className="space-y-6"
            >
              {/* Sessions actives */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-primary" />
                      Sessions actives
                    </CardTitle>
                    <CardDescription>Gérez les appareils connectés à votre compte</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            session.isCurrent ? "bg-primary/5 border-primary/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              {session.device.includes("Chrome") || session.device.includes("Firefox") 
                                ? <Laptop className="h-5 w-5" /> 
                                : <Smartphone className="h-5 w-5" />
                              }
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{session.device} sur {session.os}</p>
                                {session.isCurrent && (
                                  <Badge variant="secondary" className="text-xs">Cette session</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location}
                                </span>
                                <span>•</span>
                                <span>
                                  {session.isCurrent 
                                    ? "Actif maintenant" 
                                    : `Dernière activité : ${format(session.lastActive, "d MMM, HH:mm", { locale: fr })}`
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              Déconnecter
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Déconnecter toutes les autres sessions
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Déconnecter toutes les sessions ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tous les autres appareils seront déconnectés. Vous devrez vous reconnecter sur chacun d'entre eux.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRevokeAllSessions}>
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Zone sensible */}
              <motion.div variants={itemVariants}>
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Zone sensible
                    </CardTitle>
                    <CardDescription>Actions irréversibles ou critiques</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="font-medium">Se déconnecter</p>
                        <p className="text-sm text-muted-foreground">Fermer votre session sur cet appareil</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="font-medium">Supprimer mon compte</p>
                        <p className="text-sm text-muted-foreground">Supprime définitivement toutes vos données</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                            <AlertDialogDescription className="space-y-2">
                              <p>Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées :</p>
                              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                <li>Votre profil et préférences</li>
                                <li>Votre watchlist et alertes</li>
                                <li>Votre historique d'estimations</li>
                                <li>Vos crédits restants</li>
                                <li>Vos clés API</li>
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
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB: API
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="api">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible" 
              className="space-y-6"
            >
              {!isPro ? (
                /* Upsell pour Starter */
                <motion.div variants={itemVariants}>
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Accès API réservé</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        L'accès à l'API HardwareMarket est disponible avec les plans Pro et Élite. 
                        Automatisez vos recherches et intégrez nos données dans vos outils.
                      </p>
                      <Button className="gap-2" asChild>
                        <Link to="/pricing">
                          <ArrowUpRight className="h-4 w-4" />
                          Découvrir les plans Pro & Élite
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <>
                  {/* Clés API */}
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Key className="h-4 w-4 text-primary" />
                              Clés API
                            </CardTitle>
                            <CardDescription>Gérez vos clés d'accès à l'API HardwareMarket</CardDescription>
                          </div>
                          <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Générer une clé
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Créer une clé API</DialogTitle>
                                <DialogDescription>
                                  Donnez un nom à votre clé pour l'identifier facilement
                                </DialogDescription>
                              </DialogHeader>
                              {!generatedKey ? (
                                <>
                                  <div className="py-4">
                                    <Label htmlFor="keyName">Nom de la clé</Label>
                                    <Input
                                      id="keyName"
                                      placeholder="ex: Production, Development, Test..."
                                      value={newKeyName}
                                      onChange={(e) => setNewKeyName(e.target.value)}
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setApiKeyModalOpen(false)}>
                                      Annuler
                                    </Button>
                                    <Button onClick={handleGenerateApiKey} disabled={!newKeyName}>
                                      Générer
                                    </Button>
                                  </DialogFooter>
                                </>
                              ) : (
                                <>
                                  <div className="py-4 space-y-4">
                                    <div className="p-4 rounded-lg bg-muted border">
                                      <p className="text-sm text-muted-foreground mb-2">Votre nouvelle clé API :</p>
                                      <div className="flex items-center gap-2">
                                        <code className="flex-1 text-sm font-mono bg-background p-2 rounded border break-all">
                                          {generatedKey}
                                        </code>
                                        <Button 
                                          variant="outline" 
                                          size="icon"
                                          onClick={() => copyToClipboard(generatedKey)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                                      <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                                      <p className="text-sm text-warning">
                                        <strong>Important :</strong> Copiez cette clé maintenant. Elle ne sera plus jamais affichée.
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={() => {
                                      setApiKeyModalOpen(false);
                                      setGeneratedKey(null);
                                      setNewKeyName("");
                                    }}>
                                      J'ai copié ma clé
                                    </Button>
                                  </DialogFooter>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Alerte sécurité */}
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-4">
                          <Shield className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <p className="text-sm">
                            <strong className="text-destructive">Sécurité :</strong>{" "}
                            <span className="text-muted-foreground">
                              Ne partagez jamais vos clés API. Elles donnent un accès complet à votre compte.
                            </span>
                          </p>
                        </div>

                        {mockApiKeys.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune clé API</p>
                            <p className="text-sm">Créez votre première clé pour commencer</p>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nom</TableHead>
                                  <TableHead>Clé</TableHead>
                                  <TableHead>Créée le</TableHead>
                                  <TableHead>Dernière utilisation</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockApiKeys.map((key) => (
                                  <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name}</TableCell>
                                    <TableCell>
                                      <code className="text-xs bg-muted px-2 py-1 rounded">{key.prefix}•••••••</code>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {format(key.createdAt, "d MMM yyyy", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {format(key.lastUsed, "d MMM, HH:mm", { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          >
                                            Révoquer
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Révoquer cette clé API ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              La clé "{key.name}" sera immédiatement désactivée. Les applications utilisant cette clé perdront l'accès à l'API.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction 
                                              className="bg-destructive hover:bg-destructive/90"
                                              onClick={() => handleRevokeApiKey(key.id)}
                                            >
                                              Révoquer
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Quota API (si plan limité) */}
                  {(mockPlan as string) === "pro" && (
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Quota API
                          </CardTitle>
                          <CardDescription>Limite de requêtes pour votre plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold">847 / 1000</span>
                            <span className="text-sm text-muted-foreground">requêtes aujourd'hui</span>
                          </div>
                          <Progress value={84.7} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            Réinitialisation à minuit (fuseau {timezone})
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Documentation */}
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                              <div className="text-left">
                                <p className="font-medium">Guide de démarrage</p>
                                <p className="text-xs text-muted-foreground">Premiers pas avec l'API</p>
                              </div>
                            </a>
                          </Button>
                          <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              <div className="text-left">
                                <p className="font-medium">Référence API</p>
                                <p className="text-xs text-muted-foreground">Endpoints et paramètres</p>
                              </div>
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Liens légaux */}
        <div className="flex items-center justify-center gap-4 pt-8 text-sm text-muted-foreground">
          <Link to="/cgu" className="hover:text-foreground transition-colors">Conditions d'utilisation</Link>
          <span>•</span>
          <Link to="/rgpd" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
          <span>•</span>
          <Link to="/legal-notice" className="hover:text-foreground transition-colors">Mentions légales</Link>
        </div>
      </div>
    </TooltipProvider>
  );
}
