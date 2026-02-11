import { useState } from 'react';
import type { PostView } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heart, Send, Trash2, Flag } from 'lucide-react';
import { formatTimestamp } from '../../utils/timeFormat';
import { useAddComment, useLikeComment } from '../../hooks/useQueries';
import { useSuspensionStatus } from '../../hooks/useSuspensionStatus';
import { validateTextContent } from '../../moderation/validateTextContent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatSuspensionEnd } from '../../utils/timeFormat';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import DeleteCommentDialog from './DeleteCommentDialog';
import ReportCommentDialog from '../reporting/ReportCommentDialog';
import { toast } from 'sonner';

interface CommentsThreadProps {
  post: PostView;
}

export default function CommentsThread({ post }: CommentsThreadProps) {
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<bigint | null>(null);
  const [likingCommentId, setLikingCommentId] = useState<bigint | null>(null);
  
  const addCommentMutation = useAddComment();
  const likeCommentMutation = useLikeComment();
  const { isSuspended, suspensionEnd } = useSuspensionStatus();
  const { identity } = useInternetIdentity();

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

  const handleLikeComment = async (commentId: bigint) => {
    setLikingCommentId(commentId);
    try {
      await likeCommentMutation.mutateAsync({ postId: post.id, commentId });
    } catch (err: any) {
      // Map backend error to user-friendly message
      const errorMessage = err.message || '';
      if (errorMessage.includes('already liked') || errorMessage.includes('duplicate')) {
        toast.error('You have already liked this comment.');
      } else {
        toast.error('Failed to like comment. Please try again.');
      }
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleDeleteClick = (commentId: bigint) => {
    setSelectedCommentId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = (commentId: bigint) => {
    setSelectedCommentId(commentId);
    setReportDialogOpen(true);
  };

  const isCommentAuthor = (commentAuthorId: string): boolean => {
    if (!identity) return false;
    return commentAuthorId === identity.getPrincipal().toString();
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
            <div className="flex items-start gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-8"
                onClick={() => handleLikeComment(comment.id)}
                disabled={likingCommentId === comment.id}
              >
                <Heart className="h-3 w-3" />
                <span className="text-xs">{Number(comment.likes)}</span>
              </Button>
              {isCommentAuthor(comment.authorId.toString()) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteClick(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReportClick(comment.id)}
                >
                  <Flag className="h-3 w-3" />
                </Button>
              )}
            </div>
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

      {/* Delete Comment Dialog */}
      {selectedCommentId !== null && (
        <DeleteCommentDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          postId={post.id}
          commentId={selectedCommentId}
        />
      )}

      {/* Report Comment Dialog */}
      {selectedCommentId !== null && (
        <ReportCommentDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          postId={post.id}
          commentId={selectedCommentId}
        />
      )}
    </div>
  );
}
