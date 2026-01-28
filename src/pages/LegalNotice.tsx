import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalNotice() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>Nom de la société :</strong> Monark<br />
              <strong>Forme juridique :</strong> [À compléter - SAS, SARL, etc.]<br />
              <strong>Capital social :</strong> [À compléter]<br />
              <strong>Siège social :</strong> [À compléter - Adresse complète]<br />
              <strong>RCS :</strong> [À compléter - Ville + numéro]<br />
              <strong>SIRET :</strong> [À compléter]<br />
              <strong>Numéro de TVA intracommunautaire :</strong> [À compléter]
            </p>
            <p>
              <strong>Directeur de la publication :</strong> [À compléter - Nom et prénom]<br />
              <strong>Email :</strong> contact@monark.fr<br />
              <strong>Téléphone :</strong> [À compléter]
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Hébergement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le site Monark est hébergé par :
            </p>
            <p>
              <strong>Hébergeur :</strong> Lovable (via Supabase)<br />
              <strong>Serveurs :</strong> Hébergement cloud sécurisé dans l'Union Européenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'ensemble du contenu du site Monark (structure, textes, logos, images,
              vidéos, bases de données, etc.) est protégé par le droit d'auteur et le droit
              des bases de données.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de
              tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
              est interdite, sauf autorisation écrite préalable de Monark.
            </p>
            <p>
              Toute exploitation non autorisée du site ou de l'un des éléments qu'il contient
              sera considérée comme constitutive d'une contrefaçon et poursuivie conformément
              aux dispositions des articles L.335-2 et suivants du Code de la Propriété
              Intellectuelle.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Limitation de responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Monark s'efforce de fournir sur le site des informations aussi précises
              que possible. Toutefois, il ne pourra être tenu responsable des omissions, des
              inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait
              ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p>
              Toutes les informations indiquées sur le site sont données à titre indicatif,
              et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur
              le site ne sont pas exhaustifs.
            </p>
            <p>
              Monark ne pourra être tenu responsable des dommages directs et indirects
              causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit
              de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées,
              soit de l'apparition d'un bug ou d'une incompatibilité.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les informations recueillies sur le site font l'objet d'un traitement informatique
              destiné à la gestion de votre compte et à l'amélioration de nos services.
            </p>
            <p>
              Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée et
              au Règlement Général sur la Protection des Données (RGPD), vous bénéficiez d'un
              droit d'accès, de rectification, de portabilité et d'effacement de vos données
              ou encore de limitation du traitement.
            </p>
            <p>
              Pour exercer ces droits ou pour toute question sur le traitement de vos données,
              vous pouvez nous contacter à l'adresse : privacy@monark.fr
            </p>
            <p>
              Pour plus d'informations, consultez notre <a href="/rgpd" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le site utilise des cookies pour améliorer l'expérience utilisateur et analyser
              le trafic. En poursuivant votre navigation sur ce site, vous acceptez l'utilisation
              de cookies.
            </p>
            <p>
              Vous pouvez désactiver les cookies dans les paramètres de votre navigateur,
              mais certaines fonctionnalités du site pourraient ne plus être accessibles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Liens hypertextes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le site peut contenir des liens hypertextes vers d'autres sites internet.
              Monark n'a pas de contrôle sur ces sites et décline toute responsabilité
              quant à leur contenu.
            </p>
            <p>
              La mise en place de liens hypertextes vers le site Monark nécessite
              une autorisation préalable écrite.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Droit applicable et juridiction compétente</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes mentions légales sont régies par le droit français.
            </p>
            <p>
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant
              les tribunaux français conformément aux règles de compétence en vigueur.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Crédits</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>Conception et développement :</strong> Monark<br />
              <strong>Hébergement :</strong> Lovable (Supabase)<br />
              <strong>Icônes :</strong> Lucide Icons<br />
              <strong>Framework :</strong> React, TypeScript, Tailwind CSS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Pour toute question ou demande d'information concernant le site, vous pouvez
              nous contacter :
            </p>
            <p>
              <strong>Par email :</strong> contact@monark.fr<br />
              <strong>Par courrier :</strong> [À compléter - Adresse postale complète]
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
