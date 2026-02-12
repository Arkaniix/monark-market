import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Video, CheckCircle2, PlayCircle, Lock, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TrainingModule {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  modules: string;
  duration: string;
  progress?: number;
  tags: string[];
  detailModules: { title: string; duration: string; completed: boolean }[];
  description: string;
}

const trainingModules: TrainingModule[] = [
  {
    id: "intro",
    title: "Introduction",
    subtitle: "Premiers pas sur Monark",
    icon: GraduationCap,
    iconColor: "text-primary",
    modules: "5 modules",
    duration: "2h de contenu",
    progress: 60,
    tags: [],
    description: "Découvrez les bases de la plateforme et apprenez à naviguer efficacement dans les outils Monark.",
    detailModules: [
      { title: "Présentation de la plateforme", duration: "15 min", completed: true },
      { title: "Comprendre le tableau de bord", duration: "20 min", completed: true },
      { title: "Lancer votre premier scan", duration: "25 min", completed: true },
      { title: "Lire une fiche modèle", duration: "30 min", completed: false },
      { title: "Configurer vos premières alertes", duration: "30 min", completed: false },
    ],
  },
  {
    id: "advanced",
    title: "Avancé",
    subtitle: "Maîtrisez le marché",
    icon: Video,
    iconColor: "text-accent",
    modules: "8 modules",
    duration: "4h de contenu",
    tags: ["Stratégies", "Négociation", "Analyse"],
    description: "Approfondissez vos compétences avec des stratégies avancées d'achat-revente et d'analyse de marché.",
    detailModules: [
      { title: "Comprendre les cycles du marché", duration: "30 min", completed: false },
      { title: "Techniques de négociation avancées", duration: "35 min", completed: false },
      { title: "Analyser la rentabilité d'une opération", duration: "30 min", completed: false },
      { title: "Optimiser ses listings de revente", duration: "25 min", completed: false },
      { title: "Stratégies de timing d'achat", duration: "35 min", completed: false },
      { title: "Gestion du stock et des flux", duration: "25 min", completed: false },
      { title: "Automatiser sa veille marché", duration: "30 min", completed: false },
      { title: "Bâtir une rentabilité durable", duration: "30 min", completed: false },
    ],
  },
];

export function FormationPreview() {
  const [selected, setSelected] = useState<TrainingModule | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Parcours de formation</span>
            <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Exemple fictif</Badge>
          </div>
          <Badge className="bg-accent/10 text-accent border-0 text-xs">2 niveaux</Badge>
        </div>
        <div className="space-y-2.5">
          {trainingModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelected(mod)}
              className="w-full bg-background/50 border rounded-lg p-3 space-y-2 text-left hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg ${mod.id === "intro" ? "bg-primary/10" : "bg-accent/10"} flex items-center justify-center`}>
                  <mod.icon className={`h-4 w-4 ${mod.iconColor} group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                  <div className="text-sm font-medium">{mod.title}</div>
                  <div className="text-[10px] text-muted-foreground">{mod.modules} • {mod.duration}</div>
                </div>
              </div>
              {mod.progress !== undefined && (
                <>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${mod.progress}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{mod.progress}% complété</div>
                </>
              )}
              {mod.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  {mod.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Vidéos, quiz et exercices pratiques inclus
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.title}
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Pro</Badge>
            </DialogTitle>
            <DialogDescription>{selected?.subtitle}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected.description}</p>

              {selected.progress !== undefined && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold">{selected.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selected.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground mb-2">Contenu du parcours</div>
                {selected.detailModules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    {mod.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${mod.completed ? "text-muted-foreground line-through" : "font-medium"}`}>
                        {mod.title}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{mod.duration}</span>
                  </div>
                ))}
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Accès Pro</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accès complet à tous les modules, quiz interactifs, exercices pratiques et certificat de complétion.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
