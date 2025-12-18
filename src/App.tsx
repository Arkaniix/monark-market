import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { ScrapJobProvider } from "@/context/ScrapJobContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { routes } from "./routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <ScrapJobProvider>
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
          </ScrapJobProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
