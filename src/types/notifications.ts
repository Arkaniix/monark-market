// Notifications types - aligned with backend FastAPI
// Last sync: 2026-02-04

export type NotificationType = 'info' | 'success' | 'warning' | 'alert' | 'price_drop' | 'deal_found';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsPage {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
  unread_count: number;
}

export interface NotificationsQuery {
  limit?: number;      // default: 20, max: 100
  offset?: number;     // default: 0
  unread_only?: boolean; // default: false
}
