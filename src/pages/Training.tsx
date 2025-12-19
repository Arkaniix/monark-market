import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GraduationCap, Clock, BookOpen, CheckCircle2, Lock, AlertCircle, TrendingUp, Calculator, ChevronDown, ArrowRight, MessageCircle, Users, Trophy, Video } from "lucide-react";
import { toast } from "sonner";
import { useTrainingData, useCompleteModule } from "@/hooks/useProviderData";
import { TrainingSkeleton } from "@/components/training/TrainingSkeleton";
export default function Training() {
  const [openFAQ, setOpenFAQ] = useState<string[]>([]);
  const {
    data: trainingData,
    isLoading,
    error,
    refetch
  } = useTrainingData();
  const completeModuleMutation = useCompleteModule();

  // Loading state
  if (isLoading) {
    return <TrainingSkeleton />;
  }

  // Error state
  if (error) {
    return <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger la formation.
              <Button variant="link" className="px-2" onClick={() => refetch()}>
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>;
  }

  // Empty state
  if (!trainingData) {
    return <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucune donnée</AlertTitle>
            <AlertDescription>Aucun module de formation disponible pour le moment.</AlertDescription>
          </Alert>
        </div>
      </div>;
  }
  const {
    progress,
    modules,
    faq
  } = trainingData;
  const progressPercentage = progress.modules_completed.length / progress.total_modules * 100;

  // Check if a module is unlocked (previous module must be completed)
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    const previousModule = modules[moduleIndex - 1];
    return previousModule?.completed ?? false;
  };
  const handleStartModule = (moduleId: number) => {
    toast.success(`Module ${moduleId} démarré !`);
  };
  const handleCompleteModule = (moduleId: number) => {
    completeModuleMutation.mutate(moduleId, {
      onSuccess: () => {
        toast.success(`Module ${moduleId} terminé !`);
      },
      onError: () => {
        toast.error("Erreur lors de la validation du module");
      }
    });
  };
  return <div className="min-h-screen py-8">
      <div className="container max-w-7xl space-y-12">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
            <GraduationCap className="h-12 w-12 text-primary" />
            Formation – Deviens un expert du marché hardware
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Apprends à utiliser les outils, à contribuer efficacement et à interpréter les données
            comme un pro.
          </p>

          <Alert className="max-w-3xl mx-auto border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chaque utilisateur formé améliore la qualité du marché. Termine les modules pour
              maîtriser la plateforme et contribuer efficacement à la communauté.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Progress & Badges */}
        <motion.section id="progression" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Ma Progression
              </CardTitle>
              <CardDescription>Suis ton parcours d'apprentissage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Modules terminés</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.modules_completed.length}/{progress.total_modules}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">
                      {progress.modules_completed.length}/{progress.total_modules}
                    </p>
                    <p className="text-xs text-muted-foreground">Modules terminés</p>
                  </CardContent>
                </Card>
                
                
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Training Modules */}
        <motion.section id="modules" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Maîtriser l'achat-revente hardware</h2>
            <p className="text-lg text-muted-foreground mb-2">
              🎯 Apprendre à comprendre le marché, repérer les bonnes affaires, acheter malin,
              revendre efficacement, et utiliser la plateforme comme un levier de rentabilité.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>⏱️ Durée estimée : 45–60 min</span>
              <span>📚 Format : modules fluides, exemples concrets, graphiques simples</span>
            </div>
          </div>

          {modules.length === 0 ? <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Aucun module disponible pour le moment.</AlertDescription>
            </Alert> : <Accordion type="multiple" className="space-y-4">
              {modules.map((module, index) => {
            const unlocked = isModuleUnlocked(index);
            return <AccordionItem key={module.id} value={`module-${module.id}`} className={`border rounded-lg overflow-hidden ${!unlocked ? "opacity-60" : ""}`} disabled={!unlocked}>
                    <AccordionTrigger className={`px-6 py-4 hover:no-underline ${unlocked ? "hover:bg-accent/50" : "cursor-not-allowed"}`} disabled={!unlocked}>
                      <div className="flex items-center gap-4 text-left w-full">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${module.completed ? "bg-green-500" : unlocked ? "bg-primary" : "bg-muted"}`}>
                          {module.completed ? <CheckCircle2 className="h-6 w-6 text-white" /> : !unlocked ? <Lock className="h-6 w-6 text-muted-foreground" /> : <span className="text-xl font-bold text-white">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            {module.completed && <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                                Terminé
                              </Badge>}
                            {!unlocked && <Badge variant="outline" className="gap-1">
                                <Lock className="h-3 w-3" />
                                Verrouillé
                              </Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {module.lessons.length} leçons
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    {unlocked && <AccordionContent className="px-6 py-4 bg-accent/20">
                        <div className="space-y-4">
                          {/* Video Placeholder */}
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                            <div className="text-center">
                              <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Vidéo de présentation</p>
                            </div>
                          </div>

                          {/* Content */}
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Leçons du module
                            </h4>
                            <ul className="space-y-2">
                              {module.lessons.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>)}
                            </ul>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            {!module.completed ? <>
                                <Button onClick={() => handleStartModule(module.id)}>
                                  Commencer le module
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => handleCompleteModule(module.id)} disabled={completeModuleMutation.isPending}>
                                  {completeModuleMutation.isPending ? "Validation..." : "Marquer comme terminé"}
                                </Button>
                              </> : <Button variant="outline" onClick={() => handleStartModule(module.id)}>
                                Revoir le module
                              </Button>}
                          </div>
                        </div>
                      </AccordionContent>}
                  </AccordionItem>;
          })}
            </Accordion>}
        </motion.section>

        {/* FAQ */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }}>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">FAQ & Support</h2>
            <p className="text-muted-foreground">Questions fréquemment posées</p>
          </div>

          <Card>
            <CardContent className="p-6">
              {faq.length === 0 ? <p className="text-muted-foreground text-center py-4">Aucune FAQ disponible</p> : <div className="space-y-2">
                  {faq.map((item, index) => <Collapsible key={index}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors text-left">
                        <span className="font-medium">{item.question}</span>
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
                        {item.answer}
                      </CollapsibleContent>
                    </Collapsible>)}
                </div>}

              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm font-medium">Besoin d'aide supplémentaire ?</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://discord.gg/hardwaredeals" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Discord #aide-formation
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTAs */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.7
      }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Rejoindre la Communauté</CardTitle>
              <CardDescription>Contribue au scrap communautaire</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/community">
                  Accéder
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Explorer les Tendances</CardTitle>
              <CardDescription>Analyse du marché hardware</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/trends">
                  Accéder
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Essayer un Scrap</CardTitle>
              <CardDescription>Découvre le catalogue de modèles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/catalog">
                  Accéder
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <Calculator className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Tester l'Estimator</CardTitle>
              <CardDescription>Estime la valeur de ton matos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/estimator">
                  Accéder
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>;
}