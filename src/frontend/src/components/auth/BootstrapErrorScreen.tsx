import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BootstrapErrorScreenProps {
  error: Error | null;
  onRetry: () => void;
  onLogout: () => void;
}

export default function BootstrapErrorScreen({ error, onRetry, onLogout }: BootstrapErrorScreenProps) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  // Determine user-friendly error message
  let displayMessage = 'We encountered a problem loading your profile. This might be due to a network issue or a temporary service problem.';
  
  if (errorMessage.includes('taking longer than expected') || errorMessage.includes('startup')) {
    displayMessage = 'The app is taking longer than expected to start. This might be due to a slow connection or temporary service issue. Please try again.';
  } else if (errorMessage.includes('timed out')) {
    displayMessage = 'The connection to the service timed out. Please check your internet connection and try again.';
  } else if (errorMessage.includes('connect')) {
    displayMessage = 'Unable to connect to the service. Please check your internet connection and try again.';
  } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('trap')) {
    displayMessage = 'There was an authentication issue. Please try logging out and signing in again.';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <img
            src="/assets/generated/hornet-hive-logo.dim_1024x1024.png"
            alt="Hornet Hive"
            className="w-24 h-24 mx-auto"
          />
          <h1 className="text-3xl font-bold text-foreground">Hornet Hive</h1>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load</AlertTitle>
          <AlertDescription className="mt-2">
            {displayMessage}
          </AlertDescription>
        </Alert>

        {/* Technical Details (collapsed by default) */}
        {error && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
            <p className="mt-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
              {errorMessage}
            </p>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onRetry}
            size="lg"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          
          <Button
            onClick={onLogout}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          If the problem persists, please try again later or contact support.
        </p>
      </div>
    </div>
  );
}
