import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ThemeProvider } from "next-themes";
import Maintenance from "./pages/Maintenance";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { routes } from "./routes";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAdminCheckComplete(false);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setAdminCheckComplete(true);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
        setAdminCheckComplete(true);
      }
    });

    // Check maintenance mode
    checkMaintenanceMode();

    // Subscribe to maintenance mode changes
    const maintenanceChannel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          checkMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      maintenanceChannel.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        // Check if user has admin role among their roles
        setIsAdmin(data.some(row => row.role === 'admin'));
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      setAdminCheckComplete(true);
    }
  };

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setMaintenanceMode(data.maintenance_mode);
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  };

  // Show loading state while checking admin status
  if (loading || (user && !adminCheckComplete)) {
    return null;
  }

  // If maintenance mode is on and user is not admin, show maintenance page
  // Allow access to /auth route even in maintenance mode
  // Only redirect if admin check is complete to avoid race conditions
  const isAuthRoute = window.location.pathname === '/auth';
  if (maintenanceMode && !isAdmin && !isAuthRoute && adminCheckComplete) {
    return <Maintenance />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {routes.map((route) => {
                  const Component = route.component;
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute
                          requiresAuth={route.requiresAuth}
                          requiresAdmin={route.requiresAdmin}
                          user={user}
                          isAdmin={isAdmin}
                          adminCheckComplete={adminCheckComplete}
                        >
                          <Component />
                        </ProtectedRoute>
                      }
                    />
                  );
                })}
              </Routes>
            </Layout>
          </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
