import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Calendar } from 'lucide-react';
import { useWeeklyPoll } from '../../polls/useWeeklyPoll';

interface WeeklyPollPanelProps {
  compact?: boolean;
}

export default function WeeklyPollPanel({ compact = false }: WeeklyPollPanelProps) {
  const {
    poll,
    pollState,
    selectedTopic,
    setSelectedTopic,
    handleVote,
    totalVotes,
    canVote,
    showResults,
  } = useWeeklyPoll();

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
        return <Calendar className={compact ? 'h-8 w-8' : 'h-12 w-12'} />;
      case 'voting_open':
        return <BarChart3 className={compact ? 'h-8 w-8' : 'h-12 w-12'} />;
      case 'results_visible':
        return <BarChart3 className={compact ? 'h-8 w-8' : 'h-12 w-12'} />;
    }
  };

  if (pollState === 'not_available' || !poll) {
    return (
      <Card>
        <CardContent className={compact ? 'py-8 text-center space-y-3' : 'py-12 text-center space-y-4'}>
          <div className="flex justify-center text-muted-foreground">
            {getStateIcon()}
          </div>
          <p className={compact ? 'text-sm text-muted-foreground' : 'text-muted-foreground'}>
            {getStateMessage()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <Alert>
          <AlertDescription>{getStateMessage()}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className={compact ? 'text-lg' : undefined}>
            Weekly Poll: Most Interesting Topic
          </CardTitle>
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
                      <RadioGroupItem value={topic} id={`poll-${topic}`} />
                      <Label htmlFor={`poll-${topic}`} className="flex-1 cursor-pointer">
                        {topic}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={() => selectedTopic && handleVote(selectedTopic)}
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
