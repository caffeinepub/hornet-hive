import { useState } from 'react';
import { useReportPost } from '../../hooks/useQueries';
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

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
}

export default function ReportPostDialog({ open, onOpenChange, postId }: ReportPostDialogProps) {
  const { identity } = useInternetIdentity();
  const reportPostMutation = useReportPost();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!identity) return;

    setIsSubmitting(true);
    try {
      await reportPostMutation.mutateAsync(postId);
      
      // Add local notification for reporter
      addNotification(
        identity.getPrincipal().toString(),
        'report_submitted',
        'Your report has been submitted. The post has been removed from the feed.'
      );
      
      toast.success('Post reported successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This post will be removed from the feed immediately. The author will be notified anonymously
            that their post was reported. Your identity will not be revealed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Reporting...' : 'Report Post'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
