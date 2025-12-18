import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminCredits from "@/components/admin/AdminCredits";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminAds from "@/components/admin/AdminAds";
import AdminIngest from "@/components/admin/AdminIngest";
import AdminModels from "@/components/admin/AdminModels";
import AdminMetrics from "@/components/admin/AdminMetrics";
import AdminExternal from "@/components/admin/AdminExternal";
import AdminHealth from "@/components/admin/AdminHealth";
import AdminLogs from "@/components/admin/AdminLogs";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";

export default function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: roleData, isLoading, isError, error } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isError) {
      if (roleData?.role !== 'admin') {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive"
        });
        navigate("/home");
      }
    }
    
    if (isError) {
      // If error fetching role, redirect to home
      console.error("Error checking admin status:", error);
      navigate("/home");
    }
  }, [roleData, isLoading, isError, navigate, toast, error]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <AdminUsers />;
      case "subscriptions":
        return <AdminSubscriptions />;
      case "credits":
        return <AdminCredits />;
      case "jobs":
        return <AdminJobs />;
      case "ads":
        return <AdminAds />;
      case "ingest":
        return <AdminIngest />;
      case "models":
        return <AdminModels />;
      case "metrics":
        return <AdminMetrics />;
      case "external":
        return <AdminExternal />;
      case "health":
        return <AdminHealth />;
      case "logs":
        return <AdminLogs />;
      case "settings":
        return <AdminSystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (roleData?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 ml-64">
          <div className="border-b bg-card">
            <div className="container mx-auto py-6 px-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Administration</h1>
                  <p className="text-muted-foreground">Panneau de contrôle administrateur</p>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto py-8 px-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
