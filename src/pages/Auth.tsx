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
  const [displayName, setDisplayName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    // Fetch subscription plans
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">HardwareMarket</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder aux données premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
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

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom d'affichage</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Votre nom"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
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
                <div className="space-y-2">
                  <Label htmlFor="signup-discord" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Discord (optionnel)
                  </Label>
                  <Input
                    id="signup-discord"
                    type="text"
                    placeholder="votre_pseudo#1234"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pour vous contacter et vous fournir un support personnalisé
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Choisissez votre plan d'abonnement</Label>
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="gap-3">
                    {plans.map((plan, index) => {
                      const isPopular = plan.name === 'Pro';
                      const isPremium = plan.name === 'Elite';
                      const PlanIcon = plan.name === 'Basic' ? TrendingUp : plan.name === 'Pro' ? Star : Crown;
                      
                      return (
                        <div key={plan.id} className="relative">
                          {isPopular && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                              <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                                Populaire
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
                              flex cursor-pointer rounded-xl border-2 border-muted bg-gradient-to-br from-card to-card/50 p-5 
                              transition-all duration-200 
                              hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]
                              peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:scale-[1.02]
                              ${isPopular ? 'border-primary/30' : ''}
                              ${isPremium ? 'bg-gradient-to-br from-accent/10 to-card' : ''}
                            `}
                          >
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                    isPremium ? 'bg-gradient-to-br from-accent to-accent/80' : 'bg-primary/10'
                                  }`}>
                                    <PlanIcon className={`h-4 w-4 ${isPremium ? 'text-accent-foreground' : 'text-primary'}`} />
                                  </div>
                                  <span className="font-bold text-lg">{plan.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-2xl text-primary">{plan.price}€</div>
                                  <div className="text-xs text-muted-foreground">/mois</div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                              
                              {plan.features && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <ul className="space-y-2">
                                    {Object.entries(plan.features).slice(0, 3).map(([key, value]: [string, any], index) => {
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
                                          className="flex items-start gap-2.5 text-xs animate-fade-in"
                                          style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                          <div className="mt-0.5 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-2.5 w-2.5 text-primary" />
                                          </div>
                                          <span className="text-foreground/80 leading-relaxed">
                                            {formatFeature(key, value)}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex items-center">
                              <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center peer-data-[state=checked]:bg-primary transition-all">
                                <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 peer-data-[state=checked]:opacity-100" />
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
