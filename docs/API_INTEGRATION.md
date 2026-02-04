# MONARK — Guide d'Intégration API pour Lovable

> **Ce document décrit l'API backend Monark pour permettre au frontend de s'y connecter correctement.**

---

## 🔗 Configuration de Base

```typescript
// src/lib/api-config.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.monark-market.fr',
  VERSION: 'v1',
  TIMEOUT: 30000,
};

export const API_BASE = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`;
```

---

## 🔐 Authentification (JWT)

### Endpoints Auth

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/auth/register` | Inscription |
| POST | `/v1/auth/login` | Connexion (retourne access_token + refresh_token) |
| POST | `/v1/auth/refresh` | Renouveler le token |
| POST | `/v1/auth/logout` | Déconnexion (session courante) |
| POST | `/v1/auth/logout_all` | Déconnexion (toutes sessions) |
| POST | `/v1/auth/forgot_password` | Demande reset password |
| POST | `/v1/auth/reset_password` | Reset avec token |

### Types TypeScript

```typescript
// src/types/auth.ts
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  user: UserPublic;
}

interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  display_name?: string;
}

interface UserPublic {
  id: number;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'pro' | 'elite' | 'admin';
  default_region: string | null;
  default_currency: string;
  marketing_opt_in: boolean;
  created_at: string;
}
```

### Implémentation Client API

```typescript
// src/lib/api-client.ts
import { API_BASE } from './api-config';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('access_token');
    }
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expiré - déconnecter l'utilisateur
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Erreur ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
```

---

## 👤 Utilisateur

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/users/me` | Profil utilisateur courant |
| PATCH | `/v1/users/me` | Modifier profil |
| GET | `/v1/users/me/settings` | Préférences utilisateur |
| PATCH | `/v1/users/me/settings` | Modifier préférences |
| GET | `/v1/users/me/sessions` | Liste des sessions |
| DELETE | `/v1/users/me/sessions/{id}` | Supprimer une session |
| GET | `/v1/users/me/activity` | Historique d'activité |
| GET | `/v1/users/me/role` | Rôle et tier de l'utilisateur |

### Types

```typescript
// src/types/user.ts
interface UserSettings {
  id: number;
  user_id: number;
  locale: string;
  theme: 'light' | 'dark' | 'system';
  email_alerts_enabled: boolean;
  push_alerts_enabled: boolean;
  weekly_summary_enabled: boolean;
  watch_default_view: string;
  settings_json: Record<string, unknown>;
}

interface UserSession {
  id: number;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  is_current: boolean;
  created_at: string;
  last_seen_at: string;
}

interface UserRole {
  role: string;
  is_admin: boolean;
  tier: 'starter' | 'pro' | 'elite' | 'admin';
}
```

---

## 🔔 Notifications

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/notifications` | Liste notifications (pagination + filtre unread_only) |
| PATCH | `/v1/notifications/{id}/read` | Marquer comme lue |
| POST | `/v1/notifications/read_all` | Marquer toutes comme lues |
| DELETE | `/v1/notifications/{id}` | Supprimer notification |

### Types

```typescript
// src/types/notifications.ts
interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'alert' | 'price_drop' | 'deal_found';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPage {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
  unread_count: number;
}

// Requête
interface NotificationsQuery {
  limit?: number;      // default: 20, max: 100
  offset?: number;     // default: 0
  unread_only?: boolean; // default: false
}
```

---

## 📦 Catalogue Hardware

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/categories` | Liste des catégories |
| GET | `/v1/models` | Liste des modèles (filtrable) |
| GET | `/v1/models/{id}` | Détail d'un modèle |
| GET | `/v1/models/{id}/specs` | Spécifications techniques |
| GET | `/v1/models/{id}/similar` | Modèles similaires |
| GET | `/v1/models/autocomplete` | Recherche autocomplete |
| GET | `/v1/catalog/summary` | Stats globales catalogue |
| GET | `/v1/catalog/manufacturers` | Liste fabricants (NVIDIA, AMD...) |
| GET | `/v1/catalog/brands` | Liste marques (MSI, ASUS...) |
| GET | `/v1/catalog/families` | Familles de produits |

### Types

```typescript
// src/types/hardware.ts
interface HardwareCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface HardwareModel {
  id: number;
  category_id: number;
  manufacturer: string;
  brand: string | null;
  name: string;
  family: string | null;
  aliases: string[];
  release_date: string | null;
  msrp_eur: number | null;
  created_at: string;
}

