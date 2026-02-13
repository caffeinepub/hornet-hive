import { bootDiagnostics } from './bootDiagnostics';

/**
 * Safely logs errors to the console without exposing sensitive data.
 * Redacts principals, tokens, and other potentially sensitive information.
 */
export function safeLogError(error: Error, componentStack?: string): void {
  const message = error.message || 'Unknown error';
  const stack = error.stack || 'No stack trace available';
  
  // Redact sensitive patterns (principals, tokens, etc.)
  const redactedMessage = redactSensitiveData(message);
  const redactedStack = redactSensitiveData(stack);
  
  console.error('=== Application Error ===');
  console.error('Message:', redactedMessage);
  console.error('Stack:', redactedStack);
  
  if (componentStack) {
    console.error('Component Stack:', componentStack);
  }
  
  // Include boot diagnostics if available
  const diagnostics = bootDiagnostics.getSnapshot();
  if (diagnostics.phases.length > 0) {
    console.error('Boot Diagnostics:', bootDiagnostics.getSummary());
  }
  
  console.error('========================');
}

/**
 * Redacts potentially sensitive data from error messages and stacks.
 */
function redactSensitiveData(text: string): string {
  // Redact principal IDs (format: xxxxx-xxxxx-xxxxx-xxxxx-xxx)
  let redacted = text.replace(/[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}/gi, '[PRINCIPAL_REDACTED]');
  
  // Redact potential tokens (long alphanumeric strings)
  redacted = redacted.replace(/[a-zA-Z0-9]{32,}/g, '[TOKEN_REDACTED]');
  
  return redacted;
}

/**
 * Formats an error for display in the UI (safe for users to see).
 */
export function formatErrorForDisplay(error: Error): { message: string; stack?: string } {
  const message = error.message || 'An unexpected error occurred';
  const stack = error.stack;
  
  return {
    message: redactSensitiveData(message),
    stack: stack ? redactSensitiveData(stack) : undefined,
  };
}
