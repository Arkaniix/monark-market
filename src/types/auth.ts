// API Authentication types - aligned with backend FastAPI
// Last sync: 2026-02-04

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  user: UserPublic;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  display_name?: string;
}

export interface UserPublic {
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

export interface UserSettings {
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

export interface UserSession {
  id: number;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  is_current: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface UserRole {
  role: string;
  is_admin: boolean;
  tier: 'starter' | 'pro' | 'elite' | 'admin';
}
