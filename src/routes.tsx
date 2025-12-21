import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Deals from "./pages/Deals";
import Tracking from "./pages/Tracking";
import Catalog from "./pages/Catalog";
import ModelDetail from "./pages/ModelDetail";
import PCDetail from "./pages/PCDetail";
import Estimator from "./pages/Estimator";
import AdDetail from "./pages/AdDetail";
import JobDetail from "./pages/JobDetail";
import Community from "./pages/Community";
import Training from "./pages/Training";
import Admin from "./pages/Admin";
import MyAccount from "./pages/MyAccount";
import Billing from "./pages/Billing";
import Pricing from "./pages/Pricing";
import Debug from "./pages/Debug";
import CGU from "./pages/CGU";
import RGPD from "./pages/RGPD";
import LegalNotice from "./pages/LegalNotice";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Redirection legacy /trends vers /
const TrendsRedirect = () => <Navigate to="/" replace />;

export interface RouteConfig {
  path: string;
  component: ComponentType;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

// Configuration des routes de l'application
export const routes: RouteConfig[] = [
  // Pages publiques
  {
    path: "/landing",
    component: Landing,
    requiresAuth: false,
  },
  {
    path: "/auth",
    component: Auth,
    requiresAuth: false,
  },
  {
    path: "/cgu",
    component: CGU,
    requiresAuth: false,
  },
  {
    path: "/rgpd",
    component: RGPD,
    requiresAuth: false,
  },
  {
    path: "/legal-notice",
    component: LegalNotice,
    requiresAuth: false,
  },
  {
    path: "/unauthorized",
    component: Unauthorized,
    requiresAuth: false,
  },

  // Pages nécessitant l'authentification
  {
    path: "/",
    component: Home,
    requiresAuth: true,
  },
  {
    path: "/deals",
    component: Deals,
    requiresAuth: true,
  },
  {
    path: "/tracking",
    component: Tracking,
    requiresAuth: true,
  },
  // Redirection legacy /trends -> / (tendances sur Home)
  {
    path: "/trends",
    component: TrendsRedirect,
    requiresAuth: false,
  },
  {
    path: "/catalog",
    component: Catalog,
    requiresAuth: true,
  },
  {
    path: "/catalog/:id",
    component: ModelDetail,
    requiresAuth: true,
  },
  {
    path: "/models/:id",
    component: ModelDetail,
    requiresAuth: true,
  },
  {
    path: "/pc/:id",
    component: PCDetail,
    requiresAuth: true,
  },
  {
    path: "/estimator",
    component: Estimator,
    requiresAuth: true,
  },
  {
    path: "/ad/:id",
    component: AdDetail,
    requiresAuth: true,
  },
  {
    path: "/ads/:id",
    component: AdDetail,
    requiresAuth: true,
  },
  {
    path: "/jobs/:id",
    component: JobDetail,
    requiresAuth: true,
  },
  {
    path: "/community",
    component: Community,
    requiresAuth: true,
  },
  {
    path: "/training",
    component: Training,
    requiresAuth: true,
  },
  {
    path: "/my-account",
    component: MyAccount,
    requiresAuth: true,
  },
  {
    path: "/billing",
    component: Billing,
    requiresAuth: true,
  },
  {
    path: "/pricing",
    component: Pricing,
    requiresAuth: false,
  },

  // Pages admin
  {
    path: "/admin",
    component: Admin,
    requiresAuth: true,
    requiresAdmin: true,
  },

  // Debug page (dev or admin only - gère son propre contrôle d'accès)
  {
    path: "/debug",
    component: Debug,
    requiresAuth: false,
  },

  // 404 - doit être en dernier
  {
    path: "*",
    component: NotFound,
    requiresAuth: false,
  },
];
