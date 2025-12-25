export type NotificationType =
  | 'new_task'
  | 'application_approved'
  | 'application_rejected'
  | 'task_reminder'
  | 'message'
  | 'task_completed'
  | 'new_application';      // 企業向け: 新規応募通知

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
