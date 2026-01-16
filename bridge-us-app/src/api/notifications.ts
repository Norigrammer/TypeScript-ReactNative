import { Notification } from '../types/notification';

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'application_approved',
    title: '応募が承認されました',
    message: '「おねがいタスク 1」への応募が承認されました。企業からの連絡をお待ちください。',
    createdAt: '2024-12-23T10:00:00',
    read: false,
    taskId: 'task-1',
  },
  {
    id: 'notif-2',
    type: 'new_task',
    title: '新着タスクがあります',
    message: 'あなたにおすすめの新しいタスクが追加されました。',
    createdAt: '2024-12-22T15:30:00',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'message',
    title: 'サンプル企業 1からメッセージ',
    message: 'タスクについて確認したいことがあります。',
    createdAt: '2024-12-22T09:15:00',
    read: true,
    chatId: 'chat-1',
  },
  {
    id: 'notif-4',
    type: 'task_reminder',
    title: '締切が近づいています',
    message: '「おねがいタスク 3」の締切が3日後です。',
    createdAt: '2024-12-21T18:00:00',
    read: true,
    taskId: 'task-3',
  },
  {
    id: 'notif-5',
    type: 'task_completed',
    title: 'タスク完了おめでとうございます',
    message: '「おねがいタスク 5」が完了しました。レビューを投稿しましょう。',
    createdAt: '2024-12-20T14:00:00',
    read: true,
    taskId: 'task-5',
  },
  {
    id: 'notif-6',
    type: 'application_rejected',
    title: '応募結果のお知らせ',
    message: '「おねがいタスク 7」への応募は見送りとなりました。',
    createdAt: '2024-12-19T11:00:00',
    read: true,
    taskId: 'task-7',
  },
];

export async function getNotifications(): Promise<Notification[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [...mockNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function markAsRead(notificationId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
}

export async function markAllAsRead(): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  mockNotifications.forEach((n) => {
    n.read = true;
  });
}

export async function getUnreadCount(): Promise<number> {
  await new Promise((r) => setTimeout(r, 100));
  return mockNotifications.filter((n) => !n.read).length;
}
