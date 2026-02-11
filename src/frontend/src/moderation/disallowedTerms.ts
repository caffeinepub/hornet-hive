// Deterministic list of disallowed terms for username and content moderation
// Version: 1.0.0

export const DISALLOWED_TERMS = [
  // Common profanity
  'damn', 'hell', 'crap', 'ass', 'bastard', 'bitch', 'shit', 'fuck', 'piss',
  // Variants and leetspeak
  'a$$', 'b1tch', 'sh1t', 'fck', 'fuk', 'wtf', 'stfu',
  // Inappropriate topics
  'drug', 'drugs', 'weed', 'alcohol', 'beer', 'drunk', 'sex', 'sexy', 'porn',
  // Slurs and offensive terms (keeping list minimal but effective)
  'stupid', 'idiot', 'dumb', 'loser', 'hate',
];

// Normalize text for consistent matching
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Basic leetspeak normalization
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    // Remove special characters for word boundary detection
    .replace(/[^a-z0-9\s]/g, '');
}

// Check if text contains any disallowed terms
export function containsDisallowedTerm(text: string): boolean {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  
  for (const term of DISALLOWED_TERMS) {
    // Check for exact word match
    if (words.includes(term)) {
      return true;
    }
    // Check for term as substring (catches variations)
    if (normalized.includes(term)) {
      return true;
    }
  }
  
  return false;
}
