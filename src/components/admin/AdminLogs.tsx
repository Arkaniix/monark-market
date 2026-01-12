import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, FileText, Eye } from "lucide-react";
import { useAdminLogs, SystemLog } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const limit = 50;

  const { data, isLoading, isError } = useAdminLogs(page, limit, {
    level: levelFilter,
    search: searchTerm || undefined,
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'default';
      case 'warn': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  // Filter by service (simulated via message content)
  const filteredLogs = (data?.items ?? []).filter(log => {
    if (serviceFilter === 'all') return true;
    const message = log.message.toLowerCase();
    return message.includes(serviceFilter);
  });

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
          <p className="text-destructive">Erreur lors du chargement des logs</p>
        </CardContent>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Logs & Audit</h2>
        <p className="text-muted-foreground">Historique système (lecture seule)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs système ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous services</SelectItem>
                <SelectItem value="scraper">Scraper</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="ingest">Ingest</SelectItem>
                <SelectItem value="estimator">Estimator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Niveau</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="w-[80px]">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun log trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant={getLevelColor(log.level)}>{log.level}</Badge></TableCell>
                    <TableCell className="max-w-lg truncate font-mono text-sm">{log.message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {log.context && (
                        <Button size="icon" variant="ghost" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Page {page} sur {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />Précédent
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Suivant<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Détail du Log</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getLevelColor(selectedLog.level)}>{selectedLog.level}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedLog.created_at), "dd MMM yyyy HH:mm:ss", { locale: fr })}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <p className="font-mono text-sm bg-muted p-3 rounded-lg break-all">{selectedLog.message}</p>
              </div>
              {selectedLog.context && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Context</p>
                  <pre className="font-mono text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
