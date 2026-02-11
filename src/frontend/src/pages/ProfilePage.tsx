import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useSuspensionStatus } from '../hooks/useSuspensionStatus';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, LogOut, AlertTriangle } from 'lucide-react';
import { formatSuspensionEnd } from '../utils/timeFormat';

export default function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { isSuspended, suspensionEnd } = useSuspensionStatus();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

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
