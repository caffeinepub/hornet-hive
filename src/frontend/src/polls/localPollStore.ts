import { getCurrentWeekId, getPollState, isMonday } from "./pollTimeWindow";
import type { WeeklyPoll } from "./useWeeklyPoll";

const STORAGE_KEY_PREFIX = "hornet_hive_poll_";

export interface PostOption {
  id: string;
  postId: number;
  authorName: string;
  contentSnippet: string;
}

function getStorageKey(principalId: string): string {
  return `${STORAGE_KEY_PREFIX}${principalId}`;
}

export function getCurrentPoll(principalId: string): WeeklyPoll | null {
  try {
    if (isMonday()) {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }

    const stored = localStorage.getItem(getStorageKey(principalId));
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }

    if (!parsed.weekId) {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }

    const currentWeekId = getCurrentWeekId();

    if (parsed.weekId !== currentWeekId) {
      localStorage.removeItem(getStorageKey(principalId));
      return null;
    }

    const poll: WeeklyPoll = {
      weekId: parsed.weekId,
      postOptions: Array.isArray(parsed.postOptions) ? parsed.postOptions : [],
      customOptions: Array.isArray(parsed.customOptions)
        ? parsed.customOptions
        : [],
      votes:
        parsed.votes && typeof parsed.votes === "object" ? parsed.votes : {},
      userVote: parsed.userVote !== undefined ? parsed.userVote : null,
    };

    return poll;
  } catch (error) {
    console.error("Failed to load poll:", error);
    try {
      localStorage.removeItem(getStorageKey(principalId));
    } catch (_e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

export function createPoll(
  principalId: string,
  postOptions: PostOption[],
): WeeklyPoll {
  const poll: WeeklyPoll = {
    weekId: getCurrentWeekId(),
    postOptions,
    customOptions: [],
    votes: {},
    userVote: null,
  };

  for (const option of postOptions) {
    poll.votes[option.id] = 0;
  }

  try {
    localStorage.setItem(getStorageKey(principalId), JSON.stringify(poll));
  } catch (error) {
    console.error("Failed to save poll:", error);
  }

  return poll;
}

export function votePoll(
  principalId: string,
  optionId: string,
): { success: boolean; error?: string } {
  const state = getPollState();

  if (state !== "voting_open") {
    return { success: false, error: "Voting is only available on Fridays" };
  }

  try {
    const poll = getCurrentPoll(principalId);
    if (!poll) {
      return { success: false, error: "No active poll found" };
    }

    if (poll.userVote) {
      return { success: false, error: "You have already voted this week" };
    }

    const trimmedOptionId = optionId.trim();
    if (!trimmedOptionId) {
      return { success: false, error: "Invalid option" };
    }

    const isPostOption = poll.postOptions.some(
      (opt) => opt.id === trimmedOptionId,
    );
    if (!isPostOption) {
      if (!poll.customOptions.includes(trimmedOptionId)) {
        poll.customOptions.push(trimmedOptionId);
      }
    }

    poll.userVote = trimmedOptionId;
    poll.votes[trimmedOptionId] = (poll.votes[trimmedOptionId] || 0) + 1;

    localStorage.setItem(getStorageKey(principalId), JSON.stringify(poll));
    return { success: true };
  } catch (error) {
    console.error("Failed to vote:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}
