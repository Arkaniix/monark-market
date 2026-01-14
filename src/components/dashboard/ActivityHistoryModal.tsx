import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  date: string;
}

interface ActivityHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: ActivityItem[];
}

const ITEMS_PER_PAGE = 10;

export function ActivityHistoryModal({
  open,
  onOpenChange,
  activities,
}: ActivityHistoryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scrap":
      case "scan":
        return <Search className="h-4 w-4 text-primary" />;
      case "credit":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "credit":
        return "bg-success/5 border-success/20";
      case "alert":
        return "bg-warning/5 border-warning/20";
      case "scrap":
      case "scan":
        return "bg-primary/5 border-primary/20";
      default:
        return "bg-muted/50 border-border";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "scrap":
      case "scan":
        return "Scan";
      case "credit":
        return "Crédit";
      case "alert":
        return "Alerte";
      default:
        return "Autre";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique d'activité complet
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {paginatedActivities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucune activité enregistrée
              </div>
            ) : (
              paginatedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${getActivityBgColor(
                    activity.type
                  )}`}
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getActivityLabel(activity.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(activity.date)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} ({activities.length} activités)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
