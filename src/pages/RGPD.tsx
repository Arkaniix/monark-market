import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RGPD() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité (RGPD)</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Responsable du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le responsable du traitement des données personnelles est Monark,
              joignable à l'adresse email : contact@monark.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Données collectées</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de connexion :</strong> adresse IP, logs de connexion</li>
              <li><strong>Données d'utilisation :</strong> historique de navigation, préférences</li>
              <li><strong>Données de paiement :</strong> informations bancaires (via prestataire sécurisé)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Finalités du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Vos données personnelles sont collectées pour les finalités suivantes :</p>
            <ul>
              <li>Gestion de votre compte utilisateur</li>
              <li>Fourniture des services de la plateforme</li>
              <li>Traitement des paiements et facturation</li>
              <li>Envoi de notifications et d'alertes personnalisées</li>
              <li>Amélioration de nos services</li>
              <li>Respect de nos obligations légales</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Base légale du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li><strong>Votre consentement</strong> pour l'envoi de notifications</li>
              <li><strong>L'exécution du contrat</strong> pour la fourniture des services</li>
              <li><strong>Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
              <li><strong>Le respect d'obligations légales</strong> (comptabilité, facturation)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Destinataires des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Vos données peuvent être transmises à :</p>
            <ul>
              <li>Notre équipe technique pour la maintenance de la plateforme</li>
              <li>Nos prestataires de paiement (sécurisés et certifiés)</li>
              <li>Nos hébergeurs de données</li>
              <li>Les autorités compétentes en cas d'obligation légale</li>
            </ul>
            <p>
              Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins
              commerciales.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Durée de conservation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Vos données sont conservées pour les durées suivantes :</p>
            <ul>
              <li><strong>Données de compte :</strong> pendant la durée de votre abonnement + 3 ans</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum</li>
              <li><strong>Données de prospection :</strong> 3 ans après le dernier contact</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Vos droits</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : privacy@monark.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Sécurité des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données contre :
            </p>
            <ul>
              <li>L'accès non autorisé</li>
              <li>La perte ou la destruction accidentelle</li>
              <li>La modification ou la divulgation non autorisée</li>
            </ul>
            <p>
              Les données sont stockées sur des serveurs sécurisés et les communications
              sont chiffrées (HTTPS/SSL).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Notre site utilise des cookies pour améliorer votre expérience de navigation.
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre
              navigateur.
            </p>
            <p>Types de cookies utilisés :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> pour comprendre l'utilisation du site</li>
              <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Transferts de données hors UE</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vos données sont hébergées au sein de l'Union Européenne. Si un transfert
              hors UE devait être nécessaire, nous nous assurerions que des garanties
              appropriées sont mises en place conformément au RGPD.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Réclamation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Si vous estimez que le traitement de vos données personnelles constitue une
              violation de la réglementation, vous pouvez introduire une réclamation auprès
              de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            </p>
            <p>
              CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
              Tél : 01 53 73 22 22<br />
              Site web : www.cnil.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Modification de la politique</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité
              à tout moment. Toute modification sera publiée sur cette page avec une nouvelle
              date de mise à jour.
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
