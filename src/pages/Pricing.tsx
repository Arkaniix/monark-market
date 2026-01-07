import { PricingTable, PLANS } from "@/components/pricing/PricingTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Check, RefreshCw, Shield, Zap, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const FAQ_ITEMS = [{
  question: "Les crédits sont-ils cumulables ?",
  answer: "Non, les crédits sont remis à zéro à chaque nouveau cycle mensuel. Les crédits non utilisés et ceux gagnés via la collecte communautaire ne sont pas reportés au mois suivant."
}, {
  question: "Puis-je acheter des crédits supplémentaires ?",
  answer: "Oui, vous pouvez acheter des recharges ponctuelles si vous avez un abonnement actif (Pro ou Elite). Ces crédits expirent également à la fin de votre cycle mensuel."
}, {
  question: "Comment fonctionne la collecte communautaire ?",
  answer: "En participant aux missions de collecte communautaire, vous gagnez des crédits (jusqu'à 20 par mission). Ces crédits sont ajoutés à votre solde mais expirent aussi au reset mensuel."
}, {
  question: "Puis-je changer de plan à tout moment ?",
  answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et votre facturation est ajustée au prorata."
}, {
  question: "Que se passe-t-il si j'atteins ma limite d'alertes ?",
  answer: "Vous pouvez désactiver des alertes existantes pour en créer de nouvelles, ou upgrader vers un plan supérieur pour augmenter votre limite."
}];
const GUARANTEES = [{
  icon: Shield,
  title: "Satisfait ou remboursé",
  description: "14 jours pour tester, remboursement sans condition"
}, {
  icon: Zap,
  title: "Activation instantanée",
  description: "Accès immédiat après paiement"
}, {
  icon: RefreshCw,
  title: "Sans engagement",
  description: "Annulez à tout moment sans frais"
}];
export default function Pricing() {
  const {
    plan: currentPlan
  } = useEntitlements();
  return <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            Tarifs transparents
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Choisissez le plan adapté à vos besoins
          </h1>
          <p className="text-lg text-muted-foreground">
            Des plans flexibles pour tous les profils, du débutant au professionnel.
            Tous les plans incluent la formation complète.
          </p>
        </div>

        {/* Pricing Table */}
        <PricingTable currentPlan={currentPlan} showCTA={true} variant="both" />

        {/* Guarantees */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {GUARANTEES.map((guarantee, idx) => <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <guarantee.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{guarantee.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {guarantee.description}
                </p>
              </CardContent>
            </Card>)}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-2xl font-bold">Questions fréquentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, idx) => <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>

        {/* Final CTA */}
        
    </div>;
}