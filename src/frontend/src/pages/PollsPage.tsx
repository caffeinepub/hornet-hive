import WeeklyPollPanel from '../components/polls/WeeklyPollPanel';

export default function PollsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Weekly Poll</h2>
      <WeeklyPollPanel />
    </div>
  );
}
