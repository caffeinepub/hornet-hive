import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useSuspensionStatus } from '../hooks/useSuspensionStatus';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, LogOut, AlertTriangle, Share2, Copy } from 'lucide-react';
import { formatSuspensionEnd } from '../utils/timeFormat';
import { shareHornetHive, copyLinkToClipboard, isWebShareSupported } from '../utils/shareHornetHive';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { isSuspended, suspensionEnd } = useSuspensionStatus();
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareHornetHive();
      
      if (result.success) {
        if (result.method === 'webshare') {
          // Web Share API succeeded - no toast needed as native UI was shown
        } else {
          // Clipboard methods succeeded
          toast.success('Link copied to clipboard!');
        }
      } else {
        // Only show error if it wasn't a user cancellation
        if (result.error !== 'Share cancelled') {
          toast.error('Could not share link');
        }
      }
    } catch (error) {
      toast.error('Could not share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setIsSharing(true);
    try {
      const result = await copyLinkToClipboard();
      
      if (result.success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Could not copy link');
      }
    } catch (error) {
      toast.error('Could not copy link');
    } finally {
      setIsSharing(false);
    }
  };

  const webShareSupported = isWebShareSupported();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profile</h2>

      {isSuspended && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your account is suspended until {formatSuspensionEnd(suspensionEnd!)}. You cannot post or comment during this time.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">Eureka Student</p>
            </div>
          </div>

          {identity && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Principal ID</p>
              <p className="text-xs font-mono break-all">{identity.getPrincipal().toString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Hornet Hive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Invite your friends to join Hornet Hive and connect with the Eureka community!
          </p>
          <div className="flex gap-2">
            {webShareSupported ? (
              <>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share App
                </Button>
                <Button
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCopyLink}
                disabled={isSharing}
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Hornet Hive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Hornet Hive is a safe space for Eureka students to connect, share, and discuss what matters to them.
          </p>
          <p>
            Remember to keep all posts and comments appropriate and respectful. Inappropriate content will be removed,
            and repeated violations may result in account suspension.
          </p>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>

      <footer className="text-center text-sm text-muted-foreground pt-8 pb-4">
        <p>© {new Date().getFullYear()} Hornet Hive</p>
        <p className="mt-2">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
