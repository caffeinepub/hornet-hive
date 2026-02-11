import { containsDisallowedTerm } from './disallowedTerms';

export function validateTextContent(content: string): { valid: boolean; error?: string } {
  // Check if empty
  if (content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  // Check for disallowed terms
  if (containsDisallowedTerm(content)) {
    return { valid: false, error: 'Your message contains inappropriate language. Please revise and try again.' };
  }
  
  return { valid: true };
}
