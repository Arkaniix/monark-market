import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const WELCOME_MODAL_KEY = "monark_welcome_modal_seen";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(WELCOME_MODAL_KEY);
    if (!hasSeenModal) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_MODAL_KEY, "true");
    setOpen(false);
  };

  const handleGoToTraining = () => {
    localStorage.setItem(WELCOME_MODAL_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <Rocket className="h-8 w-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl">
            Bienvenue sur Monark ! 🎉
          </DialogTitle>
          <DialogDescription className="text-base pt-2 space-y-2">
            <span className="block">
              Monark est un outil puissant avec de nombreuses fonctionnalités.
            </span>
            <span className="block">
              Si tu débutes, notre{" "}
              <span className="font-semibold text-foreground">module d'introduction</span>{" "}
              t'explique tout ce que tu dois savoir pour bien démarrer.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
              🚀
            </div>
            <div>
              <h4 className="font-semibold">Module 0 : Premiers pas sur Monark</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Découvre l'interface, les fonctionnalités clés et comment tirer le meilleur parti de la plateforme.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ⏱️ ~5 min • Parfait pour commencer
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button asChild className="w-full gap-2" onClick={handleGoToTraining}>
            <Link to="/training">
              <GraduationCap className="h-4 w-4" />
              Commencer la formation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            Plus tard, je connais déjà
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
