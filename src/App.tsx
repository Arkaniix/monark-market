import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import InitTestAccounts from "./pages/InitTestAccounts";
import Deals from "./pages/Deals";
import Trends from "./pages/Trends";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import ModelDetail from "./pages/ModelDetail";
import Watchlist from "./pages/Watchlist";
import Estimator from "./pages/Estimator";
import AdDetail from "./pages/AdDetail";
import Community from "./pages/Community";
import Training from "./pages/Training";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public landing page for non-authenticated users */}
            <Route path="/" element={user ? <Home /> : <Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/init-test-accounts" element={<InitTestAccounts />} />
              
              {/* Authenticated routes */}
              <Route path="/deals" element={<Deals />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/model/:id" element={<ModelDetail />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/estimator" element={<Estimator />} />
              <Route path="/ad/:id" element={<AdDetail />} />
              <Route path="/community" element={<Community />} />
              <Route path="/training" element={<Training />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
