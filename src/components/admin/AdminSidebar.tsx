import { LayoutDashboard, Users, CreditCard, Coins, Briefcase, Package, Database, Cpu, TrendingUp, Plug, Activity, FileText, Settings, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "subscriptions", label: "Abonnements", icon: CreditCard },
  { id: "credits", label: "Crédits & Politiques", icon: Coins },
  { id: "jobs", label: "Scraps & Jobs", icon: Briefcase },
  { id: "ads", label: "Annonces", icon: Package },
  { id: "ingest", label: "Qualité des données", icon: Database },
  { id: "models", label: "Modèles", icon: Cpu },
  { id: "metrics", label: "Analyses de marché", icon: TrendingUp },
  { id: "external", label: "Intégrations externes", icon: Plug },
  { id: "health", label: "Santé système", icon: Activity },
  { id: "logs", label: "Logs & Audit", icon: FileText },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "support", label: "Support", icon: Headphones },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-card overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Menu Admin</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
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
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
