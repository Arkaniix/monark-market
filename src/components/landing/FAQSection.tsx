import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce que Monark Lens exactement ?",
    answer: "Monark Lens est une extension Chrome qui enrichit les annonces sur Leboncoin, eBay et Vinted avec un Market Score (0-10), un verdict textuel et la valeur marché estimée. Elle fonctionne en overlay : vous naviguez normalement, et les données apparaissent directement sur les annonces.",
  },
  {
    question: "D'où viennent les données utilisées ?",
    answer: "Les données proviennent des annonces publiques analysées par notre communauté d'utilisateurs via l'extension Lens. Nous agrégeons ces informations pour calculer des indicateurs statistiques : médiane, tendance, volume, liquidité. Plus la communauté est active, plus les données sont précises et à jour.",
  },
  {
    question: "Le Market Score est-il fiable à 100% ?",
    answer: "Non, et nous ne prétendons pas le contraire. Le Market Score est une aide à la décision basée sur des données réelles, mais le marché de l'occasion est par nature variable. Les prix dépendent de l'état exact du produit, de la localisation, de la négociation. Utilisez nos indicateurs comme un point de départ, pas comme une vérité absolue.",
  },
  {
    question: "L'extension collecte-t-elle mes données personnelles ?",
    answer: "Non. Monark Lens ne collecte aucune donnée personnelle, mot de passe ou information de paiement. L'extension lit uniquement les informations publiques des annonces (prix, titre, état) pour calculer le Market Score. Aucune donnée de navigation hors des plateformes supportées n'est traitée. Nous respectons le RGPD.",
  },
  {
    question: "Quelle est la différence entre analyse rapide et approfondie ?",
    answer: "L'analyse rapide (5 crédits) affiche dans l'overlay Lens le prix médian, l'écart au marché, la tendance et le volume. L'analyse approfondie (20 crédits) redirige vers l'Estimator sur monark-market.fr avec toutes les données pré-remplies : scénarios de revente, négociation, graphiques interactifs.",
  },
  {
    question: "Comment fonctionnent les crédits et les missions ?",
    answer: "Chaque plan inclut un quota mensuel de crédits. En plus, vous gagnez des crédits automatiquement en naviguant avec l'extension (1 à 3 crédits par annonce enrichie selon votre plan). Des missions semi-actives proposent aussi des récompenses bonus (ex: naviguer 20 annonces GPU cette semaine).",
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    answer: "Non. Tous nos abonnements sont mensuels et sans engagement. Vous pouvez annuler à tout moment depuis votre espace compte, et vous conservez l'accès jusqu'à la fin de la période payée. Le plan Free est gratuit sans limite de durée.",
  },
  {
    question: "Sur quels navigateurs fonctionne Monark Lens ?",
    answer: "Monark Lens est disponible sur Google Chrome et les navigateurs basés sur Chromium (Edge, Brave, Opera). Une version Firefox est envisagée selon la demande. L'extension fonctionne sur desktop uniquement.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Questions fréquentes
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Vous hésitez encore ?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Réponses honnêtes aux questions que vous vous posez.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
