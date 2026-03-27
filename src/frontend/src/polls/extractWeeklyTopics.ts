/**
 * Deterministic extraction of top topics from weekly posts/comments.
 * Note: Currently not in active use - topic extraction logic is handled
 * directly in useWeeklyPoll.ts via engagement-based ranking.
 */

import type { PostView } from "../backend";

export interface TopicFrequency {
  topic: string;
  frequency: number;
}

export function extractWeeklyTopics(
  posts: PostView[],
  topN = 10,
): TopicFrequency[] {
  if (!posts || posts.length === 0) {
    return [];
  }

  const wordFrequency = new Map<string, number>();

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "me",
    "him",
    "us",
    "them",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
  ]);

  for (const post of posts) {
    const postWords = extractWords(post.content);
    for (const word of postWords) {
      if (!stopWords.has(word) && word.length > 2) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    for (const comment of post.comments) {
      const commentWords = extractWords(comment.content);
      for (const word of commentWords) {
        if (!stopWords.has(word) && word.length > 2) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      }
    }
  }

  const topics: TopicFrequency[] = Array.from(wordFrequency.entries()).map(
    ([topic, frequency]) => ({ topic, frequency }),
  );

  topics.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return a.topic.localeCompare(b.topic);
  });

  return topics.slice(0, topN);
}

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}
