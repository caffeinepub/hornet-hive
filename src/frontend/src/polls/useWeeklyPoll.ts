import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPosts } from '../hooks/useQueries';
import { getPollState, getCurrentWeekId, isInCurrentWeek } from './pollTimeWindow';
import { getCurrentPoll, createPoll, votePoll, PostOption } from './localPollStore';
import { addNotification } from '../notifications/localNotificationsStore';
import { toast } from 'sonner';
import type { PostView } from '../backend';

export interface WeeklyPoll {
  weekId: string;
  postOptions: PostOption[];
  customOptions: string[];
  votes: Record<string, number>;
  userVote: string | null;
}

export function useWeeklyPoll() {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading: postsLoading } = useGetPosts();
  const [poll, setPoll] = useState<WeeklyPoll | null>(
    identity ? getCurrentPoll(identity.getPrincipal().toString()) : null
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const pollState = getPollState();

  useEffect(() => {
    if (!identity) return;

    const principalId = identity.getPrincipal().toString();
    let currentPoll = getCurrentPoll(principalId);

    // Only create poll on Friday or later (not Mon-Thu)
    if (!currentPoll && pollState !== 'not_available') {
      // Filter posts to only those from the current week
      const weekPosts = posts?.filter(post => isInCurrentWeek(post.timestamp)) || [];
      
      // Generate top 5 post options from current week's posts
      const postOptions = generateTop5PostOptions(weekPosts);
      
      // Create poll even with 0 post options (allows "Other" voting)
      currentPoll = createPoll(principalId, postOptions);
      
      // Notify user that poll is available (only on Friday)
      if (pollState === 'voting_open') {
        addNotification(principalId, 'poll_available', 'This week\'s poll is now available! Vote for the most engaging post.');
      }
    }

    setPoll(currentPoll);
  }, [identity, posts, pollState]);

  const handleVote = (optionId: string) => {
    if (!identity) return;

    const result = votePoll(identity.getPrincipal().toString(), optionId);
    if (result.success) {
      toast.success('Vote submitted successfully!');
      setPoll(getCurrentPoll(identity.getPrincipal().toString()));
      setSelectedOption(null);
    } else {
      toast.error(result.error || 'Failed to submit vote');
    }
  };

  const totalVotes = poll ? Object.values(poll.votes).reduce((sum, count) => sum + count, 0) : 0;
  const canVote = pollState === 'voting_open' && poll && !poll.userVote;
  
  // Show results on Saturday/Sunday, or if user has already voted (but not immediately on Friday after voting)
  const showResults = pollState === 'results_visible' && poll;

  return {
    poll,
    pollState,
    selectedOption,
    setSelectedOption,
    handleVote,
    totalVotes,
    canVote,
    showResults,
    postsLoading,
  };
}

/**
 * Generate top 5 post options based on engagement (likes + comment count).
 * Deterministic tie-breaking: engagement desc, then post.id asc.
 * Posts are filtered to only include those from the current week.
 */
function generateTop5PostOptions(posts: PostView[]): PostOption[] {
  if (!posts || posts.length === 0) {
    return [];
  }

  const postsWithEngagement = posts.map(post => ({
    post,
    engagement: Number(post.likes) + post.comments.length,
  }));

  // Sort by engagement descending, then by post ID ascending for deterministic tie-breaking
  postsWithEngagement.sort((a, b) => {
    if (b.engagement !== a.engagement) {
      return b.engagement - a.engagement;
    }
    // Stable tie-breaking by post ID
    return Number(a.post.id) - Number(b.post.id);
  });

  // Take top 5
  const top5 = postsWithEngagement.slice(0, 5);

  return top5.map(({ post }) => ({
    id: `post-${post.id}`,
    postId: Number(post.id),
    authorName: post.authorName,
    contentSnippet: truncateContent(post.content, 80),
  }));
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + '...';
}
