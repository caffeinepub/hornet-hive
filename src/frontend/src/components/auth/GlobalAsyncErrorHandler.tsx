import { useEffect, useState } from 'react';
import AppErrorFallbackScreen from './AppErrorFallbackScreen';

interface GlobalAsyncErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Catches uncaught async errors and unhandled promise rejections
 * that would otherwise result in a blank screen.
 */
export default function GlobalAsyncErrorHandler({ children }: GlobalAsyncErrorHandlerProps) {
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      setAsyncError(event.error || new Error(event.message));
      event.preventDefault();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      setAsyncError(error);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (asyncError) {
    return (
      <AppErrorFallbackScreen
        error={asyncError}
        onReset={() => {
          setAsyncError(null);
          window.location.reload();
        }}
      />
    );
  }

  return <>{children}</>;
}
