import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ApiException } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Crown, Star, TrendingUp, Eye, EyeOff, ShieldCheck, User as UserIcon, ArrowLeft, Check, Rocket, Award } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const displayNameSchema = z.string().trim().min(1, "Le nom d'affichage est requis").max(50, "Le nom d'affichage doit contenir moins de 50 caractères").regex(/^[a-zA-Z0-9\s\-_]+$/, "Seuls les lettres, chiffres, espaces, tirets et underscores sont autorisés");
const discordSchema = z.string().max(100, "L'identifiant Discord doit contenir moins de 100 caractères").optional();

// Plan configuration for signup
const SIGNUP_PLANS = [{
  id: "starter",
  name: "Starter",
  price: 9.90,
  credits: 120,
  features: ["3 alertes", "Scrap standard", "Estimator basique"],
  icon: Zap,
  popular: false
}, {
  id: "pro",
  name: "Pro",
  price: 29,
  credits: 500,
  features: ["20 alertes", "Scrap avancé", "Formation complète"],
  icon: Award,
  popular: true
}, {
  id: "elite",
  name: "Élite",
  price: 79,
  credits: 1500,
  features: ["500 alertes", "Export données", "Support prioritaire"],
  icon: Rocket,
  popular: false
}];
export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro"); // Default to Pro
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user,
    login,
    register,
    isLoading,
    isMockMode
  } = useAuth();
  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, []);
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      displayNameSchema.parse(displayName);
      if (discordId) {
        discordSchema.parse(discordId);
      }
      if (password !== confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      await register({
        email,
        password,
        display_name: displayName,
        discord_id: discordId || undefined,
        plan_id: selectedPlan
      });
      toast({
        title: "Succès",
        description: `Compte créé avec le plan ${SIGNUP_PLANS.find(p => p.id === selectedPlan)?.name || selectedPlan} !`
      });
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else if (error instanceof ApiException) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'inscription.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Dev-only: log provider mode
    if (import.meta.env.DEV) {
      console.log(`[Auth] Login attempt | Provider: ${isMockMode ? 'mock' : 'api'} | Email: ${email}`);
    }
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      await login(email, password);
      if (import.meta.env.DEV) {
        console.log(`[Auth] Login success | Provider: ${isMockMode ? 'mock' : 'api'}`);
      }
      toast({
        title: "Connecté",
        description: "Bienvenue !"
      });
      navigate("/");
    } catch (error) {
      // Dev-only: detailed error logging
      if (import.meta.env.DEV) {
        if (error instanceof ApiException) {
          console.error(`[Auth] Login error | Provider: api | Status: ${error.status} | Endpoint: /v1/auth/login | Message: ${error.message}`);
        } else if (error instanceof Error) {
          console.error(`[Auth] Login error | Provider: ${isMockMode ? 'mock' : 'api'} | Message: ${error.message}`);
        } else {
          console.error(`[Auth] Login error | Provider: ${isMockMode ? 'mock' : 'api'} | Unknown error:`, error);
        }
      }
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else if (error instanceof ApiException) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else if (error instanceof Error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Identifiants incorrects.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick mock login handlers
  const handleMockLogin = async (type: 'admin' | 'user') => {
    const credentials = type === 'admin' ? {
      email: 'admin@test.com',
      password: 'Admin123!'
    } : {
      email: 'user@test.com',
      password: 'User123!'
    };
    setEmail(credentials.email);
    setPassword(credentials.password);
    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      toast({
        title: "Connecté (mock)",
        description: `Bienvenue ${type === 'admin' ? 'Admin' : 'User'} !`
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 lg:p-8 relative">
      {/* Bouton retour vers la page d'accueil */}
      <Link to="/landing" className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </Link>

      <div className="w-full max-w-6xl grid gap-8 items-start lg:grid-cols-2">
        {/* Left Panel - Marketing Content */}
        <div className="hidden lg:flex flex-col gap-8 p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Zap className="h-9 w-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  HardwareMarket
                </h1>
                <p className="text-muted-foreground">Votre marketplace hardware intelligent</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start group hover:translate-x-2 transition-transform">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Analyse de tendances</h3>
                <p className="text-muted-foreground text-sm">
                  Accédez aux données de prix en temps réel et aux tendances du marché hardware
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group hover:translate-x-2 transition-transform">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Deals exclusifs</h3>
                <p className="text-muted-foreground text-sm">
                  Découvrez les meilleures offres avant tout le monde avec notre système d'alerte
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group hover:translate-x-2 transition-transform">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 group-hover:bg-warning/20 transition-colors">
                <Crown className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Communauté active</h3>
                <p className="text-muted-foreground text-sm">Rejoignez des centaines de passionnés et partagez vos trouvailles</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Déjà <span className="font-semibold text-primary">10,000+</span> utilisateurs nous font confiance
            </p>
          </div>
        </div>

        {/* Right Panel - Auth Card */}
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2 lg:hidden">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl lg:text-3xl">
              <span className="lg:hidden">HardwareMarket</span>
              <span className="hidden lg:inline">Commencez maintenant</span>
            </CardTitle>
            <CardDescription className="text-base">
              Connectez-vous pour accéder aux données premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" asChild>
                <motion.div initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: 20
              }} transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Mot de passe</Label>
                      <div className="relative">
                        <Input id="signin-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>

                    {/* Mock mode quick login buttons */}
                    {isMockMode && <div className="space-y-2 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground text-center">Mode développement</p>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => handleMockLogin('admin')} disabled={loading}>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin (mock)
                          </Button>
                          <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => handleMockLogin('user')} disabled={loading}>
                            <UserIcon className="h-3 w-3 mr-1" />
                            User (mock)
                          </Button>
                        </div>
                      </div>}
                  </form>
                </motion.div>
              </TabsContent>

              <TabsContent value="signup" className="mt-6" asChild>
                <motion.div initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-displayname">Nom d'affichage</Label>
                      <Input id="signup-displayname" type="text" placeholder="MonPseudo" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-discord">Discord (optionnel)</Label>
                      <Input id="signup-discord" type="text" placeholder="username#1234" value={discordId} onChange={e => setDiscordId(e.target.value)} />
                    </div>
                    
                    {/* Plan Selection */}
                    <div className="space-y-3">
                      <Label>Choisir votre plan</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {SIGNUP_PLANS.map(plan => {
                        const isSelected = selectedPlan === plan.id;
                        const PlanIcon = plan.icon;
                        return <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} className={cn("relative flex flex-col items-center p-3 rounded-lg border-2 transition-all text-left", isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50 hover:bg-muted/50")}>
                              {plan.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0">
                                  Populaire
                                </Badge>}
                              <PlanIcon className={cn("h-5 w-5 mb-1", isSelected ? "text-primary" : "text-muted-foreground")} />
                              <span className={cn("font-semibold text-sm", isSelected && "text-primary")}>
                                {plan.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {plan.price}€/mois
                              </span>
                              {isSelected && <div className="absolute top-1 right-1">
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                </div>}
                            </button>;
                      })}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {SIGNUP_PLANS.find(p => p.id === selectedPlan)?.credits} crédits/mois • {SIGNUP_PLANS.find(p => p.id === selectedPlan)?.features.join(" • ")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input id="signup-confirm" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="pr-10" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Création..." : "Créer mon compte"}
                    </Button>
                  </form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
}