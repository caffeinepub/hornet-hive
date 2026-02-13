import WeeklyPollPanel from '../components/polls/WeeklyPollPanel';

export default function PollsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Weekly Poll</h2>
      <p className="text-muted-foreground">
        Every week, vote for the most engaging post from the top 5 posts ranked by likes and comments.
        Voting opens on Friday, and results are revealed on Saturday.
      </p>
      <WeeklyPollPanel />
    </div>
  );
}
