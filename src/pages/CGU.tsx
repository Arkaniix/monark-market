import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CGU() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Objet</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation
              de la plateforme HardwareMarket (ci-après "la Plateforme"), accessible à l'adresse
              [votre-domaine.com].
            </p>
            <p>
              La Plateforme propose un service de suivi des prix du matériel informatique d'occasion,
              d'analyse de tendances et d'alertes personnalisées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Acceptation des CGU</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'accès et l'utilisation de la Plateforme impliquent l'acceptation pleine et entière
              des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser
              la Plateforme.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Inscription et compte utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Pour accéder à certaines fonctionnalités de la Plateforme, vous devez créer un compte
              utilisateur. Vous vous engagez à fournir des informations exactes et à maintenir
              ces informations à jour.
            </p>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants de connexion et de
              toutes les activités qui se produisent sur votre compte.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Services proposés</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>La Plateforme propose les services suivants :</p>
            <ul>
              <li>Suivi des prix du matériel informatique d'occasion</li>
              <li>Analyse de tendances de marché</li>
              <li>Alertes personnalisées sur les variations de prix</li>
              <li>Estimation de la valeur du matériel</li>
              <li>Accès à une communauté d'utilisateurs</li>
              <li>Formations et ressources sur le marché de l'occasion</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Abonnements et paiements</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Certains services de la Plateforme sont accessibles via un abonnement payant.
              Les tarifs sont indiqués en euros TTC et peuvent être modifiés à tout moment,
              avec notification préalable aux utilisateurs.
            </p>
            <p>
              Les paiements sont traités de manière sécurisée. En cas de non-paiement,
              l'accès aux services premium sera suspendu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Tous les éléments de la Plateforme (textes, images, logos, bases de données, etc.)
              sont protégés par les droits de propriété intellectuelle et appartiennent à
              HardwareMarket ou à ses partenaires.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation non autorisée
              est strictement interdite.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              HardwareMarket s'efforce de fournir des informations exactes et à jour, mais ne
              peut garantir l'exactitude, l'exhaustivité ou la pertinence des données affichées.
            </p>
            <p>
              La Plateforme ne saurait être tenue responsable des décisions d'achat ou de vente
              prises par les utilisateurs sur la base des informations fournies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Résiliation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte.
            </p>
            <p>
              HardwareMarket se réserve le droit de suspendre ou résilier un compte en cas de
              violation des présentes CGU.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Modification des CGU</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              HardwareMarket se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés de toute modification significative.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Loi applicable et juridiction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige relatif à
              l'interprétation ou l'exécution des présentes sera soumis aux tribunaux compétents.
            </p>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </div>
      </div>
    </div>
  );
}
