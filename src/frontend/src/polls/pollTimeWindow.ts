/**
 * Poll time window rules (local time):
 * - Week definition: Monday 00:00:00 to next Monday 00:00:00
 * - Candidate posts: Only posts created within the current week window
 * - Voting opens: Friday 00:00:00 local time
 * - Voting closes: Saturday 00:00:00 local time
 * - Results visible: Saturday 00:00:00 through Sunday 23:59:59
 * - Poll cleanup: Monday 00:00:00 local time (previous week's poll deleted)
 */

export function getCurrentWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return `${year}-W${weekNumber}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo;
}

export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getCurrentWeekEnd(): Date {
  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return weekEnd;
}

export function isInCurrentWeek(timestamp: bigint): boolean {
  const weekStart = getCurrentWeekStart();
  const weekEnd = getCurrentWeekEnd();
  const timestampMs = Number(timestamp) / 1_000_000;
  const date = new Date(timestampMs);
  return date >= weekStart && date < weekEnd;
}

export function isFridayVotingWindow(): boolean {
  const now = new Date();
  return now.getDay() === 5;
}

export function isSaturdayOrSunday(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day === 6 || day === 0;
}

export function isMonday(): boolean {
  const now = new Date();
  return now.getDay() === 1;
}

export function getPollState():
  | "not_available"
  | "voting_open"
  | "results_visible" {
  if (isFridayVotingWindow()) {
    return "voting_open";
  }
  if (isSaturdayOrSunday()) {
    return "results_visible";
  }
  return "not_available";
}
