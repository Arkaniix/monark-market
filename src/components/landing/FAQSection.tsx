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
    question: "D'où viennent les données utilisées ?",
    answer: "Les données proviennent d'annonces publiques sur les principales plateformes d'occasion françaises (LeBonCoin, etc.). Nous agrégeons ces informations pour calculer des indicateurs statistiques : médiane, tendance, volume. La qualité des résultats dépend de la disponibilité et de la fraîcheur des données.",
  },
  {
    question: "Les estimations sont-elles fiables à 100% ?",
    answer: "Non, et nous ne prétendons pas le contraire. L'outil fournit une aide à la décision basée sur des données réelles, mais le marché de l'occasion est par nature variable. Les prix dépendent de l'état exact du produit, de la localisation, de la négociation. Utilisez nos indicateurs comme un point de départ, pas comme une vérité absolue.",
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    answer: "Non. Tous nos abonnements sont mensuels et sans engagement. Vous pouvez annuler à tout moment depuis votre espace compte, et vous conservez l'accès jusqu'à la fin de la période payée.",
  },
  {
    question: "Que se passe-t-il si je n'utilise pas tous mes crédits ?",
    answer: "Les crédits non utilisés ne sont pas reportés au mois suivant. Chaque cycle mensuel remet votre compteur à zéro. C'est pourquoi nous recommandons de choisir un plan adapté à votre usage réel.",
  },
  {
    question: "Comment fonctionne le support ?",
    answer: "Le support est disponible 7j/7 par email et via le formulaire de contact intégré. Les utilisateurs Élite bénéficient d'un traitement prioritaire. Nous nous engageons à répondre sous 24h ouvrées.",
  },
  {
    question: "Mes données personnelles sont-elles protégées ?",
    answer: "Oui. Nous respectons le RGPD et ne revendons aucune donnée. Vos informations de paiement sont traitées par Stripe, leader mondial du paiement en ligne. Vous pouvez demander la suppression de votre compte et de vos données à tout moment.",
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
