import { useState } from 'react';
import { useDeleteComment } from '../../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
  commentId: bigint;
}

export default function DeleteCommentDialog({ 
  open, 
  onOpenChange, 
  postId, 
  commentId 
}: DeleteCommentDialogProps) {
  const deleteCommentMutation = useDeleteComment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
      toast.success('Comment deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your comment will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
