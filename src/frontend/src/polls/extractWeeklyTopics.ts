/**
 * Deterministic extraction of top topics from weekly posts/comments.
 * This module provides utilities for analyzing post content to identify trending topics.
 * 
 * Note: Currently not in active use - topic extraction logic is handled
 * directly in useWeeklyPoll.ts via engagement-based ranking.
 */

import type { PostView } from '../backend';

export interface TopicFrequency {
  topic: string;
  frequency: number;
}

/**
 * Extract top N topics from posts and comments based on word frequency.
 * Uses deterministic tie-breaking (alphabetical order) for stable results.
 * 
 * @param posts - Array of posts to analyze
 * @param topN - Number of top topics to return (default: 10)
 * @returns Array of topics sorted by frequency (descending)
 */
export function extractWeeklyTopics(posts: PostView[], topN: number = 10): TopicFrequency[] {
  if (!posts || posts.length === 0) {
    return [];
  }

  // Collect all words from posts and comments
  const wordFrequency = new Map<string, number>();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us',
    'them', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
  ]);

  posts.forEach(post => {
    // Process post content
    const postWords = extractWords(post.content);
    postWords.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });

    // Process comment content
    post.comments.forEach(comment => {
      const commentWords = extractWords(comment.content);
      commentWords.forEach(word => {
        if (!stopWords.has(word) && word.length > 2) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });
  });

  // Convert to array and sort
  const topics: TopicFrequency[] = Array.from(wordFrequency.entries()).map(([topic, frequency]) => ({
    topic,
    frequency,
  }));

  // Sort by frequency descending, then alphabetically for deterministic tie-breaking
  topics.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return a.topic.localeCompare(b.topic);
  });

  return topics.slice(0, topN);
}

/**
 * Extract individual words from text content.
 * Normalizes to lowercase and removes punctuation.
 */
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 0);
}
