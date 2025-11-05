import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Trophy, 
  Lock, 
  CheckCircle2, 
  BookOpen, 
  Target,
  Award,
  Cpu,
  Monitor,
  HardDrive,
  Zap,
  ChevronRight,
  Star
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const modules = [
  {
    id: "gpu",
    title: "Maîtriser les GPU",
    icon: Monitor,
    description: "Apprenez à identifier les bonnes affaires sur les cartes graphiques",
    progress: 75,
    lessons: 8,
    completed: 6,
    xp: 450,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    locked: false,
  },
  {
    id: "cpu",
    title: "Expertise Processeurs",
    icon: Cpu,
    description: "Devenez expert en évaluation des CPU Intel et AMD",
    progress: 40,
    lessons: 6,
    completed: 2,
    xp: 180,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    locked: false,
  },
  {
    id: "storage",
    title: "Stockage & Mémoire",
    icon: HardDrive,
    description: "SSD, HDD, RAM : tout savoir sur le stockage",
    progress: 0,
    lessons: 5,
    completed: 0,
    xp: 0,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    locked: true,
  },
  {
    id: "power",
    title: "Alimentations",
    icon: Zap,
    description: "Comprendre les certifications et la qualité des PSU",
    progress: 0,
    lessons: 4,
    completed: 0,
    xp: 0,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    locked: true,
  },
];

const lessons = [
  {
    moduleId: "gpu",
    title: "Introduction aux GPU",
    duration: "10 min",
    completed: true,
    xp: 50,
  },
  {
    moduleId: "gpu",
    title: "Architecture NVIDIA vs AMD",
    duration: "15 min",
    completed: true,
    xp: 75,
  },
  {
    moduleId: "gpu",
    title: "Comprendre les benchmarks",
    duration: "12 min",
    completed: true,
    xp: 60,
  },
  {
    moduleId: "gpu",
    title: "Évaluer l'état d'un GPU d'occasion",
    duration: "20 min",
    completed: true,
    xp: 100,
  },
  {
    moduleId: "gpu",
    title: "Mining et usure : ce qu'il faut savoir",
    duration: "15 min",
    completed: true,
    xp: 75,
  },
  {
    moduleId: "gpu",
    title: "Calculer la Fair Value d'un GPU",
    duration: "18 min",
    completed: true,
    xp: 90,
  },
  {
    moduleId: "gpu",
    title: "Négociation et pièges à éviter",
    duration: "14 min",
    completed: false,
    xp: 70,
  },
  {
    moduleId: "gpu",
    title: "Quiz Final - GPU Expert",
    duration: "10 min",
    completed: false,
    xp: 150,
    isQuiz: true,
  },
];

const badges = [
  {
    id: "gpu-novice",
    title: "Novice GPU",
    description: "Complétez 3 leçons sur les GPU",
    icon: Monitor,
    earned: true,
    earnedDate: "12 Jan 2025",
    rarity: "Commun",
  },
  {
    id: "gpu-expert",
    title: "Expert GPU",
    description: "Complétez tous les modules GPU",
    icon: Trophy,
    earned: false,
    rarity: "Rare",
  },
  {
    id: "deal-hunter",
    title: "Chasseur de Deals",
    description: "Identifiez 50 bonnes affaires",
    icon: Target,
    earned: true,
    earnedDate: "10 Jan 2025",
    rarity: "Commun",
  },
  {
    id: "perfect-score",
    title: "Score Parfait",
    description: "Obtenez 100% à un quiz",
    icon: Star,
    earned: false,
    rarity: "Épique",
  },
  {
    id: "master",
    title: "Maître HardwareDeals",
    description: "Complétez tous les modules",
    icon: Award,
    earned: false,
    rarity: "Légendaire",
  },
];

const userStats = {
  totalXP: 630,
  level: 4,
  nextLevelXP: 800,
  coursesCompleted: 8,
  badgesEarned: 2,
  streak: 7,
};

