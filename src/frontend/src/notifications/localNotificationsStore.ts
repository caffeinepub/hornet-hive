import type { Notification, NotificationType } from './notificationTypes';

const STORAGE_KEY_PREFIX = 'hornet_hive_notifications_';

function getStorageKey(principalId: string): string {
  return `${STORAGE_KEY_PREFIX}${principalId}`;
}

export function getNotifications(principalId: string): Notification[] {
  try {
    const stored = localStorage.getItem(getStorageKey(principalId));
    if (!stored) return [];
    const notifications = JSON.parse(stored) as Notification[];
    // Sort by timestamp descending (newest first)
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
}

export function addNotification(
  principalId: string,
  type: NotificationType,
  message: string
): void {
  try {
    const notifications = getNotifications(principalId);
    const newNotification: Notification = {
      id: `${Date.now()}_${Math.random()}`,
      type,
      message,
      timestamp: Date.now(),
      read: false,
    };
    notifications.unshift(newNotification);
    localStorage.setItem(getStorageKey(principalId), JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to add notification:', error);
  }
}

export function markAsRead(principalId: string, notificationId: string): void {
  try {
    const notifications = getNotifications(principalId);
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(getStorageKey(principalId), JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export function getUnreadCount(principalId: string): number {
  const notifications = getNotifications(principalId);
  return notifications.filter(n => !n.read).length;
}
