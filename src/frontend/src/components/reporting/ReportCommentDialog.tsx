import { useState } from 'react';
import { useReportComment } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { addNotification } from '../../notifications/localNotificationsStore';
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

interface ReportCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
  commentId: bigint;
}

export default function ReportCommentDialog({ 
  open, 
  onOpenChange, 
  postId, 
  commentId 
}: ReportCommentDialogProps) {
  const { identity } = useInternetIdentity();
  const reportCommentMutation = useReportComment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!identity) return;

    setIsSubmitting(true);
    try {
      await reportCommentMutation.mutateAsync({ postId, commentId });
      
      // Add local notification for reporter
      addNotification(
        identity.getPrincipal().toString(),
        'report_submitted',
        'Your report has been submitted. The comment has been removed from the feed.'
      );
      
      toast.success('Comment reported successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this comment?</AlertDialogTitle>
          <AlertDialogDescription>
            This comment will be removed from the feed immediately. The author will be notified anonymously
            that their comment was reported. Your identity will not be revealed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Reporting...' : 'Report Comment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