interface HardwareModelSpecs {
  id: number;
  model_id: number;
  chip: string | null;
  memory_gb: number | null;
  memory_type: string | null;
  bus_width: number | null;
  tdp_watts: number | null;
  specs_json: Record<string, unknown>;
}

interface HardwareModelDetail {
  model: HardwareModel;
  category: HardwareCategory;
  specs: HardwareModelSpecs | null;
}

interface AutocompleteResult {
  id: number;
  name: string;
  manufacturer: string;
  brand: string | null;
  family: string | null;
  category_name: string;
  matched_on: 'name_prefix' | 'alias_prefix' | 'family_prefix' | 'search_text';
}

interface CatalogSummary {
  total_models: number;
  total_categories: number;
  total_manufacturers: number;
  total_brands: number;
  total_families: number;
  last_updated_at: string;
}

// Query params pour /v1/models
interface ModelsQuery {
  category_id?: number;
  manufacturer?: string;
  brand?: string;
  family?: string;
  q?: string;         // recherche texte
  limit?: number;     // default: 20
  offset?: number;
}

// Query params pour /v1/models/autocomplete
interface AutocompleteQuery {
  q: string;          // minimum 2 caractères
  limit?: number;     // default: 10, max: 50
  category_id?: number;
  manufacturer?: string;
}
```

---

## 📢 Annonces

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/ads` | Liste des annonces (filtrable) |
| GET | `/v1/ads/{id}` | Détail annonce |
| GET | `/v1/ads/{id}/prices` | Historique des prix |
| GET | `/v1/ads/search` | Recherche texte |
| GET | `/v1/ads/model/{model_id}` | Annonces d'un modèle |
| GET | `/v1/deals` | Meilleures affaires |

### Types

```typescript
// src/types/ads.ts
interface Ad {
  id: number;
  platform: 'leboncoin' | 'ebay' | 'amazon' | 'backmarket' | 'vinted' | 'facebook';
  platform_ad_id: string;
  model_id: number | null;
  model_name: string | null;
  url: string;
  title: string;
  description: string | null;
  condition: string | null;
  region: string | null;
  status: 'active' | 'sold' | 'expired' | 'inactive';
  item_type: 'component' | 'pc' | 'lot' | 'bundle';
  quality_score: number | null;
  is_outlier: boolean;
  country_code: string | null;
  currency_code: string | null;
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  current_price: number | null;
  current_deal_score: number | null;
  components: AdComponent[];
}

interface AdComponent {
  id: number;
  model_id: number;
  role: string;  // 'cpu', 'gpu', 'ram', 'ssd', etc.
  quantity: number;
}

interface AdPrice {
  id: number;
  ad_id: number;
  seen_at: string;
  price: number;
  price_drop: boolean;
}

interface AdsPage {
  items: Ad[];
  total: number;
  limit: number;
  offset: number;
}

// Query params pour /v1/ads
interface AdsQuery {
  model_id?: number;
  price_min?: number;
  price_max?: number;
  region?: string;
  platform?: string;
  condition?: string;
  status?: string;        // default: 'active'
  order_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'deal_score_desc';
  limit?: number;
  offset?: number;
}
```

---

## 📊 Estimator

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/estimator/run` | Lancer une estimation (V1) |
| GET | `/v1/estimator/history` | Historique des estimations |
| GET | `/v1/estimator/{run_id}` | Détail d'une estimation |
| GET | `/v1/estimator/models/{model_id}` | Market snapshot (V1) |
| POST | `/v1/estimator/evaluate` | Estimation V2 avancée |
| GET | `/v1/estimator/stats` | Stats utilisateur |

### Types

```typescript
// src/types/estimator.ts
interface EstimatorRunCreate {
  model_id: number;
  side: 'buy' | 'sell';
  region?: string;
  condition?: string;
  currency?: string;  // default: 'EUR'
  input_price?: number;
  mode_advanced?: boolean;
}

interface EstimatorRunResult {
  id: number;
  model_id: number;
  side: 'buy' | 'sell';
  region: string | null;
  condition: string | null;
  currency: string;
  input_price: number | null;
  mode_advanced: boolean;
  recommended_buy_price: number | null;
  recommended_sell_price: number | null;
  estimated_margin_eur: number | null;
  estimated_margin_pct: number | null;
  risk_score: number | null;  // 0-100
  summary: 'EXCELLENT_BUY' | 'GOOD_BUY' | 'FAIR' | 'OVERPRICED';
  market_snapshot: MarketSnapshot | null;
  created_at: string;
}

