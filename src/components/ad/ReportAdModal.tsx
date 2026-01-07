import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type ProblemType = 
  | "incorrect_price"
  | "wrong_category"
  | "wrong_components"
  | "duplicate"
  | "expired"
  | "other";

const PROBLEM_TYPES: { value: ProblemType; label: string }[] = [
  { value: "incorrect_price", label: "Prix incorrect" },
  { value: "wrong_category", label: "Mauvaise catégorie" },
  { value: "wrong_components", label: "Composant manquant/en trop" },
  { value: "duplicate", label: "Annonce en doublon" },
  { value: "expired", label: "Annonce expirée" },
  { value: "other", label: "Autre problème" },
];

interface ReportAdModalProps {
  adId: string;
  adTitle: string;
}

export function ReportAdModal({ adId, adTitle }: ReportAdModalProps) {
  const [open, setOpen] = useState(false);
  const [problemType, setProblemType] = useState<ProblemType | "">("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!problemType) {
      toast({
        title: "Sélectionnez un type de problème",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Mock submission - in production, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("Report submitted:", {
      adId,
      problemType,
      comment,
      timestamp: new Date().toISOString(),
    });

    toast({
      title: "Signalement envoyé",
      description: "Merci pour votre contribution à l'amélioration de la base de données.",
    });

    // Reset and close
    setProblemType("");
    setComment("");
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setProblemType("");
      setComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
          <Flag className="h-4 w-4" />
          Signaler un problème
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
          <DialogDescription>
            Aidez-nous à améliorer la qualité des données en signalant les erreurs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type de problème</Label>
            <Select value={problemType} onValueChange={(v: ProblemType) => setProblemType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de problème" />
              </SelectTrigger>
              <SelectContent>
                {PROBLEM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-comment">Commentaire (optionnel)</Label>
            <Textarea
              id="report-comment"
              placeholder="Décrivez le problème en détail..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !problemType}>
            {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
