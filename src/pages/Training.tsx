import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GraduationCap, Award, Clock, BookOpen, CheckCircle2, Circle, Download, ExternalLink, Hand, ShieldCheck, Lock, AlertCircle, TrendingUp, Calculator, Settings, Shield, ChevronDown, ArrowRight, MessageCircle, Users, Trophy, FileText, Video, HelpCircle } from "lucide-react";
import { mockUserProgress, mockTrainingModules, mockBadges, mockGuides, mockFAQ, bestPractices, forbiddenPractices } from "@/lib/trainingMockData";
import { toast } from "sonner";
export default function Training() {
  const [openFAQ, setOpenFAQ] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const progressPercentage = mockUserProgress.modules_completed.length / mockUserProgress.total_modules * 100;
  const handleStartModule = (moduleId: number) => {
    toast.success(`Module ${moduleId} démarré !`);
  };
  const handleCompleteModule = (moduleId: number) => {
    toast.success(`Module ${moduleId} terminé ! +1 crédit`);
  };
  const handleStartQuiz = () => {
    // Simulate quiz completion
    const score = 8;
    setQuizScore(score);
    toast.success(`Quiz terminé ! Score: ${score}/10 - +1 crédit`);
  };
  const handleDownloadCertificate = () => {
    toast.info("Fonctionnalité à venir : Export du certificat PDF");
  };
  const getIconForGuide = (iconName: string) => {
    const icons: Record<string, any> = {
      "book-open": BookOpen,
      "calculator": Calculator,
      "trending-up": TrendingUp,
      "settings": Settings,
      "shield": Shield
    };
    return icons[iconName] || BookOpen;
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
            Apprends à utiliser les outils, à contribuer efficacement et à interpréter les données comme un pro.
          </p>
          
          <Alert className="max-w-3xl mx-auto border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chaque utilisateur formé améliore la qualité du marché. Termine les modules et débloque des avantages communautaires (crédits bonus, badges, rangs Discord, etc.)
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
                Ma Progression & Badges
              </CardTitle>
              <CardDescription>
                Suis ton parcours d'apprentissage et débloque des récompenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Modules terminés</span>
                  <span className="text-sm text-muted-foreground">
                    {mockUserProgress.modules_completed.length}/{mockUserProgress.total_modules}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{mockUserProgress.modules_completed.length}/{mockUserProgress.total_modules}</p>
                    <p className="text-xs text-muted-foreground">Modules terminés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{mockUserProgress.hours_spent.toFixed(0)}h</p>
                    <p className="text-xs text-muted-foreground">Heures d'apprentissage</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{mockUserProgress.badges.length}</p>
                    <p className="text-xs text-muted-foreground">Badges débloqués</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">+{mockUserProgress.credits_earned}</p>
                    <p className="text-xs text-muted-foreground">Crédits bonus</p>
                  </CardContent>
                </Card>
              </div>

              {/* Badges */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges débloqués
                </h3>
                <div className="flex flex-wrap gap-3">
                  {mockBadges.map(badge => <div key={badge.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${badge.earned ? "border-primary bg-primary/10" : "border-border bg-muted/50 opacity-60"}`}>
                      <span className="text-2xl">{badge.name.split(" ")[0]}</span>
                      <div>
                        <p className="text-sm font-medium">{badge.name.split(" ").slice(1).join(" ")}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>)}
                </div>
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Modules de Formation</h2>
            <p className="text-muted-foreground">Parcours progressif pour maîtriser la plateforme</p>
          </div>

          <Accordion type="multiple" className="space-y-4">
            {mockTrainingModules.map((module, index) => <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${module.completed ? "bg-green-500" : "bg-primary"}`}>
                      {module.completed ? <CheckCircle2 className="h-6 w-6 text-white" /> : <span className="text-xl font-bold text-white">{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{module.title}</h3>
                        {module.completed && <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                            Terminé
                          </Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.objective}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          {module.quizQuestions} questions
                        </span>
                        {module.creditReward > 0 && <span className="flex items-center gap-1 text-primary">
                            <Award className="h-3 w-3" />
                            +{module.creditReward} crédit
                          </span>}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-accent/20">
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
                        Contenu du module
                      </h4>
                      <ul className="space-y-2">
                        {module.content.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>)}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Ressources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {module.resources.map((resource, i) => <Badge key={i} variant="outline" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {resource}
                          </Badge>)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      {!module.completed ? <Button onClick={() => handleStartModule(module.id)}>
                          Commencer le module
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button> : <Button variant="outline" onClick={() => handleStartModule(module.id)}>
                          Revoir le module
                        </Button>}
                      {module.badge && <Badge className="bg-primary/10 text-primary border-primary/20">
                          Badge : {module.badge}
                        </Badge>}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </motion.section>

        {/* Practical Guides */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Guides Pratiques</h2>
            <p className="text-muted-foreground">Références rapides pour utiliser la plateforme</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGuides.map(guide => {
            const Icon = getIconForGuide(guide.icon);
            return <Card key={guide.id} className="hover-scale cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                    </div>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to={guide.url}>
                        Consulter
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>

          <Button variant="outline" className="w-full mt-4">
            <Download className="mr-2 h-4 w-4" />
            Télécharger tous les guides en PDF
          </Button>
        </motion.section>

        {/* Best Practices & GDPR */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Bonnes Pratiques & RGPD</h2>
            <p className="text-muted-foreground">Respecte ces principes pour contribuer de manière éthique et sécurisée</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Good Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  À Faire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bestPractices.map((practice, index) => {
                const Icon = practice.icon === "hand" ? Hand : practice.icon === "shield-check" ? ShieldCheck : practice.icon === "check-circle" ? CheckCircle2 : practice.icon === "clock" ? Clock : Lock;
                return <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <Icon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{practice.title}</p>
                        <p className="text-xs text-muted-foreground">{practice.description}</p>
                      </div>
                    </div>;
              })}
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link to="/rgpd">Voir la politique RGPD complète →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Forbidden Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  À Ne Jamais Faire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forbiddenPractices.map((practice, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{practice.title}</p>
                      <p className="text-xs text-muted-foreground">{practice.description}</p>
                    </div>
                  </div>)}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Quiz Section */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Quiz Final – Vérification des Acquis
              </CardTitle>
              <CardDescription>
                Teste tes connaissances avec 10 questions couvrant les 4 modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizScore === null ? <>
                  <p className="text-sm text-muted-foreground">
                    Score requis : 8/10 minimum pour obtenir le badge et +1 crédit bonus
                  </p>
                  <Button onClick={handleStartQuiz} size="lg">
                    Commencer le quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </> : <Alert className={quizScore >= 8 ? "border-green-500 bg-green-500/5" : "border-orange-500 bg-orange-500/5"}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-1">Score: {quizScore}/10</p>
                    {quizScore >= 8 ? <p className="text-sm">Bravo ! Tu maîtrises les bases. +1 crédit gagné</p> : quizScore >= 5 ? <p className="text-sm">Bien, mais révise les bonnes pratiques.</p> : <p className="text-sm">Refais la formation avant de contribuer.</p>}
                  </AlertDescription>
                </Alert>}
            </CardContent>
          </Card>
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
              <div className="space-y-2">
                {mockFAQ.map((faq, index) => <Collapsible key={index}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors text-left">
                      <span className="font-medium">{faq.question}</span>
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>)}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm font-medium">Besoin d'aide supplémentaire ?</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://discord.gg/hardwaredeals" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Discord #aide-formation
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Poser une question
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