interface MarketSnapshot {
  model_id: number;
  price_median_current: number | null;
  fair_value_30d: number | null;
  price_p25: number | null;
  price_p75: number | null;
  buy_price_safe: number | null;
  sell_price_fast: number | null;
  var_7d_pct: number | null;
  var_30d_pct: number | null;
  volatility_30d: number | null;
  ads_count: number | null;
  median_days_to_sell: number | null;
  liquidity_score: number | null;
}

// V2 - Estimation avancée
interface EstimatorV2Request {
  model_id: string | number;
  listed_price_eur: number;
  platform: 'leboncoin' | 'ebay' | 'amazon' | 'backmarket' | 'vinted' | 'facebook';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  quantity?: number;
  options?: {
    ignore_platform?: boolean;
    ignore_condition?: boolean;
    ignore_location?: boolean;
  };
}

interface EstimatorV2Response {
  tier: string;
  fair_value: number | null;
  fair_value_source: 'sold_likely' | 'fallback_listed';
  show_window_stats: boolean;
  confidence: number;
  confidence_label: 'high' | 'medium' | 'low';
  market_median_eur: number | null;
  volume_30d: number;
  decision_action: 'buy' | 'sell' | 'wait' | 'pass';
  decision_label: string;
  actionable_prices: ActionablePrices | null;
  breakdown: EstimatorBreakdown;
  sections: EstimatorSections;
  platforms: string[];
  meta: {
    model_id: number;
    assumptions: string[];
    computed_at: string;
  };
}

interface ActionablePrices {
  buy_ceiling: number | null;
  sell_target: number | null;
  sell_floor: number | null;
  global_ranges: PriceRange | null;
  ranges_by_condition: Record<string, PriceRange>;
}

interface PriceRange {
  low: number;
  mid: number;
  high: number;
}

interface EstimatorSections {
  market_data: boolean;
  price_breakdown: boolean;
  recommendations: boolean;
  risk_analysis: boolean;
  advanced_analytics: boolean;
}

interface EstimatorStats {
  total_runs: number;
  runs_this_month: number;
  distinct_models: number;
  favorite_category: string | null;
}
```

---

## 💳 Crédits & Billing

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/credits/balance` | Solde de crédits |
| GET | `/v1/credits/history` | Historique des mouvements |
| GET | `/v1/billing/plans` | Liste des plans/packs |
| GET | `/v1/billing/history` | Historique de facturation |

### Types

```typescript
// src/types/credits.ts
interface CreditBalance {
  balance: number;
  currency: 'credits';
}

interface CreditLog {
  id: number;
  user_id: number;
  job_id: number | null;
  delta: number;  // positif = gain, négatif = dépense
  reason: string;
  meta: Record<string, unknown>;
  created_at: string;
}

interface CreditHistoryPage {
  items: CreditLog[];
  total: number;
  limit: number;
  offset: number;
}

interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  plan_type: 'subscription' | 'credits_pack';
  price_eur: number;
  credits_included: number;
  features: string[];
  is_active: boolean;
}
```

---

## 👁️ Watchlist & Alertes

### Endpoints Watchlist

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/watchlist` | Liste des éléments suivis |
| POST | `/v1/watchlist` | Ajouter un élément |
| DELETE | `/v1/watchlist/{id}` | Supprimer un élément |

### Endpoints Alertes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/alerts` | Liste des alertes |
| POST | `/v1/alerts` | Créer une alerte |
| PATCH | `/v1/alerts/{id}` | Modifier une alerte |
| DELETE | `/v1/alerts/{id}` | Supprimer une alerte |

### Types

