/**
 * Poll time window rules:
 * - Voting opens: Friday 00:00:00 local time
 * - Voting closes: Saturday 00:00:00 local time
 * - Results visible: Saturday 00:00:00 local time onwards
 * - Poll cleanup: Monday 00:00:00 local time (previous week's poll deleted)
 */

export function getCurrentWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return `${year}-W${weekNumber}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function isFridayVotingWindow(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day === 5; // Friday
}

export function isSaturdayOrLater(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day === 6 || day === 0; // Saturday or Sunday
}

export function isMonday(): boolean {
  const now = new Date();
  return now.getDay() === 1;
}

export function getPollState(): 'not_available' | 'voting_open' | 'results_visible' {
  if (isFridayVotingWindow()) {
    return 'voting_open';
  } else if (isSaturdayOrLater()) {
    return 'results_visible';
  } else {
    return 'not_available';
  }
}
