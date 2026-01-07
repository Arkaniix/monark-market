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
import { 
  User, CreditCard, Settings, Zap, Crown, Building2, 
  Calendar, ArrowUpRight, RefreshCw, AlertTriangle, 
  Mail, Shield, LogOut, Trash2, Bell, Moon, Sun, 
  Globe, Key, Monitor, Loader2, Check, Info, Coins, 
  ChevronRight, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function MyAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Preferences state (mock)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState("fr");

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

  // Credit calculations
  const maxCreditsForPlan = plan === "starter" ? 120 : plan === "pro" ? 500 : 1500;
  const creditPercentage = Math.min((creditsRemaining / maxCreditsForPlan) * 100, 100);
  const isCreditsLow = creditPercentage < 20;
  const resetDate = creditsResetDate ? new Date(creditsResetDate) : null;
  const daysUntilReset = resetDate ? differenceInDays(resetDate, new Date()) : null;

  // Action costs
  const actionCosts: { action: CreditActionType; label: string; cost: number }[] = [
    { action: "scrap_faible", label: "Scrap", cost: CREDIT_COSTS.scrap_faible },
    { action: "scrap_fort", label: "Scrap+", cost: CREDIT_COSTS.scrap_fort },
    { action: "estimator", label: "Estimation", cost: CREDIT_COSTS.estimator },
  ];

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "starter": return <Zap className="h-5 w-5" />;
      case "pro": return <Crown className="h-5 w-5" />;
      case "elite": return <Building2 className="h-5 w-5" />;
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

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const isLoading = authLoading || entitlementsLoading || subscriptionLoading || plansLoading;

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
    ? format(new Date(currentSubscription.started_at), "d MMMM yyyy", { locale: fr })
    : format(new Date(), "d MMMM yyyy", { locale: fr });

  // Filter other plans (not current)
  const otherPlans = (plans || []).filter(p => p.id !== currentSubscription?.plan_id);

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
          className="space-y-8"
        >
          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: PROFIL & IDENTITÉ
              ═══════════════════════════════════════════════════════════════════ */}
          <motion.section variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profil & Identité
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Informations en lecture seule */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs uppercase tracking-wide font-medium">
                    Informations du compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                          {isAdmin ? "Administrateur" : "Utilisateur"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </span>
                      <span className="font-medium truncate ml-4">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Membre depuis
                      </span>
                      <span className="font-medium">{memberSince}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paramètres modifiables */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs uppercase tracking-wide font-medium">
                    Paramètres modifiables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="displayName" className="text-sm">Nom d'affichage</Label>
                    <div className="flex gap-2 mt-1.5">
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

                  {/* Préférences rapides */}
                  <div className="space-y-3">
                    {/* Langue */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">Langue</span>
                      </div>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Thème */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        <span className="text-sm">Thème sombre</span>
                      </div>
                      <Switch 
                        checked={theme === "dark"} 
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    </div>
                    {/* Notifications push */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm">Notifications push</span>
                      </div>
                      <Switch 
                        checked={notificationsEnabled} 
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    {/* Alertes email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Alertes email</span>
                      </div>
                      <Switch 
                        checked={emailAlerts} 
                        onCheckedChange={setEmailAlerts}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: ABONNEMENT ACTIF
              ═══════════════════════════════════════════════════════════════════ */}
          <motion.section variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Abonnement
            </h2>
            
            {/* Plan actif - Mise en avant claire */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {getPlanIcon(plan)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{planDisplayName}</CardTitle>
                        <Badge className="bg-primary text-primary-foreground">Plan actif</Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {plan === "starter" && "Accès aux fonctionnalités essentielles"}
                        {plan === "pro" && "Scrap avancé, exports et statistiques détaillées"}
                        {plan === "elite" && "Accès complet et illimité à toutes les fonctionnalités"}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3 rounded-lg bg-background/50 border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prix mensuel</p>
                    <p className="text-2xl font-bold">
                      {plan === "starter" && "9,99€"}
                      {plan === "pro" && "29€"}
                      {plan === "elite" && "79€"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crédits / mois</p>
                    <p className="text-2xl font-bold">{maxCreditsForPlan}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Réinitialisation</p>
                    <p className="text-lg font-semibold">
                      {resetDate ? format(resetDate, "d MMM", { locale: fr }) : "—"}
                    </p>
                    {daysUntilReset !== null && (
                      <p className="text-xs text-muted-foreground">
                        {daysUntilReset === 0 ? "Aujourd'hui" : `Dans ${daysUntilReset} jour${daysUntilReset > 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fonctionnalités incluses */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Inclus dans votre plan</p>
                  <div className="flex flex-wrap gap-2">
                    {plan === "starter" && (
                      <>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Catalogue complet</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />3 alertes max</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Scrap standard</Badge>
                      </>
                    )}
                    {plan === "pro" && (
                      <>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />20 alertes max</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Scrap avancé</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Historique 90j</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Statistiques</Badge>
                      </>
                    )}
                    {plan === "elite" && (
                      <>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Alertes illimitées</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Scrap illimité</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Export données</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Accès API</Badge>
                        <Badge variant="secondary" className="gap-1"><Check className="h-3 w-3" />Support prioritaire</Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Autres plans disponibles */}
            {plan !== "elite" && otherPlans.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Améliorer votre plan</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {otherPlans
                    .filter(p => {
                      // Only show upgrade options
                      const planOrder = { starter: 1, pro: 2, elite: 3 };
                      const currentOrder = planOrder[plan] || 0;
                      const otherOrder = planOrder[p.name.toLowerCase() as keyof typeof planOrder] || 0;
                      return otherOrder > currentOrder;
                    })
                    .map(otherPlan => {
                      const isPro = otherPlan.name.toLowerCase() === "pro";
                      const isElite = otherPlan.name.toLowerCase().includes("elite");
                      const planCredits = typeof otherPlan.features === 'object' && otherPlan.features !== null 
                        ? (otherPlan.features as Record<string, unknown>).credits 
                        : null;

                      return (
                        <Card key={otherPlan.id} className="hover:border-muted-foreground/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {getPlanIcon(otherPlan.name)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">{otherPlan.name}</p>
                                    {isPro && <Badge variant="outline" className="text-xs">Populaire</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {otherPlan.price}€/mois • {typeof planCredits === 'number' ? planCredits : "—"} crédits
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <Link to="/pricing">
                                  <ArrowUpRight className="h-4 w-4" />
                                  Voir
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: CRÉDITS & UTILISATION
              ═══════════════════════════════════════════════════════════════════ */}
          <motion.section variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Crédits & Utilisation
            </h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Crédits restants ce mois</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-bold">{creditsRemaining}</span>
                      <span className="text-muted-foreground">/ {maxCreditsForPlan}</span>
                      {isCreditsLow && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          </TooltipTrigger>
                          <TooltipContent>Crédits bientôt épuisés</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Réinitialisation</p>
                    <p className="font-semibold mt-1">
                      {resetDate ? format(resetDate, "d MMMM", { locale: fr }) : "—"}
                    </p>
                    {daysUntilReset !== null && (
                      <p className="text-xs text-muted-foreground">
                        {daysUntilReset === 0 ? "Aujourd'hui" : `Dans ${daysUntilReset} jour${daysUntilReset > 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                </div>

                <Progress 
                  value={creditPercentage} 
                  className={`h-3 mb-4 ${isCreditsLow ? "[&>div]:bg-warning" : ""}`}
                />

                {/* Coût par action - discret */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {actionCosts.map(({ action, label, cost }) => (
                      <span key={action} className="flex items-center gap-1">
                        {label}: <span className="font-medium text-foreground">{cost}</span>
                      </span>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                    <Link to="/billing">
                      <Sparkles className="h-4 w-4" />
                      Recharger
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 4: ACTIONS DE COMPTE
              ═══════════════════════════════════════════════════════════════════ */}
          <motion.section variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Actions de compte
            </h2>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Actions standard */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Changer le mot de passe
                  </Button>
                  
                  {plan === "elite" && (
                    <Button variant="outline" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Gérer l'accès API
                    </Button>
                  )}
                  
                  <Button variant="outline" className="gap-2">
                    <Monitor className="h-4 w-4" />
                    Déconnecter toutes les sessions
                  </Button>
                </div>

                <Separator />

                {/* Zone danger */}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    Zone sensible
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="gap-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer mon compte
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
      </div>
    </TooltipProvider>
  );
}
