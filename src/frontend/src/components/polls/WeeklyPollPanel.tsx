import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Calendar } from 'lucide-react';
import { useWeeklyPoll } from '../../polls/useWeeklyPoll';
import { validateTextContent } from '../../moderation/validateTextContent';

interface WeeklyPollPanelProps {
  compact?: boolean;
}

export default function WeeklyPollPanel({ compact = false }: WeeklyPollPanelProps) {
  const {
    poll,
    pollState,
    selectedOption,
    setSelectedOption,
    handleVote,
    totalVotes,
    canVote,
    showResults,
    postsLoading,
  } = useWeeklyPoll();

  const [customResponse, setCustomResponse] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const getStateMessage = () => {
    switch (pollState) {
      case 'not_available':
        return 'The weekly poll will be available on Friday. Check back then!';
      case 'voting_open':
        if (poll && poll.userVote) {
          return 'Thank you for voting! Results will be available on Saturday.';
        }
        return 'Voting is open! Choose the most engaging post from this week.';
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

  const handleSelectionChange = (value: string) => {
    setSelectedOption(value);
    setValidationError(null);
    if (value !== 'other') {
      setCustomResponse('');
    }
  };

  const handleCustomResponseChange = (value: string) => {
    setCustomResponse(value);
    setValidationError(null);
  };

  const handleSubmitVote = () => {
    if (!selectedOption) return;

    if (selectedOption === 'other') {
      const trimmedResponse = customResponse.trim();
      if (!trimmedResponse) {
        setValidationError('Please enter a custom response');
        return;
      }

      const validation = validateTextContent(trimmedResponse);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid response');
        return;
      }

      handleVote(trimmedResponse);
      setCustomResponse('');
      setValidationError(null);
    } else {
      handleVote(selectedOption);
    }
  };

  const isSubmitDisabled = !selectedOption || (selectedOption === 'other' && !customResponse.trim());

  // Show "not available" state on Mon-Thu or when poll doesn't exist yet
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

  // If user has already voted on Friday, show confirmation message (not results yet)
  if (pollState === 'voting_open' && poll.userVote) {
    return (
      <Card>
        <CardContent className={compact ? 'py-8 text-center space-y-3' : 'py-12 text-center space-y-4'}>
          <div className="flex justify-center text-primary">
            <BarChart3 className={compact ? 'h-8 w-8' : 'h-12 w-12'} />
          </div>
          <p className={compact ? 'text-sm text-muted-foreground' : 'text-muted-foreground'}>
            {getStateMessage()}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Safely extract arrays with fallbacks to prevent undefined.map() errors
  const postOptions = poll.postOptions || [];
  const customOptions = poll.customOptions || [];

  // Combine post options and custom options for results display
  const allOptions = [
    ...postOptions.map(opt => ({
      id: opt.id,
      label: `${opt.authorName}: ${opt.contentSnippet}`,
      isCustom: false,
    })),
    ...customOptions.map(custom => ({
      id: custom,
      label: custom,
      isCustom: true,
    })),
  ];

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
            Weekly Poll: Top 5 Posts
          </CardTitle>
          <CardDescription>
            {canVote
              ? 'Vote for the post you found most engaging this week'
              : showResults
              ? `Total votes: ${totalVotes}`
              : 'Voting closed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canVote ? (
            <>
              {postOptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No posts from this week yet.</p>
                  <p className="text-sm mt-2">You can still vote using the "Other" option below.</p>
                </div>
              ) : null}
              
              <RadioGroup value={selectedOption || ''} onValueChange={handleSelectionChange}>
                <div className="space-y-3">
                  {postOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={option.id} id={`poll-${option.id}`} className="mt-1" />
                      <Label htmlFor={`poll-${option.id}`} className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{option.authorName}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {option.contentSnippet}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="poll-other" />
                    <Label htmlFor="poll-other" className="flex-1 cursor-pointer">
                      Other
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {selectedOption === 'other' && (
                <div className="space-y-2 pl-6">
                  <Input
                    type="text"
                    placeholder="Type your custom response..."
                    value={customResponse}
                    onChange={(e) => handleCustomResponseChange(e.target.value)}
                    className="w-full"
                  />
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm">{validationError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmitVote}
                disabled={isSubmitDisabled}
                className="w-full"
              >
                Submit Vote
              </Button>
            </>
          ) : showResults ? (
            <div className="space-y-4">
              {allOptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No votes were cast this week.</p>
                </div>
              ) : (
                allOptions
                  .map((option) => ({
                    ...option,
                    votes: poll.votes[option.id] || 0,
                    percentage: totalVotes > 0 ? ((poll.votes[option.id] || 0) / totalVotes) * 100 : 0,
                  }))
                  .sort((a, b) => b.votes - a.votes)
                  .map(({ id, label, votes, percentage, isCustom }) => (
                    <div key={id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-medium ${isCustom ? 'italic' : ''}`}>
                          {label}
                          {poll.userVote === id && (
                            <span className="ml-2 text-xs text-primary">(Your vote)</span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {votes} {votes === 1 ? 'vote' : 'votes'} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
