// Re-export from provider-based hooks for backward compatibility
export {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "./useProviderData";

// Re-export types
export type { Notification, NotificationsResponse } from "@/providers/types";
