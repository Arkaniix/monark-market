import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJobStatus, useCancelJob } from '@/hooks/useScrapJob';
import { useScrapJobContext } from '@/context/ScrapJobContext';
import ExtensionBridge from '@/components/scrap/ExtensionBridge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Clock,
  FileText,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  StopCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-muted text-muted-foreground', icon: Clock },
  running: { label: 'En cours', color: 'bg-primary text-primary-foreground', icon: Loader2 },
  completed: { label: 'Terminé', color: 'bg-success text-success-foreground', icon: CheckCircle2 },
  failed: { label: 'Échoué', color: 'bg-destructive text-destructive-foreground', icon: XCircle },
  cancelled: { label: 'Annulé', color: 'bg-warning text-warning-foreground', icon: StopCircle },
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id ? parseInt(id, 10) : null;
  
  const { activeJob, setActiveJob } = useScrapJobContext();
  const { data: job, isLoading, error, refetch } = useJobStatus(jobId, { refetchInterval: 2000 });
  const cancelJob = useCancelJob();

  // Sync active job with context
  useEffect(() => {
    if (job && activeJob?.job_id !== job.id) {
      setActiveJob({
        job_id: job.id,
        upload_token: '', // Not available from status endpoint
        platform: job.platform,
        keyword: job.keyword,
        type: job.type,
        params: job.filters_json || {},
      });
    }
  }, [job, activeJob, setActiveJob]);

  const handleCancel = async () => {
    if (jobId) {
      await cancelJob.mutateAsync(jobId);
    }
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les détails du job. {error?.message}
            <Button variant="link" onClick={() => refetch()} className="px-1">
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const status = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const progress = job.pages_target 
    ? Math.min(100, ((job.pages_scanned || 0) / job.pages_target) * 100)
    : 0;
  const isActive = job.status === 'pending' || job.status === 'running';

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
      </div>

      {/* Job Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Job #{job.id}
                </CardTitle>
                <CardDescription className="mt-1">
                  Créé {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: fr })}
                </CardDescription>
              </div>
              <Badge className={status.color}>
                <StatusIcon className={`h-3 w-3 mr-1 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                {status.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Plateforme</p>
                <p className="font-medium capitalize">{job.platform}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type de scan</p>
                <p className="font-medium capitalize">{job.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mot-clé</p>
                <p className="font-medium">{job.keyword}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cible pages</p>
                <p className="font-medium">{job.pages_target || '-'} pages</p>
              </div>
            </div>

            {/* Progress Section */}
            {isActive && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{job.pages_scanned || 0} pages scannées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{job.ads_found || 0} annonces trouvées</span>
                  </div>
                </div>
              </div>
            )}

            {/* Completed Stats */}
            {job.status === 'completed' && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-primary">{job.pages_scanned || 0}</p>
                    <p className="text-xs text-muted-foreground">Pages scannées</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-success">{job.ads_found || 0}</p>
                    <p className="text-xs text-muted-foreground">Annonces trouvées</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold">
                      {job.ended_at && job.started_at 
                        ? Math.round((new Date(job.ended_at).getTime() - new Date(job.started_at).getTime()) / 1000)
                        : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Secondes</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error Message */}
            {job.status === 'failed' && job.error_message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{job.error_message}</AlertDescription>
              </Alert>
            )}

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
              {job.started_at && (
                <span>Démarré : {new Date(job.started_at).toLocaleString('fr-FR')}</span>
              )}
              {job.ended_at && (
                <span>Terminé : {new Date(job.ended_at).toLocaleString('fr-FR')}</span>
              )}
            </div>

            {/* Cancel Button */}
            {isActive && (
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelJob.isPending}
                  className="w-full sm:w-auto"
                >
                  {cancelJob.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <StopCircle className="h-4 w-4 mr-2" />
                  )}
                  Annuler le job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Extension Bridge */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ExtensionBridge job={activeJob} />
        </motion.div>
      )}

      {/* Filters JSON (if any) */}
      {job.filters_json && Object.keys(job.filters_json).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtres appliqués</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto">
                {JSON.stringify(job.filters_json, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-2 w-full mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}
