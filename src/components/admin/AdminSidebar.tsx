import { LayoutDashboard, Users, Receipt, Cpu, Telescope, BarChart3, Briefcase, Activity, FileText, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuGroup {
  label: string;
  items: { id: string; label: string; icon: any }[];
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const groups: MenuGroup[] = [
    {
      label: "VUE D'ENSEMBLE",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "BUSINESS",
      items: [
        { id: "users", label: "Utilisateurs", icon: Users },
        { id: "compta", label: "Comptabilité", icon: Receipt },
      ],
    },
    {
      label: "CATALOGUE & DONNÉES",
      items: [
        { id: "models", label: "Catalogue", icon: Cpu },
        { id: "observatory", label: "Observatoire", icon: Telescope },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      label: "PIPELINE",
      items: [
        { id: "pipeline", label: "Pipeline & CRON", icon: Briefcase },
        { id: "scrapers", label: "Scrapers", icon: Terminal },
      ],
    },
    {
      label: "SYSTÈME",
      items: [
        { id: "health", label: "Santé système", icon: Activity },
        { id: "logs", label: "Logs & Audit", icon: FileText },
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
