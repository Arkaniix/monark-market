import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSupport from "@/components/admin/AdminSupport";
import AdminMaintenance from "@/components/admin/AdminMaintenance";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

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
        return <AdminSettings />;
      case "support":
        return <AdminSupport />;
      case "maintenance":
        return <AdminMaintenance />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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