```typescript
// src/types/watchlist.ts
interface WatchItem {
  id: number;
  user_id: number;
  target_type: 'model' | 'ad';
  target_id: number;
  created_at: string;
}

interface WatchItemCreate {
  target_type: 'model' | 'ad';
  target_id: number;
}

interface WatchItemPage {
  items: WatchItem[];
  total: number;
  limit: number;
  offset: number;
}

// src/types/alerts.ts
type AlertType = 'price_below' | 'price_above' | 'new_listing' | 'deal_detected' | 'trend_change';

interface UserAlert {
  id: number;
  user_id: number;
  target_type: 'model' | 'ad';
  target_id: number;
  alert_type: AlertType;
  threshold_value: number | null;
  region_filter: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserAlertCreate {
  target_type: 'model' | 'ad';
  target_id: number;
  alert_type: AlertType;
  threshold_value?: number;
  region_filter?: string;
}

interface UserAlertUpdate {
  threshold_value?: number;
  region_filter?: string;
  is_active?: boolean;
}
```

---

## 🏠 Dashboard

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/dashboard/overview` | Vue consolidée dashboard |

### Types

```typescript
// src/types/dashboard.ts
interface DashboardOverview {
  user: UserPublic;
  credits: {
    balance: number;
    currency: string;
  };
  recent_jobs: JobSummary[];
  recent_estimates: EstimatorRunSummary[];
  trending_models: TrendingModel[];
  community: {
    rank: number | null;
    total_credits_earned: number;
    total_jobs: number;
    total_ads_contributed: number;
  };
  watchlist: WatchItem[];
  alerts: UserAlert[];
}

interface JobSummary {
  id: number;
  platform: string;
  type: string;
  status: string;
  ads_found: number;
  created_at: string;
}

interface TrendingModel {
  id: number;
  name: string;
  manufacturer: string;
  family: string | null;
  var_7d_pct: number | null;
  price_median: number | null;
}
```

---

## 👥 Communauté

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/community/leaderboard` | Classement contributeurs |
| GET | `/v1/community/stats` | Stats globales communauté |
| GET | `/v1/community/tasks/available` | Tâches disponibles |
| POST | `/v1/community/tasks/claim` | Réclamer une tâche |
| GET | `/v1/community/tasks/my` | Mes tâches |
| POST | `/v1/community/tasks/{id}/complete` | Terminer une tâche |
| POST | `/v1/community/tasks/{id}/release` | Libérer une tâche |

### Types

```typescript
// src/types/community.ts
interface CommunityLeaderboardEntry {
  user_id: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_jobs: number;
  total_ads: number;
  total_credits: number;
  rank: number;
}

interface CommunityLeaderboard {
  entries: CommunityLeaderboardEntry[];
  current_user_rank: number | null;
}

interface CommunityStats {
  total_community_jobs: number;
  total_community_ads_ingested: number;
  total_community_credits_awarded: number;
  contributors_count: number;
}

interface CommunityTask {
  id: number;
  model_id: number;
  model_name: string;
  platform: string;
  region_code: string | null;
  status: 'pending' | 'claimed' | 'completed' | 'expired' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  credit_reward: number;
  expires_at: string | null;
  created_at: string;
}
```

---

## 🎓 Training (Formation)

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/training` | Liste modules avec progression |
| POST | `/v1/training/modules/{id}/complete` | Marquer module complété |

### Types

```typescript
// src/types/training.ts
interface TrainingModule {
  id: number;
  code: string;
  title: string;
  description: string;
  content: string;  // Markdown ou HTML
  order_index: number;
  duration_minutes: number;
  is_premium: boolean;
  created_at: string;
  // Progression utilisateur (si connecté)
  is_completed: boolean;
  completed_at: string | null;
}

interface TrainingModulesResponse {
  modules: TrainingModule[];
  total_modules: number;
  completed_count: number;
  progress_percent: number;
}
```

---

## 🔧 Admin

### Endpoints (nécessite role=admin)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/admin/users` | Liste utilisateurs |
| GET | `/v1/admin/system` | Stats système |
| GET | `/v1/admin/jobs` | Liste jobs avec filtres |
| GET | `/v1/admin/logs` | Logs système |

### Types

```typescript
// src/types/admin.ts
interface AdminUserListPage {
  items: UserPublic[];
  total: number;
  page: number;
  page_size: number;
}

interface AdminSystemStats {
  total_users: number;
  total_ads: number;
  total_jobs: number;
  total_credits_issued: number;
  total_credits_consumed: number;
}

interface AdminJob {
  id: number;
  user_id: number;
  platform: string;
  type: string;
  purpose: string;
  status: string;
  pages_scanned: number;
  ads_found: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

interface AdminJobsPage {
  items: AdminJob[];
  total: number;
  limit: number;
  offset: number;
}

interface SystemLog {
  id: number;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  context: Record<string, unknown>;
  created_at: string;
}

interface SystemLogsPage {
  items: SystemLog[];
  total: number;
  limit: number;
  offset: number;
}

// Query params pour /v1/admin/jobs
interface AdminJobsQuery {
  status?: string;
  platform?: string;
  purpose?: string;
  user_id?: number;
  limit?: number;
  offset?: number;
}

// Query params pour /v1/admin/logs
interface AdminLogsQuery {
  level?: string;
  limit?: number;
  offset?: number;
}
```

