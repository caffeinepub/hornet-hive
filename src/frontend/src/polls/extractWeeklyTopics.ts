import type { Post } from '../backend';
import { normalizeText } from '../moderation/disallowedTerms';

/**
 * Deterministic extraction of top 10 topics from weekly posts/comments.
 * 
 * Approach:
 * 1. Collect all text from posts and comments
 * 2. Normalize text (lowercase, remove special chars)
 * 3. Remove common stop words
 * 4. Count word/phrase frequency
 * 5. Select top 10 by frequency
 * 6. Stable tie-breaking by alphabetical order
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i',
  'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'me', 'him', 'us', 'them', 'what', 'which', 'who', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after',
]);

export function extractWeeklyTopics(posts: Post[]): string[] {
  const wordCounts = new Map<string, number>();
  
  // Collect all text
  for (const post of posts) {
    processText(post.content, wordCounts);
    for (const comment of post.comments) {
      processText(comment.content, wordCounts);
    }
  }
  
  // Convert to array and sort
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => {
      // Sort by count descending, then alphabetically for stable tie-breaking
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    });
  
  // Take top 10
  const top10 = sortedWords.slice(0, 10).map(([word]) => word);
  
  // If we have fewer than 10, pad with generic topics
  const fallbackTopics = [
    'School Events',
    'Sports',
    'Homework',
    'Weekend Plans',
    'Clubs',
    'Teachers',
    'Classes',
    'Friends',
    'Activities',
    'Community',
  ];
  
  while (top10.length < 10) {
    const fallback = fallbackTopics[top10.length];
    if (!top10.includes(fallback)) {
      top10.push(fallback);
    }
  }
  
  return top10.slice(0, 10);
}

function processText(text: string, wordCounts: Map<string, number>): void {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(word => 
    word.length > 3 && !STOP_WORDS.has(word)
  );
  
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
}
