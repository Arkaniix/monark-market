import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres produit</h2>
        <p className="text-muted-foreground">Configuration globale de l'application</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Nom de l'application</Label>
            <Input id="app-name" defaultValue="Monark" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tagline">Slogan</Label>
            <Input id="tagline" defaultValue="Votre marketplace hardware intelligent" />
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans & Abonnements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Plan Basic</p>
              <p className="text-sm text-muted-foreground">50 crédits/mois, 3 jobs/jour</p>
            </div>
            <div className="flex items-center gap-4">
              <Input className="w-24" defaultValue="9.99" />
              <span>€/mois</span>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Plan Pro</p>
              <p className="text-sm text-muted-foreground">150 crédits/mois, 10 jobs/jour</p>
            </div>
            <div className="flex items-center gap-4">
              <Input className="w-24" defaultValue="19.99" />
              <span>€/mois</span>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Plan Elite</p>
              <p className="text-sm text-muted-foreground">400 crédits/mois, 30 jobs/jour</p>
            </div>
            <div className="flex items-center gap-4">
              <Input className="w-24" defaultValue="39.99" />
              <span>€/mois</span>
              <Switch defaultChecked />
            </div>
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les plans
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mode maintenance</p>
              <p className="text-sm text-muted-foreground">Bloquer l'accès au site</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Inscriptions ouvertes</p>
              <p className="text-sm text-muted-foreground">Autoriser les nouveaux comptes</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Scraping communautaire</p>
              <p className="text-sm text-muted-foreground">Activer les jobs communautaires</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications email</p>
              <p className="text-sm text-muted-foreground">Envoyer les alertes par email</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RGPD & Données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rétention des données brutes</Label>
            <Input type="number" defaultValue="60" />
            <p className="text-sm text-muted-foreground">Nombre de jours avant suppression automatique</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Anonymisation des IP</p>
              <p className="text-sm text-muted-foreground">Hasher les adresses IP dans les logs</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
