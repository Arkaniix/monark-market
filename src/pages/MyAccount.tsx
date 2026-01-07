import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, CreditCard, Settings, Zap, Crown, Building2, 
  Calendar, ArrowUpRight, RefreshCw, AlertTriangle, 
  Mail, Shield, LogOut, Trash2, Bell, Moon, Sun, 
  ExternalLink, Loader2, Check, Info, Coins, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useEntitlements, CREDIT_COSTS, type CreditActionType } from "@/hooks/useEntitlements";
import { useUserSubscription } from "@/hooks/useProviderData";
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

const CREDIT_RESET_EXPLANATION = 
  "Les crédits sont remis à zéro à chaque nouveau cycle mensuel. " +
  "Les crédits non utilisés ne sont pas reportés au mois suivant.";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MyAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Entitlements & subscription data
  const { 
    plan, 
    planDisplayName, 
    creditsRemaining, 
    creditsResetDate, 
    currentAlerts,
    currentWatchlistItems,
    limits,
    isLoading: entitlementsLoading 
  } = useEntitlements();
  
  const { data: currentSubscription, isLoading: subscriptionLoading } = useUserSubscription();

  // Credit calculations
  const maxCreditsForPlan = plan === "starter" ? 120 : plan === "pro" ? 500 : 1500;
  const creditPercentage = Math.min((creditsRemaining / maxCreditsForPlan) * 100, 100);
  const isCreditsLow = creditPercentage < 20;
  const resetDate = creditsResetDate ? new Date(creditsResetDate) : null;
  const daysUntilReset = resetDate ? differenceInDays(resetDate, new Date()) : null;
  const isResetSoon = daysUntilReset !== null && daysUntilReset <= 7 && daysUntilReset >= 0;

  // Action costs for display
  const actionCosts: { action: CreditActionType; label: string; cost: number }[] = [
    { action: "scrap_faible", label: "Scrap standard", cost: CREDIT_COSTS.scrap_faible },
    { action: "scrap_fort", label: "Scrap avancé", cost: CREDIT_COSTS.scrap_fort },
    { action: "estimator", label: "Estimation", cost: CREDIT_COSTS.estimator },
  ];

  const getPlanIcon = () => {
    switch (plan) {
      case "starter": return <Zap className="h-5 w-5" />;
      case "pro": return <Crown className="h-5 w-5" />;
      case "elite": return <Building2 className="h-5 w-5" />;
    }
  };

  const getPlanColor = () => {
    switch (plan) {
      case "starter": return "bg-muted text-muted-foreground";
      case "pro": return "bg-primary text-primary-foreground";
      case "elite": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
    toast({ title: "Déconnexion", description: "À bientôt !" });
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const isLoading = authLoading || entitlementsLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";
  const memberSince = currentSubscription?.started_at 
    ? format(new Date(currentSubscription.started_at), "MMMM yyyy", { locale: fr })
    : "Récemment";

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
          <p className="text-muted-foreground">Gérez votre profil, abonnement et préférences</p>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="space-y-6"
        >
          {/* Section 1: Identité */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-lg">{user?.email}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Membre depuis {memberSince}
                    </p>
                  </div>
                  <Badge variant="outline" className={getPlanColor()}>
                    {planDisplayName}
                  </Badge>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Adresse email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Votre pseudo" 
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Modifier l'email
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Abonnement & Crédits */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Abonnement & Crédits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getPlanColor()}`}>
                      {getPlanIcon()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{planDisplayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan === "starter" && "9,99€/mois • 120 crédits"}
                        {plan === "pro" && "29€/mois • 500 crédits"}
                        {plan === "elite" && "79€/mois • 1500 crédits"}
                      </p>
                    </div>
                  </div>
                  {plan !== "elite" && (
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link to="/pricing">
                        <ArrowUpRight className="h-4 w-4" />
                        Changer de plan
                      </Link>
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Credits */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-medium">Crédits restants</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{CREDIT_RESET_EXPLANATION}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{creditsRemaining}</span>
                      <span className="text-muted-foreground">/ {maxCreditsForPlan}</span>
                      {isCreditsLow && <AlertTriangle className="h-5 w-5 text-warning" />}
                    </div>
                  </div>
                  
                  <Progress 
                    value={creditPercentage} 
                    className={`h-2 ${isCreditsLow ? "[&>div]:bg-warning" : ""}`}
                  />

                  {resetDate && (
                    <div className={`flex items-center gap-2 text-sm ${isResetSoon ? "text-warning" : "text-muted-foreground"}`}>
                      <RefreshCw className="h-4 w-4" />
                      <span>
                        Réinitialisation le {format(resetDate, "dd MMMM", { locale: fr })}
                        {daysUntilReset !== null && (
                          <span className="ml-1">
                            ({daysUntilReset === 0 ? "aujourd'hui" : `dans ${daysUntilReset} jour${daysUntilReset > 1 ? "s" : ""}`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {isResetSoon && creditsRemaining > 0 && (
                    <p className="text-xs text-warning p-2 bg-warning/10 rounded-lg">
                      ⚠️ {creditsRemaining} crédit{creditsRemaining > 1 ? "s" : ""} sera{creditsRemaining > 1 ? "ont" : ""} perdu{creditsRemaining > 1 ? "s" : ""} après la réinitialisation
                    </p>
                  )}
                </div>

                {/* Usage Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Bell className="h-4 w-4" />
                        Alertes actives
                      </span>
                      <span className="font-medium">
                        {currentAlerts} / {limits.maxAlerts === -1 ? "∞" : limits.maxAlerts}
                      </span>
                    </div>
                    {limits.maxAlerts !== -1 && (
                      <Progress value={(currentAlerts / limits.maxAlerts) * 100} className="h-1" />
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        Watchlist
                      </span>
                      <span className="font-medium">
                        {currentWatchlistItems} / {limits.maxWatchlistItems === -1 ? "∞" : limits.maxWatchlistItems}
                      </span>
                    </div>
                    {limits.maxWatchlistItems !== -1 && (
                      <Progress value={(currentWatchlistItems / limits.maxWatchlistItems) * 100} className="h-1" />
                    )}
                  </div>
                </div>

                {/* Credit Costs */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">Coût des actions</p>
                  <div className="flex flex-wrap gap-2">
                    {actionCosts.map(({ action, label, cost }) => (
                      <div 
                        key={action} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {cost}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="gap-2" asChild>
                    <Link to="/billing">
                      <Coins className="h-4 w-4" />
                      Recharger des crédits
                    </Link>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link to="/tracking">
                      <Bell className="h-4 w-4" />
                      Gérer alertes & watchlist
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Préférences */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Thème sombre</p>
                      <p className="text-sm text-muted-foreground">Adapter l'interface à vos préférences</p>
                    </div>
                  </div>
                  <Switch 
                    checked={theme === "dark"} 
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>

                <Separator />

                {/* Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-muted-foreground">Recevoir les alertes dans le navigateur</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <Separator />

                {/* Email alerts */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Alertes par email</p>
                      <p className="text-sm text-muted-foreground">Recevoir un email pour les alertes importantes</p>
                    </div>
                  </div>
                  <Switch 
                    checked={emailAlerts} 
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 4: Sécurité & Compte */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Sécurité & Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link to="/cgu">
                      <ExternalLink className="h-4 w-4" />
                      Conditions d'utilisation
                    </Link>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link to="/rgpd">
                      <ExternalLink className="h-4 w-4" />
                      Politique de confidentialité
                    </Link>
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                        Supprimer mon compte
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes vos données, votre watchlist, vos alertes 
                          et votre historique seront définitivement supprimés.
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
                              variant: "default"
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
      </div>
    </TooltipProvider>
  );
}
