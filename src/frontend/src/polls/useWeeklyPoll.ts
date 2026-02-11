import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPosts } from '../hooks/useQueries';
import { getPollState, getCurrentWeekId } from './pollTimeWindow';
import { getCurrentPoll, createPoll, votePoll } from './localPollStore';
import { extractWeeklyTopics } from './extractWeeklyTopics';
import { addNotification } from '../notifications/localNotificationsStore';
import { toast } from 'sonner';

interface WeeklyPoll {
  weekId: string;
  topics: string[];
  votes: Record<string, number>;
  userVote: string | null;
}

export function useWeeklyPoll() {
  const { identity } = useInternetIdentity();
  const { data: posts } = useGetPosts();
  const [poll, setPoll] = useState<WeeklyPoll | null>(
    identity ? getCurrentPoll(identity.getPrincipal().toString()) : null
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const pollState = getPollState();

  useEffect(() => {
    if (!identity || !posts) return;

    const principalId = identity.getPrincipal().toString();
    let currentPoll = getCurrentPoll(principalId);

    // Create poll if it doesn't exist and we have posts
    if (!currentPoll && posts.length > 0 && pollState !== 'not_available') {
      const topics = extractWeeklyTopics(posts);
      currentPoll = createPoll(principalId, topics);
      
      // Notify user that poll is available
      if (pollState === 'voting_open') {
        addNotification(principalId, 'poll_available', 'This week\'s poll is now available! Vote for the most interesting topic.');
      }
    }

    setPoll(currentPoll);
  }, [identity, posts, pollState]);

  const handleVote = (topic: string) => {
    if (!identity) return;

    const result = votePoll(identity.getPrincipal().toString(), topic);
    if (result.success) {
      toast.success('Vote submitted successfully!');
      setPoll(getCurrentPoll(identity.getPrincipal().toString()));
      setSelectedTopic(null);
    } else {
      toast.error(result.error || 'Failed to submit vote');
    }
  };

  const totalVotes = poll ? Object.values(poll.votes).reduce((sum, count) => sum + count, 0) : 0;
  const canVote = pollState === 'voting_open' && poll && !poll.userVote;
  const showResults = (pollState === 'results_visible' || (poll && poll.userVote)) && poll;

  return {
    poll,
    pollState,
    selectedTopic,
    setSelectedTopic,
    handleVote,
    totalVotes,
    canVote,
    showResults,
  };
}
