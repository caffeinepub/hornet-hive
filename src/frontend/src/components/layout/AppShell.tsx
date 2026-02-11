import { ReactNode } from 'react';
import { Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BottomNav from '../nav/BottomNav';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { getUnreadCount } from '../../notifications/localNotificationsStore';
import { shareHornetHive } from '../../utils/shareHornetHive';

type Page = 'feed' | 'create' | 'notifications' | 'polls' | 'profile';

interface AppShellProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const unreadCount = identity ? getUnreadCount(identity.getPrincipal().toString()) : 0;

  const handleShare = async () => {
    const result = await shareHornetHive();
    
    // Show success toast only for clipboard/legacy fallback
    if (result.success && (result.method === 'clipboard' || result.method === 'legacy')) {
      toast.success('Link copied to clipboard!');
    }
    
    // Don't show error toast if user cancelled the native share sheet
    if (!result.success && result.error !== 'Share cancelled') {
      toast.error('Failed to share. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/hornet-hive-app-icon.dim_512x512.png"
              alt="Hornet Hive"
              className="w-10 h-10"
            />
            <h1 className="text-xl font-bold text-foreground">Hornet Hive</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
              onClick={() => onNavigate('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
