import { getCurrentWeekId, getPollState, isMonday } from './pollTimeWindow';

const STORAGE_KEY_PREFIX = 'hornet_hive_poll_';

interface WeeklyPoll {
  weekId: string;
  topics: string[];
  votes: Record<string, number>; // topic -> count
  userVote: string | null; // which topic the user voted for
}

function getStorageKey(principalId: string): string {
  return `${STORAGE_KEY_PREFIX}${principalId}`;
}

export function getCurrentPoll(principalId: string): WeeklyPoll | null {
  try {
    // Check if it's Monday - if so, clear old poll
    if (isMonday()) {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }
    
    const stored = localStorage.getItem(getStorageKey(principalId));
    if (!stored) return null;
    
    const poll = JSON.parse(stored) as WeeklyPoll;
    const currentWeekId = getCurrentWeekId();
    
    // If poll is from a different week, clear it
    if (poll.weekId !== currentWeekId) {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }
    
    return poll;
  } catch (error) {
    console.error('Failed to load poll:', error);
    return null;
  }
}

export function createPoll(principalId: string, topics: string[]): WeeklyPoll {
  const poll: WeeklyPoll = {
    weekId: getCurrentWeekId(),
    topics,
    votes: {},
    userVote: null,
  };
  
  // Initialize vote counts
  for (const topic of topics) {
    poll.votes[topic] = 0;
  }
  
  try {
    localStorage.setItem(getStorageKey(principalId), JSON.stringify(poll));
  } catch (error) {
    console.error('Failed to save poll:', error);
  }
  
  return poll;
}

export function votePoll(principalId: string, topic: string): { success: boolean; error?: string } {
  const state = getPollState();
  
  if (state !== 'voting_open') {
    return { success: false, error: 'Voting is only available on Fridays' };
  }
  
  try {
    const poll = getCurrentPoll(principalId);
    if (!poll) {
      return { success: false, error: 'No active poll found' };
    }
    
    if (poll.userVote) {
      return { success: false, error: 'You have already voted this week' };
    }
    
    if (!poll.topics.includes(topic)) {
      return { success: false, error: 'Invalid topic' };
    }
    
    poll.userVote = topic;
    poll.votes[topic] = (poll.votes[topic] || 0) + 1;
    
    localStorage.setItem(getStorageKey(principalId), JSON.stringify(poll));
    return { success: true };
  } catch (error) {
    console.error('Failed to vote:', error);
    return { success: false, error: 'Failed to submit vote' };
  }
}
