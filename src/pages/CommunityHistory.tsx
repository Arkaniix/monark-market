import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Timer, Activity, Filter, Search, Calendar, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyTasks } from "@/hooks/useCommunity";
import { MyTasksSkeleton } from "@/components/community/CommunitySkeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

export default function CommunityHistory() {
  const navigate = useNavigate();
  const { data: myTasksData, isLoading } = useMyTasks();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const taskStatusIcon: Record<string, typeof CheckCircle2> = {
    completed: CheckCircle2,
    done: CheckCircle2,
    expired: Timer,
    failed: XCircle,
    pending: Clock,
    running: Activity,
    in_progress: Activity,
  };

  const taskStatusColor: Record<string, string> = {
    completed: "text-green-600",
    done: "text-green-600",
    expired: "text-orange-600",
    failed: "text-red-600",
    pending: "text-muted-foreground",
    running: "text-blue-600",
    in_progress: "text-blue-600",
  };

  const taskStatusLabel: Record<string, string> = {
    completed: "Terminée",
    done: "Terminée",
    expired: "Expirée",
    failed: "Échouée",
    pending: "En attente",
    running: "En cours",
    in_progress: "En cours",
  };

  // Filter and paginate tasks
  const filteredTasks = useMemo(() => {
    if (!myTasksData?.tasks) return [];
    
    return myTasksData.tasks.filter(task => {
      const matchesSearch = search === "" || 
        task.model_name.toLowerCase().includes(search.toLowerCase()) ||
        task.model.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        task.status === statusFilter ||
        (statusFilter === "completed" && task.status === "done");
      
      const matchesType = typeFilter === "all" || task.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [myTasksData?.tasks, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Stats
  const stats = useMemo(() => {
    if (!myTasksData?.tasks) return { total: 0, completed: 0, credits: 0, pages: 0 };
    
    const completed = myTasksData.tasks.filter(t => t.status === "completed" || t.status === "done");
    return {
      total: myTasksData.tasks.length,
      completed: completed.length,
      credits: completed.reduce((acc, t) => acc + t.credits_earned, 0),
      pages: completed.reduce((acc, t) => acc + t.pages_scanned, 0),
    };
  }, [myTasksData?.tasks]);

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/community")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la Communauté
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Mon historique</h1>
              <p className="text-muted-foreground">
                Toutes tes contributions communautaires
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total missions</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crédits gagnés</p>
                <p className="text-xl font-bold text-green-600">+{stats.credits}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages scannées</p>
                <p className="text-xl font-bold">{stats.pages}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par modèle..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="running">En cours</SelectItem>
                  <SelectItem value="expired">Expirée</SelectItem>
                  <SelectItem value="failed">Échouée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="list_only">List only</SelectItem>
                  <SelectItem value="open_on_new">Open on new</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Missions ({filteredTasks.length})</CardTitle>
            <CardDescription>
              {filteredTasks.length === 0 
                ? "Aucune mission ne correspond à tes filtres"
                : `Affichage de ${(page - 1) * ITEMS_PER_PAGE + 1} à ${Math.min(page * ITEMS_PER_PAGE, filteredTasks.length)} sur ${filteredTasks.length}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <MyTasksSkeleton />
            ) : paginatedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune mission trouvée.
              </p>
            ) : (
              <div className="space-y-3">
                {paginatedTasks.map((task) => {
                  const StatusIcon = taskStatusIcon[task.status];
                  return (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/jobs/${task.job_id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${taskStatusColor[task.status]}`} />
                          <div>
                            <p className="font-semibold">{task.model_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.type}</Badge>
                          <Badge 
                            variant={task.status === "completed" || task.status === "done" ? "default" : "secondary"}
                            className={task.status === "completed" || task.status === "done" ? "bg-green-600" : ""}
                          >
                            {taskStatusLabel[task.status]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pages scannées</p>
                          <p className="font-medium">{task.pages_scanned}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Annonces trouvées</p>
                          <p className="font-medium">{task.ads_found}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée</p>
                          <p className="font-medium">
                            {task.duration_seconds > 0 
                              ? `${Math.floor(task.duration_seconds / 60)}min ${task.duration_seconds % 60}s`
                              : "-"
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Crédits gagnés</p>
                          <p className="font-medium text-green-600">+{task.credits_earned}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
