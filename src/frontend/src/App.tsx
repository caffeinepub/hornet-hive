import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetupModal from './components/profile/UsernameSetupModal';
import AppShell from './components/layout/AppShell';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import NotificationsPage from './pages/NotificationsPage';
import PollsPage from './pages/PollsPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from '@/components/ui/sonner';

type Page = 'feed' | 'create' | 'notifications' | 'polls' | 'profile';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('feed');

  const isAuthenticated = !!identity;

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show username setup modal if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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
