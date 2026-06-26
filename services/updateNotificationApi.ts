import { apiFetch } from "./api";

export interface SystemUpdateNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  priority: string;
  timestamp: string;
  targeted_roles?: string[];
  is_read_by_user?: number | boolean;
}

/**
 * Fetch targeted system update notifications for a user.
 */
export async function listSystemUpdates(
  userId: number,
  role: string,
  includeRead: boolean = false
): Promise<{ success: boolean; notifications: SystemUpdateNotification[] }> {
  const res = await apiFetch("notifications/get", {
    method: "POST",
    body: JSON.stringify({
      userId,
      userRole: role,
      limit: 50,
      includeRead,
    }),
  });

  if (res && res.success && Array.isArray(res.notifications)) {
    res.notifications = res.notifications.filter(
      (n: any) => n.category === "system_update"
    );
  }
  return res;
}

/**
 * Fetch all system update notifications (Admin management view).
 */
export async function listAllSystemUpdates(): Promise<{
  success: boolean;
  updates: SystemUpdateNotification[];
}> {
  return apiFetch("notifications/listUpdates", {
    method: "POST",
  });
}

/**
 * Create a new system update notification (Super Admin / Developer only).
 */
export async function createSystemUpdate(payload: {
  title: string;
  message: string;
  priority: string;
  forRoles: string[];
}): Promise<{ success: boolean; notification: SystemUpdateNotification }> {
  return apiFetch("notifications/create", {
    method: "POST",
    body: JSON.stringify({
      notification: {
        type: "system",
        category: "system_update",
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        forRoles: payload.forRoles,
      },
    }),
  });
}

/**
 * Delete a system update notification (Super Admin / Developer only).
 */
export async function deleteSystemUpdate(id: string): Promise<{ success: boolean }> {
  return apiFetch("notifications/deleteUpdate", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

/**
 * Mark a notification as read for a user.
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: number
): Promise<{ success: boolean }> {
  return apiFetch("notifications/markAsRead", {
    method: "POST",
    body: JSON.stringify({ notificationId, userId }),
  });
}
