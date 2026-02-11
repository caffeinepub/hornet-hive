import { useState } from 'react';
import { useReportUser } from '../../hooks/useQueries';
import type { Principal } from '@dfinity/principal';
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

interface ReportAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUser: Principal;
  reportedUsername: string;
}

export default function ReportAccountDialog({
  open,
  onOpenChange,
  reportedUser,
  reportedUsername,
}: ReportAccountDialogProps) {
  const reportUserMutation = useReportUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await reportUserMutation.mutateAsync(reportedUser);
      toast.success('Account reported successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report {reportedUsername}'s account?</AlertDialogTitle>
          <AlertDialogDescription>
            If this account receives 5 reports from different students, they will be suspended from
            posting for 7 days. Your report will be anonymous.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Reporting...' : 'Report Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
