/**
 * チャット関連の型定義
 */

export interface ChatRoom {
  id: string;
  taskId: string;
  taskTitle: string;
  companyName: string;
  companyAvatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: 'user' | 'company';
  content: string;
  createdAt: string;
  read: boolean;
}
