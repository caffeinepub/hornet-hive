import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { formatErrorForDisplay } from '@/utils/safeErrorLogging';
import { bootDiagnostics } from '@/utils/bootDiagnostics';
import { Toaster } from '@/components/ui/sonner';

interface AppErrorFallbackScreenProps {
  error: Error;
  onReset: () => void;
}

export default function AppErrorFallbackScreen({ error, onReset }: AppErrorFallbackScreenProps) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  const isAuthenticated = !!identity;
  const { message, stack } = formatErrorForDisplay(error);
  const diagnostics = bootDiagnostics.getSnapshot();

  const handleReload = async () => {
    // Clear React Query cache
    queryClient.clear();
    
    // Reset error boundary
    onReset();
    
    // Force page reload as last resort
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      bootDiagnostics.reset();
      onReset();
    } catch (err) {
      // If logout fails, force reload
      window.location.reload();
    }
  };

  return (
    <>
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
            <AlertTitle>Something Went Wrong</AlertTitle>
            <AlertDescription className="mt-2">
              The application encountered an unexpected error. Please try reloading the page.
            </AlertDescription>
          </Alert>

          {/* Technical Details (collapsible) */}
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
            <div className="mt-2 p-3 bg-muted rounded-md space-y-2">
              <p className="font-mono text-xs break-all">
                <strong>Message:</strong> {message}
              </p>
              {stack && (
                <p className="font-mono text-xs break-all whitespace-pre-wrap">
                  <strong>Stack:</strong> {stack}
                </p>
              )}
              {diagnostics.phases.length > 0 && (
                <div className="font-mono text-xs">
                  <strong>Boot phases:</strong>
                  <ul className="mt-1 space-y-1 pl-4">
                    {diagnostics.phases.map((phase, idx) => (
                      <li key={idx} className={phase.success ? 'text-green-600' : 'text-red-600'}>
                        {phase.phase} ({phase.timestamp}ms) {phase.error ? `- ${phase.error}` : ''}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">Total time: {diagnostics.totalTime}ms</p>
                </div>
              )}
            </div>
          </details>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleReload}
              size="lg"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Reload Page
            </Button>
            
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Log Out
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            If the problem persists, please try again later.
          </p>
        </div>
      </div>
      <Toaster />
    </>
  );
}
