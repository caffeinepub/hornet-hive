import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetupModal from './components/profile/UsernameSetupModal';
import BootstrapErrorScreen from './components/auth/BootstrapErrorScreen';
import AppShell from './components/layout/AppShell';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import NotificationsPage from './pages/NotificationsPage';
import PollsPage from './pages/PollsPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from '@/components/ui/sonner';

type Page = 'feed' | 'create' | 'notifications' | 'polls' | 'profile';

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError, error, refetch, resetTimeout } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [watchdogTimeout, setWatchdogTimeout] = useState(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  // App-level bootstrap watchdog for authenticated users
  useEffect(() => {
    // Clear any existing watchdog timer
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    if (isAuthenticated && (profileLoading || !isFetched) && !isError) {
      // Start watchdog timer - if loading persists beyond this, show error
      watchdogTimerRef.current = setTimeout(() => {
        setWatchdogTimeout(true);
      }, 12000); // 12 second watchdog (allows for 8s actor timeout + 4s buffer)
    } else {
      // Reset watchdog when not in loading state
      setWatchdogTimeout(false);
    }

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [isAuthenticated, profileLoading, isFetched, isError]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Handle watchdog timeout - app took too long to start
  if (watchdogTimeout && !isError) {
    const handleRetry = async () => {
      // Reset watchdog state
      setWatchdogTimeout(false);
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      // Reset timeout state in the hook
      if (resetTimeout) {
        resetTimeout();
      }
      // Invalidate actor query to force re-initialization
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      // Refetch profile
      await refetch();
    };

    const handleLogout = async () => {
      await clear();
      queryClient.clear();
    };

    const watchdogError = new Error('The app is taking longer than expected to start. Please try again.');

    return (
      <>
        <BootstrapErrorScreen
          error={watchdogError}
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // Handle error state - show error screen with retry and logout options
  if (isError && isFetched) {
    const handleRetry = async () => {
      // Reset watchdog state
      setWatchdogTimeout(false);
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      // Reset timeout state
      if (resetTimeout) {
        resetTimeout();
      }
      // Invalidate actor query to force re-initialization
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      // Refetch profile
      await refetch();
    };

    const handleLogout = async () => {
      await clear();
      queryClient.clear();
    };

    return (
      <>
        <BootstrapErrorScreen
          error={error}
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // Show username setup modal if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && !isError;

  if (showProfileSetup) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <UsernameSetupModal open={true} onOpenChange={() => {}} />
        </div>
        <Toaster />
      </>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'feed' && <FeedPage />}
        {currentPage === 'create' && <CreatePostPage onSuccess={() => setCurrentPage('feed')} />}
        {currentPage === 'notifications' && <NotificationsPage />}
        {currentPage === 'polls' && <PollsPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </AppShell>
      <Toaster />
    </>
  );
}