export default function Training() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const selectedModuleLessons = selectedModule
    ? lessons.filter((l) => l.moduleId === selectedModule)
    : [];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Commun": return "text-gray-500";
      case "Rare": return "text-blue-500";
      case "Épique": return "text-purple-500";
      case "Légendaire": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
            <GraduationCap className="h-10 w-10 text-primary" />
            Espace Formation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Devenez expert en deals hardware grâce à nos modules interactifs
          </p>
        </div>

        {/* User Progress Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Niveau {userStats.level}</span>
                    <span className="text-sm font-medium">{userStats.totalXP}/{userStats.nextLevelXP} XP</span>
                  </div>
                  <Progress value={(userStats.totalXP / userStats.nextLevelXP) * 100} className="h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{userStats.totalXP} XP</span>
                </div>
              </div>
              
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-card border">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{userStats.coursesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Leçons complétées</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{userStats.badgesEarned}</p>
                  <p className="text-sm text-muted-foreground">Badges débloqués</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{userStats.streak}</p>
                  <p className="text-sm text-muted-foreground">Jours de suite</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className={`hover-scale cursor-pointer transition-all ${
                      module.locked ? "opacity-60" : ""
                    }`}
                    onClick={() => !module.locked && setSelectedModule(module.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${module.bgColor}`}>
                          <Icon className={`h-8 w-8 ${module.color}`} />
                        </div>
                        {module.locked ? (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Verrouillé
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{module.completed}/{module.lessons} leçons</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{module.xp} XP</span>
                        </div>
                        {!module.locked && (
                          <Button variant="ghost" size="sm" className="gap-1">
                            Continuer
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Lesson Details Dialog */}
            {selectedModule && (
              <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {modules.find(m => m.id === selectedModule)?.icon && (
                        <div className={`p-2 rounded-lg ${modules.find(m => m.id === selectedModule)?.bgColor}`}>
                          {(() => {
                            const Icon = modules.find(m => m.id === selectedModule)?.icon!;
                            return <Icon className={`h-5 w-5 ${modules.find(m => m.id === selectedModule)?.color}`} />;
                          })()}
                        </div>
                      )}
                      {modules.find(m => m.id === selectedModule)?.title}
                    </DialogTitle>
                    <DialogDescription>
                      {modules.find(m => m.id === selectedModule)?.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-3 mt-4">
                    {selectedModuleLessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          lesson.completed 
                            ? "bg-green-500/5 border-green-500/20" 
                            : "bg-card hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-muted flex items-center justify-center">
                              <span className="text-xs font-medium">{idx + 1}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{lesson.duration}</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {lesson.xp} XP
                            </span>
                            {lesson.isQuiz && (
                              <Badge variant="outline" className="text-xs">Quiz</Badge>
                            )}
                          </div>
                        </div>

                        {!lesson.completed && (
                          <Button 
                            size="sm"
                            onClick={() => lesson.isQuiz && setQuizOpen(true)}
                          >
                            {lesson.isQuiz ? "Commencer le quiz" : "Commencer"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <div className="grid md:grid-cols-3 gap-6">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <Card 
                    key={badge.id} 
                    className={`text-center ${
                      badge.earned ? "border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5" : "opacity-60"
                    }`}
                  >
                    <CardHeader>
                      <div className="mx-auto mb-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          badge.earned 
                            ? "bg-gradient-to-br from-primary to-accent" 
                            : "bg-muted"
                        }`}>
                          <Icon className={`h-10 w-10 ${badge.earned ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{badge.title}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={badge.earned ? "default" : "outline"}
                        className={badge.earned ? getRarityColor(badge.rarity) : ""}
                      >
                        {badge.rarity}
                      </Badge>
                      {badge.earned && badge.earnedDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Obtenu le {badge.earnedDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quiz Dialog */}
        <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quiz - GPU Expert</DialogTitle>
              <DialogDescription>
                Testez vos connaissances pour débloquer le badge Expert GPU
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Le quiz contient 10 questions sur les GPU. Vous devez obtenir au moins 80% pour valider le module.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuizOpen(false)}>
                Plus tard
              </Button>
              <Button onClick={() => setQuizOpen(false)}>
                Commencer le quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
