export type NotificationType = 
  | 'post_reported'
  | 'account_suspended'
  | 'poll_available'
  | 'report_submitted';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
}
