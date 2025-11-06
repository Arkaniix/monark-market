import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, MessageCircle, Crown, Star, TrendingUp, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const discordSchema = z.string().max(100, "L'identifiant Discord doit contenir moins de 100 caractères").optional();

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [mostPopularPlanId, setMostPopularPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Fetch subscription plans and determine most popular
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (!error && data) {
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0].id);
        }
        
        // Get the most popular plan based on active subscriptions
        const { data: subscriptions } = await supabase
          .from("user_subscriptions")
          .select("plan_id")
          .eq("status", "active");
        
        if (subscriptions && subscriptions.length > 0) {
          // Count subscriptions per plan
          const planCounts = subscriptions.reduce((acc: Record<string, number>, sub) => {
            acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
            return acc;
          }, {});
          
          // Find plan with most subscribers
          const mostPopular = Object.entries(planCounts).reduce((max, [planId, count]) => 
            count > max.count ? { planId, count } : max
          , { planId: '', count: 0 });
          
          if (mostPopular.planId) {
            setMostPopularPlanId(mostPopular.planId);
          }
        }
      }
    };

    fetchPlans();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (discordId) {
        discordSchema.parse(discordId);
      }

      if (password !== confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!selectedPlan) {
        toast({
          title: "Plan requis",
          description: "Veuillez sélectionner un plan d'abonnement.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            discord_id: discordId || null,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Erreur",
            description: "Cet email est déjà utilisé. Essayez de vous connecter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (authData.user) {
        // Get the selected plan details to set initial credits
        const selectedPlanData = plans.find(p => p.id === selectedPlan);
        const initialCredits = selectedPlanData?.name === 'Basic' ? 30 
          : selectedPlanData?.name === 'Pro' ? 120 
          : selectedPlanData?.name === 'Elite' ? 300 
          : 30;

        // Create subscription for the user
        const { error: subError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: authData.user.id,
            plan_id: selectedPlan,
            status: "active",
            credits_remaining: initialCredits,
            credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (subError) {
          console.error("Error creating subscription:", subError);
        }

        toast({
          title: "Succès",
          description: "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 lg:p-8">
      <div className={`w-full grid gap-8 items-start ${activeTab === 'signup' ? 'max-w-[1400px] lg:grid-cols-[380px_1fr]' : 'max-w-6xl lg:grid-cols-2'}`}>
        {/* Left Panel - Marketing Content (hidden on mobile) */}
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
                <p className="text-muted-foreground text-sm">
                  Rejoignez des milliers de passionnés et partagez vos trouvailles
                </p>
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
          <Tabs defaultValue="signin" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Left Column: Personal Info & Security */}
                  <div className="space-y-5">
                    {/* Personal Information Section */}
                    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                      <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        Informations personnelles
                      </h3>
                      
                      <div className="space-y-2.5">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-name" className="text-xs font-medium">Nom d'affichage</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Votre nom"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-9 bg-background/50 border-border/70 focus:border-primary transition-colors"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-email" className="text-xs font-medium">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-9 bg-background/50 border-border/70 focus:border-primary transition-colors"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-discord" className="flex items-center gap-2 text-xs font-medium">
                            <MessageCircle className="w-3 h-3 text-primary" />
                            Discord <span className="text-muted-foreground font-normal">(optionnel)</span>
                          </Label>
                          <Input
                            id="signup-discord"
                            type="text"
                            placeholder="votre_pseudo#1234"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            className="h-9 bg-background/50 border-border/70 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                      <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        Sécurité
                      </h3>
                      
                      <div className="space-y-2.5">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-password" className="text-xs font-medium">Mot de passe</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="h-9 pr-10 bg-background/50 border-border/70 focus:border-primary transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-confirm-password" className="text-xs font-medium">Confirmer le mot de passe</Label>
                          <div className="relative">
                            <Input
                              id="signup-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="h-9 pr-10 bg-background/50 border-border/70 focus:border-primary transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Subscription Plans */}
                  <div className="space-y-4 p-5 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Choisissez votre plan
                    </h3>
                    
                    <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
                      {plans.map((plan) => {
                        const isPopular = plan.id === mostPopularPlanId;
                        const isPremium = plan.name === 'Elite';
                        const PlanIcon = plan.name === 'Basic' ? TrendingUp : plan.name === 'Pro' ? Star : Crown;
                        
                        return (
                          <div key={plan.id} className="relative">
                            {isPopular && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                                  ⭐ Populaire
                                </span>
                              </div>
                            )}
                            <RadioGroupItem
                              value={plan.id}
                              id={plan.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={plan.id}
                              className={`
                                flex cursor-pointer rounded-xl border-2 bg-card p-4 
                                transition-all duration-300 
                                hover:border-primary/50 hover:shadow-lg hover:scale-[1.01]
                                peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:bg-primary/5
                                ${isPopular ? 'border-primary/30' : 'border-muted'}
                                ${isPremium ? 'bg-gradient-to-br from-accent/10 to-card border-accent/30' : ''}
                              `}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ${
                                      isPremium 
                                        ? 'bg-gradient-to-br from-accent to-accent/80' 
                                        : 'bg-gradient-to-br from-primary/20 to-primary/10'
                                    }`}>
                                      <PlanIcon className={`h-5 w-5 ${
                                        isPremium ? 'text-accent-foreground' : 'text-primary'
                                      }`} />
                                    </div>
                                    <div>
                                      <span className="font-bold text-lg">{plan.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-2xl text-primary">{plan.price}€</div>
                                    <div className="text-xs text-muted-foreground">par mois</div>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>
                                
                                {plan.features && (
                                  <div className="pt-3 border-t border-border/40">
                                    <p className="text-xs font-semibold text-foreground/80 mb-2">Fonctionnalités incluses :</p>
                                    <ul className="space-y-2">
                                      {Object.entries(plan.features).map(([key, value]: [string, any]) => {
                                        const formatFeature = (k: string, v: any) => {
                                          if (typeof v === 'boolean') {
                                            return k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                          }
                                          const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                          return `${label} : ${v}`;
                                        };
                                        
                                        return (
                                          <li 
                                            key={key} 
                                            className="flex items-start gap-2 text-sm"
                                          >
                                            <div className="h-4 w-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <Check className="h-2.5 w-2.5 text-primary" />
                                            </div>
                                            <span className="text-foreground/80">
                                              {formatFeature(key, value)}
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="ml-3 flex items-start pt-1">
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedPlan === plan.id 
                                    ? 'border-primary bg-primary' 
                                    : 'border-muted-foreground/30'
                                }`}>
                                  <Check className={`h-3 w-3 text-primary-foreground transition-opacity ${
                                    selectedPlan === plan.id ? 'opacity-100' : 'opacity-0'
                                  }`} />
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Inscription en cours...
                    </span>
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
