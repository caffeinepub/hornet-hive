import { Home, PlusCircle, Bell, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Page = 'feed' | 'create' | 'notifications' | 'polls' | 'profile';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { page: 'feed' as Page, icon: Home, label: 'Feed' },
    { page: 'create' as Page, icon: PlusCircle, label: 'Post' },
    { page: 'polls' as Page, icon: BarChart3, label: 'Polls' },
    { page: 'profile' as Page, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ page, icon: Icon, label }) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              className="flex-col h-14 gap-1"
              onClick={() => onNavigate(page)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
