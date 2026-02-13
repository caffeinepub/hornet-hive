import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { bootDiagnostics } from '@/utils/bootDiagnostics';

interface BootstrapErrorScreenProps {
  error: Error | null;
  onRetry: () => void;
  onLogout: () => void;
}

export default function BootstrapErrorScreen({ error, onRetry, onLogout }: BootstrapErrorScreenProps) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const diagnostics = bootDiagnostics.getSnapshot();
  
  // Determine user-friendly error message based on error content
  let displayMessage = 'We encountered a problem loading your profile. This might be due to a network issue or a temporary service problem.';
  
  if (errorMessage.includes('taking longer than expected') || errorMessage.includes('startup')) {
    displayMessage = 'The app is taking longer than expected to start. This might be due to a slow connection or temporary service issue. Please try again.';
  } else if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
    displayMessage = 'The connection to the service timed out. Please check your internet connection and try again.';
  } else if (errorMessage.includes('connect') || errorMessage.includes('unreachable') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
    displayMessage = 'Unable to connect to the service. Please check your internet connection and try again.';
  } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('authentication') || errorMessage.includes('trap')) {
    displayMessage = 'There was an authentication issue. Please try logging out and signing in again.';
  } else if (errorMessage.includes('initialize') || errorMessage.includes('Actor')) {
    displayMessage = 'Unable to initialize the service. Please try again.';
  }

  // Find the most specific error from diagnostics
  const failedPhases = diagnostics.phases.filter(p => !p.success);
  const mostRecentFailure = failedPhases.length > 0 ? failedPhases[failedPhases.length - 1] : null;
  const technicalDetails = mostRecentFailure?.error || errorMessage;

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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={onLogout} variant="outline" className="w-full" size="lg">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>

        {/* Technical Details (collapsed by default) */}
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
          <div className="mt-2 p-3 bg-muted rounded-md space-y-2">
            <p className="font-mono text-xs break-all">
              <strong>Error:</strong> {technicalDetails}
            </p>
            {diagnostics.phases.length > 0 && (
              <div className="font-mono text-xs">
                <strong>Boot phases:</strong>
                <ul className="mt-1 space-y-1 pl-4">
                  {diagnostics.phases.map((phase, idx) => (
                    <li key={idx} className={phase.success ? 'text-green-600' : 'text-red-600'}>
                      {phase.phase} ({phase.timestamp}ms) {phase.success ? '✓' : '✗'}
                      {phase.error && <span className="block pl-2 text-muted-foreground">→ {phase.error}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total time: {diagnostics.totalTime}ms
            </p>
          </div>
        </details>

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground">
          If the problem persists, please check your internet connection or try again later.
        </p>
      </div>
    </div>
  );
}
