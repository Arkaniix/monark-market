import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Archive, RefreshCw, HardDrive, Calendar, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminMaintenance() {
  const maintenanceTasks = [
    {
      name: "Purge ingest_raw > 60j",
      description: "Supprime les données brutes d'ingestion de plus de 60 jours",
      category: "database",
      lastRun: "2024-01-10 03:00",
      status: "completed",
      nextRun: "2024-02-10 03:00"
    },
    {
      name: "Purge system_logs > 90j",
      description: "Supprime les logs système de plus de 90 jours",
      category: "database",
      lastRun: "2024-01-12 03:00",
      status: "completed",
      nextRun: "2024-02-12 03:00"
    },
    {
      name: "Recalcul deal scores",
      description: "Recalcule tous les scores d'opportunité des annonces actives",
      category: "compute",
      lastRun: "2024-01-15 02:30",
      status: "completed",
      nextRun: "2024-01-16 02:30"
    },
    {
      name: "Refresh metrics journalières",
      description: "Recalcule les métriques par modèle pour la journée écoulée",
      category: "compute",
      lastRun: "2024-01-15 01:00",
      status: "completed",
      nextRun: "2024-01-16 01:00"
    },
    {
      name: "Vacuum tables lourdes",
      description: "Optimise ads, ad_prices, ingest_raw",
      category: "database",
      lastRun: "2024-01-07 04:00",
      status: "completed",
      nextRun: "2024-01-21 04:00"
    },
    {
      name: "Backup complet base",
      description: "Sauvegarde complète de la base de données",
      category: "backup",
      lastRun: "2024-01-15 05:00",
      status: "completed",
      nextRun: "2024-01-16 05:00"
    },
  ];

  const partitions = [
    { table: "ad_prices", month: "2024-02", status: "created", size: "0 MB" },
    { table: "ad_prices", month: "2024-01", status: "active", size: "1.2 GB" },
    { table: "ad_prices", month: "2023-12", status: "archived", size: "987 MB" },
    { table: "ingest_raw", month: "2024-02", status: "created", size: "0 MB" },
    { table: "ingest_raw", month: "2024-01", status: "active", size: "3.4 GB" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'created': return 'outline';
      case 'active': return 'default';
      case 'archived': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return Database;
      case 'compute': return RefreshCw;
      case 'backup': return Archive;
      default: return HardDrive;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outils de maintenance</h2>
        <p className="text-muted-foreground">Actions sécurisées de maintenance système</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Zone sécurisée</AlertTitle>
        <AlertDescription>
          Ces actions peuvent impacter les performances du système. Toute opération est journalisée et requiert une confirmation.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Tâches planifiées</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">5.6 GB</div>
                <p className="text-xs text-muted-foreground">Données à purger</p>
              </div>
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">99.2%</div>
                <p className="text-xs text-muted-foreground">Taux de succès</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tâches de maintenance planifiées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maintenanceTasks.map((task, idx) => {
            const Icon = getCategoryIcon(task.category);
            return (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Dernière exécution: {task.lastRun}</span>
                      <span>Prochaine: {task.nextRun}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                  <Button variant="outline" size="sm">Exécuter</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des partitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {partitions.map((partition, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{partition.table} - {partition.month}</h4>
                <p className="text-sm text-muted-foreground">Taille: {partition.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(partition.status)}>{partition.status}</Badge>
                {partition.status === 'archived' && (
                  <Button variant="outline" size="sm">Supprimer</Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Créer partitions mois prochain
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions manuelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Reindex tables complètes</h4>
              <p className="text-sm text-muted-foreground">Reconstruit tous les index (hors heures de pointe)</p>
            </div>
            <Button variant="outline">Planifier</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Test de restauration</h4>
              <p className="text-sm text-muted-foreground">Vérifie l'intégrité du dernier backup</p>
            </div>
            <Button variant="outline">Lancer test</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Réinitialiser cache global</h4>
              <p className="text-sm text-muted-foreground">Vide tous les caches applicatifs</p>
            </div>
            <Button variant="destructive">Réinitialiser</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
