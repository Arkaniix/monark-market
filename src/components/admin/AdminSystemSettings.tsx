import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database, HardDrive, Trash2, Settings, RefreshCw, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AdminSystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres Système</h2>
        <p className="text-muted-foreground">Configuration globale et maintenance</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Attention : Les opérations de maintenance peuvent affecter la disponibilité du service
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scraping communautaire</Label>
              <p className="text-sm text-muted-foreground">Autoriser les utilisateurs à participer aux scraps</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">Désactiver l'accès au site pour maintenance</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nouvelles inscriptions</Label>
              <p className="text-sm text-muted-foreground">Autoriser la création de nouveaux comptes</p>
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
            <Label>Conservation des logs (jours)</Label>
            <Input type="number" defaultValue={90} />
          </div>
          <div className="space-y-2">
            <Label>Conservation des données utilisateur (jours après suppression)</Label>
            <Input type="number" defaultValue={30} />
          </div>
          <div className="space-y-2">
            <Label>Conservation des scraps (jours)</Label>
            <Input type="number" defaultValue={180} />
          </div>
          <Button variant="outline">Sauvegarder les paramètres</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Base de Données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Nettoyer les données expirées</p>
                  <p className="text-sm text-muted-foreground">Supprimer les logs et données au-delà de la période de rétention</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Nettoyer
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Réindexer la base de données</p>
                  <p className="text-sm text-muted-foreground">Optimiser les performances des requêtes</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réindexer
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Vider le cache global</p>
                  <p className="text-sm text-muted-foreground">Réinitialiser tous les caches applicatifs</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Vider
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches planifiées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge>Actif</Badge>
                <div>
                  <p className="font-medium">Nettoyage quotidien</p>
                  <p className="text-sm text-muted-foreground">Tous les jours à 03:00</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Exécuter maintenant</Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge>Actif</Badge>
                <div>
                  <p className="font-medium">Mise à jour des métriques</p>
                  <p className="text-sm text-muted-foreground">Toutes les heures</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Exécuter maintenant</Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Inactif</Badge>
                <div>
                  <p className="font-medium">Backup base de données</p>
                  <p className="text-sm text-muted-foreground">Tous les dimanches à 02:00</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Activer</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
