import { useState } from 'react';
import type { Post } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heart, Send } from 'lucide-react';
import { formatTimestamp } from '../../utils/timeFormat';
import { useAddComment, useLikeComment } from '../../hooks/useQueries';
import { useSuspensionStatus } from '../../hooks/useSuspensionStatus';
import { validateTextContent } from '../../moderation/validateTextContent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatSuspensionEnd } from '../../utils/timeFormat';

interface CommentsThreadProps {
  post: Post;
}

export default function CommentsThread({ post }: CommentsThreadProps) {
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const addCommentMutation = useAddComment();
  const likeCommentMutation = useLikeComment();
  const { isSuspended, suspensionEnd } = useSuspensionStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSuspended) {
      setError(`Your account is suspended until ${formatSuspensionEnd(suspensionEnd!)}`);
      return;
    }

    const validation = validateTextContent(commentText);
    if (!validation.valid) {
      setError(validation.error || 'Invalid comment');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ postId: post.id, content: commentText });
      setCommentText('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleLikeComment = (commentId: bigint) => {
    likeCommentMutation.mutate({ postId: post.id, commentId });
  };

  return (
    <div className="space-y-4 pt-4">
      <Separator />

      {/* Comments List */}
      <div className="space-y-3">
        {post.comments.map((comment) => (
          <div key={Number(comment.id)} className="flex gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8"
              onClick={() => handleLikeComment(comment.id)}
              disabled={likeCommentMutation.isPending}
            >
              <Heart className="h-3 w-3" />
              <span className="text-xs">{Number(comment.likes)}</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={isSuspended ? 'You are suspended from commenting' : 'Add a comment...'}
          disabled={addCommentMutation.isPending || isSuspended}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={addCommentMutation.isPending || !commentText.trim() || isSuspended}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
