import { containsDisallowedTerm } from './disallowedTerms';

export function validateUsername(username: string): { valid: boolean; error?: string } {
  // Check length
  if (username.length === 0) {
    return { valid: false, error: 'Username cannot be empty' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  
  // Check for valid characters (alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  // Check for disallowed terms
  if (containsDisallowedTerm(username)) {
    return { valid: false, error: 'Username contains inappropriate content' };
  }
  
  return { valid: true };
}
