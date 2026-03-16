import { LayoutDashboard, Users, CreditCard, Coins, Briefcase, Package, Database, Cpu, TrendingUp, Plug, Activity, FileText, Settings, AlertTriangle, BarChart3, Telescope, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  rejectsBadge?: number;
}

interface MenuGroup {
  label: string;
  items: { id: string; label: string; icon: any; badge?: number }[];
}

export default function AdminSidebar({ activeSection, onSectionChange, rejectsBadge = 0 }: AdminSidebarProps) {
  const groups: MenuGroup[] = [
    {
      label: "VUE D'ENSEMBLE",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "UTILISATEURS & BUSINESS",
      items: [
        { id: "users", label: "Utilisateurs", icon: Users },
        { id: "subscriptions", label: "Abonnements", icon: CreditCard },
        { id: "credits", label: "Crédits & Politiques", icon: Coins },
        { id: "compta", label: "Comptabilité", icon: Receipt },
      ],
    },
    {
      label: "PIPELINE DE DONNÉES",
      items: [
        { id: "ads", label: "Annonces", icon: Package },
        { id: "ingest", label: "Ingestion & Qualité", icon: Database },
        { id: "rejects", label: "Rejets d'ingestion", icon: AlertTriangle, badge: rejectsBadge },
        { id: "models", label: "Modèles & Catalogue", icon: Cpu },
      ],
    },
    {
      label: "INTELLIGENCE MARCHÉ",
      items: [
        { id: "observatory", label: "Observatoire", icon: Telescope },
        { id: "metrics", label: "Analyses de marché", icon: TrendingUp },
        { id: "regimes", label: "Régimes de marché", icon: BarChart3 },
      ],
    },
    {
      label: "SYSTÈME",
      items: [
        { id: "health", label: "Santé système", icon: Activity },
        { id: "pipeline", label: "Pipeline & CRON", icon: Briefcase },
        { id: "external", label: "Intégrations externes", icon: Plug },
        { id: "logs", label: "Logs & Audit", icon: FileText },
        { id: "settings", label: "Paramètres", icon: Settings },
      ],
    },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 px-2">Admin</h2>
        <nav className="space-y-1">
          {groups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <Separator className="my-3" />}
              <p className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-5 text-[10px] px-1.5">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
