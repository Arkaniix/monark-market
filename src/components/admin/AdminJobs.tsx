import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, Eye, Briefcase, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useAdminJobs, useAdminJobDetail, AdminJob } from "@/hooks/useAdmin";
import { format, differenceInSeconds } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminJobs() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const limit = 20;

  const { data, isLoading, isError } = useAdminJobs(page, limit, {
    status: showErrorsOnly ? 'failed' : statusFilter,
    type: typeFilter,
    search: searchTerm || undefined,
  });

  const { data: jobDetail, isLoading: loadingDetail } = useAdminJobDetail(selectedJobId);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const allJobs = data?.items ?? [];
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const failedJobs = allJobs.filter(j => j.status === 'failed');
    
    const successRate = allJobs.length > 0 
      ? ((completedJobs.length / allJobs.length) * 100).toFixed(1)
      : '0';
    
    const avgPages = completedJobs.length > 0
      ? Math.round(completedJobs.reduce((sum, j) => sum + (j.pages_scanned || 0), 0) / completedJobs.length)
      : 0;

    return {
      successRate,
      avgPages,
      failedCount: failedJobs.length
    };
  }, [data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'communautaire': return 'default';
      case 'faible': return 'secondary';
      case 'fort': return 'destructive';
      default: return 'outline';
    }
  };

  // Calculate job duration and error rate for detail view
  const getJobDuration = (job: AdminJob) => {
    if (!job.started_at || !job.ended_at) return null;
    const seconds = differenceInSeconds(new Date(job.ended_at), new Date(job.started_at));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Erreur lors du chargement des jobs</p>
        </CardContent>
      </Card>
    );
  }

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scraps & Jobs</h2>
        <p className="text-muted-foreground">Gestion des jobs de scraping (lecture seule)</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Taux de réussite</span>
            </div>
            <div className="text-2xl font-bold mt-1">{kpis.successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Moyenne pages/job</span>
            </div>
            <div className="text-2xl font-bold mt-1">{kpis.avgPages}</div>
          </CardContent>
        </Card>
        <Card className={kpis.failedCount > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Jobs échoués</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-destructive">{kpis.failedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Jobs ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par mot-clé ou utilisateur..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => { 
                setStatusFilter(v); 
                setShowErrorsOnly(false);
                setPage(1); 
              }}
              disabled={showErrorsOnly}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="communautaire">Communautaire</SelectItem>
                <SelectItem value="faible">Faible</SelectItem>
                <SelectItem value="fort">Fort</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={showErrorsOnly ? "destructive" : "outline"}
              onClick={() => {
                setShowErrorsOnly(!showErrorsOnly);
                setStatusFilter("all");
                setPage(1);
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {showErrorsOnly ? "Toutes" : "Erreurs seulement"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Mot-clé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucun job trouvé
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs">#{job.id}</TableCell>
                    <TableCell>{job.user_name || 'Utilisateur'}</TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{job.keyword}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(job.type)}>{job.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell>{job.pages_scanned}/{job.pages_target || '-'}</TableCell>
                    <TableCell>{job.ads_found}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(job.created_at), "dd/MM HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} ({total} jobs)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJobId} onOpenChange={(open) => !open && setSelectedJobId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail du Job #{selectedJobId}</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : jobDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">{jobDetail.user_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plateforme</p>
                  <p className="font-medium">{jobDetail.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mot-clé</p>
                  <p className="font-medium">{jobDetail.keyword}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={getTypeColor(jobDetail.type)}>{jobDetail.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={getStatusColor(jobDetail.status)}>{jobDetail.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pages scannées</p>
                  <p className="font-medium">{jobDetail.pages_scanned} / {jobDetail.pages_target || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annonces trouvées</p>
                  <p className="font-medium">{jobDetail.ads_found}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps total</p>
                  <p className="font-medium">{getJobDuration(jobDetail) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium text-sm">
                    {format(new Date(jobDetail.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
                {jobDetail.started_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Démarré le</p>
                    <p className="font-medium text-sm">
                      {format(new Date(jobDetail.started_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Error rate indicator */}
              {jobDetail.status === 'completed' && jobDetail.pages_target && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Taux d'erreur pages</p>
                  <p className="font-medium">
                    {jobDetail.pages_target > 0 
                      ? (((jobDetail.pages_target - (jobDetail.pages_scanned || 0)) / jobDetail.pages_target) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              )}
              
              {jobDetail.error_message && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">Erreur:</p>
                  <p className="text-sm text-destructive">{jobDetail.error_message}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
