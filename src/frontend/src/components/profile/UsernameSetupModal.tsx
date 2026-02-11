import { useState } from 'react';
import { useSetUniqueUsername } from '../../hooks/useQueries';
import { validateUsername } from '../../moderation/validateUsername';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface UsernameSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UsernameSetupModal({ open, onOpenChange }: UsernameSetupModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setUsernameMutation = useSetUniqueUsername();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username
    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error || 'Invalid username');
      return;
    }

    try {
      await setUsernameMutation.mutateAsync(username);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to set username. It may already be taken.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Choose Your Username</DialogTitle>
          <DialogDescription>
            This is how other students will see you in the Hornet Hive. Choose wisely!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={setUsernameMutation.isPending || username.length < 3}
          >
            {setUsernameMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting username...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
