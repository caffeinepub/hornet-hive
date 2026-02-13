import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActorStatus } from './hooks/useActorStatus';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetupModal from './components/profile/UsernameSetupModal';
import BootstrapErrorScreen from './components/auth/BootstrapErrorScreen';
import AppErrorBoundary from './components/auth/AppErrorBoundary';
import GlobalAsyncErrorHandler from './components/auth/GlobalAsyncErrorHandler';
import AppShell from './components/layout/AppShell';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import NotificationsPage from './pages/NotificationsPage';
import PollsPage from './pages/PollsPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from '@/components/ui/sonner';
import { bootDiagnostics } from './utils/bootDiagnostics';

type Page = 'feed' | 'create' | 'notifications' | 'polls' | 'profile';

function AppContent() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { isLoading: actorLoading, isError: actorError, error: actorErrorDetails, retryActorInit } = useActorStatus();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError: profileError, error: profileErrorDetails, refetch } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [watchdogTimeout, setWatchdogTimeout] = useState(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  // Record boot phases for diagnostics
  useEffect(() => {
    if (isInitializing) {
      bootDiagnostics.recordPhase('auth-initializing', true);
    } else if (isAuthenticated) {
      bootDiagnostics.recordPhase('auth-complete', true);
    }
  }, [isInitializing, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && actorLoading) {
      bootDiagnostics.recordPhase('actor-initializing', true);
    } else if (isAuthenticated && actorError) {
      bootDiagnostics.recordPhase('actor-init-failed', false, actorErrorDetails?.technicalDetails || 'Unknown actor error');
    } else if (isAuthenticated && !actorLoading && !actorError) {
      bootDiagnostics.recordPhase('actor-ready', true);
    }
  }, [isAuthenticated, actorLoading, actorError, actorErrorDetails]);

  useEffect(() => {
    if (isAuthenticated && profileLoading) {
      bootDiagnostics.recordPhase('profile-loading', true);
    } else if (isAuthenticated && isFetched && !profileError) {
      bootDiagnostics.recordPhase('profile-loaded', true, userProfile ? 'Profile exists' : 'No profile');
    } else if (profileError && profileErrorDetails) {
      bootDiagnostics.recordPhase('profile-error', false, profileErrorDetails);
    }
  }, [isAuthenticated, profileLoading, isFetched, profileError, profileErrorDetails, userProfile]);

  // App-level bootstrap watchdog for authenticated users
  useEffect(() => {
    // Clear any existing watchdog timer
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    const isLoading = actorLoading || profileLoading || !isFetched;
    const hasError = actorError || profileError;

    if (isAuthenticated && isLoading && !hasError) {
      // Start watchdog timer - if loading persists beyond this, show error
      watchdogTimerRef.current = setTimeout(() => {
        bootDiagnostics.recordPhase('watchdog-timeout', false, 'Bootstrap exceeded 15s timeout');
        setWatchdogTimeout(true);
      }, 15000); // 15 second watchdog
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
  }, [isAuthenticated, actorLoading, profileLoading, isFetched, actorError, profileError]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Handle watchdog timeout - app took too long to start
  if (watchdogTimeout && !actorError && !profileError) {
    const handleRetry = async () => {
      // Reset watchdog state
      setWatchdogTimeout(false);
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      // Reset diagnostics
      bootDiagnostics.reset();
      bootDiagnostics.recordPhase('retry-initiated', true);
      // Force fresh actor initialization
      await retryActorInit();
      // Refetch profile
      await refetch();
    };

    const handleLogout = async () => {
      await clear();
      queryClient.clear();
      bootDiagnostics.reset();
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

  // Handle error state - prefer actor error over profile error
  const hasError = actorError || profileError;
  const effectiveError = actorError && actorErrorDetails 
    ? new Error(actorErrorDetails.message)
    : profileError && profileErrorDetails
    ? profileErrorDetails
    : null;

  if (hasError && effectiveError) {
    const handleRetry = async () => {
      // Reset watchdog state
      setWatchdogTimeout(false);
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      // Reset diagnostics
      bootDiagnostics.reset();
      bootDiagnostics.recordPhase('retry-initiated', true);
      // Force fresh actor initialization
      await retryActorInit();
      // Refetch profile
      await refetch();
    };

    const handleLogout = async () => {
      await clear();
      queryClient.clear();
      bootDiagnostics.reset();
    };

    return (
      <>
        <BootstrapErrorScreen
          error={effectiveError}
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // Show username setup modal if authenticated but no profile
  const showProfileSetup = isAuthenticated && !actorLoading && !profileLoading && isFetched && userProfile === null && !hasError;

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

  // Show loading state while actor or profile is being fetched
  if (actorLoading || profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Bootstrap complete - record success
  bootDiagnostics.recordPhase('app-ready', true);

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

export default function App() {
  return (
    <AppErrorBoundary>
      <GlobalAsyncErrorHandler>
        <AppContent />
      </GlobalAsyncErrorHandler>
    </AppErrorBoundary>
  );
}