---

## 🔄 Market Analytics

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/market/models/{id}/summary` | Résumé marché d'un modèle |
| GET | `/v1/market/models/{id}/history` | Historique des métriques |
| GET | `/v1/market/trending` | Modèles en tendance |

### Types

```typescript
// src/types/market.ts
interface MarketModelSummary {
  model_id: number;
  date: string;
  ads_count: number;
  price_median: number | null;
  price_p25: number | null;
  price_p75: number | null;
  fair_value_30d: number | null;
  buy_price_safe: number | null;
  sell_price_fast: number | null;
  var_7d_pct: number | null;
  var_30d_pct: number | null;
  volatility_30d: number | null;
  liquidity_score: number | null;
  median_days_to_sell: number | null;
}

interface MarketTrendingModel {
  model_id: number;
  model_name: string;
  manufacturer: string;
  family: string | null;
  category_name: string;
  price_median: number | null;
  var_7d_pct: number | null;
  var_30d_pct: number | null;
  ads_count: number;
  liquidity_score: number | null;
}

interface MarketTrendingPage {
  items: MarketTrendingModel[];
  total: number;
  limit: number;
  sort_by: string;
}
```

---

## ⚠️ Gestion des Erreurs

### Format d'erreur standard

```typescript
interface ApiError {
  detail: string;
  // ou pour les erreurs de validation :
  detail: ValidationError[];
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
```

### Codes HTTP courants

| Code | Signification |
|------|---------------|
| 200 | OK |
| 201 | Créé |
| 204 | Supprimé (pas de contenu) |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé (permissions) |
| 404 | Non trouvé |
| 409 | Conflit (doublon) |
| 422 | Erreur de validation |
| 429 | Trop de requêtes (limite) |
| 500 | Erreur serveur |

### Hook de gestion d'erreurs

```typescript
// src/hooks/useApiError.ts
import { useToast } from '@/components/ui/use-toast';

export function useApiError() {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    let message = 'Une erreur est survenue';
    
    if (error instanceof Error) {
      message = error.message;
    }
    
    toast({
      variant: 'destructive',
      title: 'Erreur',
      description: message,
    });
  };

  return { handleError };
}
```

---

## 🚀 Exemple d'implémentation complète

### Hook useAuth

```typescript
// src/hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api-client';
import type { UserPublic, LoginRequest, LoginResponse } from '@/types/auth';

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data: LoginRequest) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/auth/login', data);
          api.setToken(response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignorer les erreurs de logout
        } finally {
          api.setToken(null);
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false });
        }
      },

      refreshUser: async () => {
        try {
          const user = await api.get<UserPublic>('/users/me');
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
          api.setToken(null);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
```

### Hook useNotifications

```typescript
// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { NotificationsPage, Notification } from '@/types/notifications';

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => api.get<NotificationsPage>(
      `/notifications?unread_only=${unreadOnly}`
    ),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      api.patch<Notification>(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.post('/notifications/read_all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
```

---

## ✅ Checklist d'intégration

- [ ] Configurer `API_BASE` vers `https://api.monark-market.fr/v1`
- [ ] Implémenter le client API avec gestion du token JWT
- [ ] Créer le hook/store d'authentification
- [ ] Gérer le refresh token automatique
- [ ] Implémenter la gestion d'erreurs globale
- [ ] Créer les types TypeScript pour chaque endpoint
- [ ] Tester chaque endpoint avec les credentials fournis
- [ ] Gérer les états de chargement (loading states)
- [ ] Implémenter la pagination là où nécessaire
- [ ] Ajouter les toasts/notifications pour les actions utilisateur

---

## 🔑 Credentials de Test

```
Email: admin@example.com
Password: Admin123!
Role: admin (accès complet)
```

---

*Document généré pour l'intégration Lovable — Version 1.0*
