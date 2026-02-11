import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPosts } from '../hooks/useQueries';
import { getPollState, getCurrentWeekId } from '../polls/pollTimeWindow';
import { getCurrentPoll, createPoll, votePoll } from '../polls/localPollStore';
import { extractWeeklyTopics } from '../polls/extractWeeklyTopics';
import { addNotification } from '../notifications/localNotificationsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function PollsPage() {
  const { identity } = useInternetIdentity();
  const { data: posts } = useGetPosts();
  const [poll, setPoll] = useState(identity ? getCurrentPoll(identity.getPrincipal().toString()) : null);
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

  const handleVote = () => {
    if (!identity || !selectedTopic) return;

    const result = votePoll(identity.getPrincipal().toString(), selectedTopic);
    if (result.success) {
      toast.success('Vote submitted successfully!');
      setPoll(getCurrentPoll(identity.getPrincipal().toString()));
    } else {
      toast.error(result.error || 'Failed to submit vote');
    }
  };

  const getStateMessage = () => {
    switch (pollState) {
      case 'not_available':
        return 'The weekly poll will be available on Friday. Check back then!';
      case 'voting_open':
        return 'Voting is open! Choose the most interesting topic from this week.';
      case 'results_visible':
        return 'Voting has closed. Here are the results from this week\'s poll.';
    }
  };

  const getStateIcon = () => {
    switch (pollState) {
      case 'not_available':
        return <Calendar className="h-12 w-12 text-muted-foreground" />;
      case 'voting_open':
        return <BarChart3 className="h-12 w-12 text-primary" />;
      case 'results_visible':
        return <BarChart3 className="h-12 w-12 text-primary" />;
    }
  };

  if (pollState === 'not_available' || !poll) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Weekly Poll</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            {getStateIcon()}
            <p className="text-muted-foreground">{getStateMessage()}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  const canVote = pollState === 'voting_open' && !poll.userVote;
  const showResults = pollState === 'results_visible' || poll.userVote;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Weekly Poll</h2>

      <Alert>
        <AlertDescription>{getStateMessage()}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Most Interesting Topic This Week</CardTitle>
          <CardDescription>
            {canVote
              ? 'Vote for the topic you found most interesting'
              : showResults
              ? `Total votes: ${totalVotes}`
              : 'Voting closed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canVote ? (
            <>
              <RadioGroup value={selectedTopic || ''} onValueChange={setSelectedTopic}>
                <div className="space-y-3">
                  {poll.topics.map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <RadioGroupItem value={topic} id={topic} />
                      <Label htmlFor={topic} className="flex-1 cursor-pointer">
                        {topic}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={handleVote}
                disabled={!selectedTopic}
                className="w-full"
              >
                Submit Vote
              </Button>
            </>
          ) : showResults ? (
            <div className="space-y-4">
              {poll.topics
                .map((topic) => ({
                  topic,
                  votes: poll.votes[topic] || 0,
                  percentage: totalVotes > 0 ? ((poll.votes[topic] || 0) / totalVotes) * 100 : 0,
                }))
                .sort((a, b) => b.votes - a.votes)
                .map(({ topic, votes, percentage }) => (
                  <div key={topic} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {topic}
                        {poll.userVote === topic && (
                          <span className="ml-2 text-xs text-primary">(Your vote)</span>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {votes} {votes === 1 ? 'vote' : 'votes'} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
