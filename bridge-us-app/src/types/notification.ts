export type NotificationType =
  | 'new_task'
  | 'application_approved'
  | 'application_rejected'
  | 'task_reminder'
  | 'message'
  | 'task_completed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  taskId?: string;
  chatId?: string;
}
