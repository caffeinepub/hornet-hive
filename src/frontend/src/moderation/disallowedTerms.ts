// Deterministic list of disallowed terms for username and content moderation
// Version: 2.0.0 - Now uses word-boundary matching to prevent false positives

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
    // Replace common username separators with spaces for word boundary detection
    .replace(/[_-]/g, ' ')
    // Remove other special characters
    .replace(/[^a-z0-9\s]/g, '');
}

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if text contains any disallowed terms using word boundaries
export function containsDisallowedTerm(text: string): boolean {
  const normalized = normalizeText(text);
  
  for (const term of DISALLOWED_TERMS) {
    // Normalize the term the same way
    const normalizedTerm = normalizeText(term);
    
    // Create a regex with word boundaries
    // \b matches word boundaries (transition between \w and \W)
    const regex = new RegExp(`\\b${escapeRegex(normalizedTerm)}\\b`, 'i');
    
    if (regex.test(normalized)) {
      return true;
    }
  }
  
  return false;
}
