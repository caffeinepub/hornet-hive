import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getNotifications, markAsRead } from '../notifications/localNotificationsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Flag, AlertTriangle, BarChart3 } from 'lucide-react';
import type { NotificationType } from '../notifications/notificationTypes';

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const notifications = identity ? getNotifications(identity.getPrincipal().toString()) : [];

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'post_reported':
        return <Flag className="h-5 w-5 text-destructive" />;
      case 'account_suspended':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'poll_available':
        return <BarChart3 className="h-5 w-5 text-primary" />;
      case 'report_submitted':
        return <Flag className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    if (identity) {
      markAsRead(identity.getPrincipal().toString(), notificationId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${
                notification.read ? 'opacity-60' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="default" className="ml-2">
                      New
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
