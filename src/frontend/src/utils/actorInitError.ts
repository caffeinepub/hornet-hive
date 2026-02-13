/**
 * Utility to normalize and classify actor initialization errors.
 * Helps distinguish connectivity issues from other failures.
 */

export interface NormalizedActorError {
  message: string;
  technicalDetails: string;
  category: 'connectivity' | 'timeout' | 'authentication' | 'unknown';
}

export function normalizeActorError(error: unknown): NormalizedActorError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Connectivity issues
  if (
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('unreachable') ||
    lowerMessage.includes('offline')
  ) {
    return {
      message: 'Unable to connect to the service. Please check your internet connection and try again.',
      technicalDetails: errorMessage,
      category: 'connectivity',
    };
  }

  // Timeout issues
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      message: 'The connection to the service timed out. Please try again.',
      technicalDetails: errorMessage,
      category: 'timeout',
    };
  }

  // Authentication issues
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('identity')
  ) {
    return {
      message: 'There was an authentication issue. Please try logging out and signing in again.',
      technicalDetails: errorMessage,
      category: 'authentication',
    };
  }

  // Unknown/generic error
  return {
    message: 'Unable to initialize the service. Please try again.',
    technicalDetails: errorMessage,
    category: 'unknown',
  };
}
