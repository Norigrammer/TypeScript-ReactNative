/**
 * チャット関連のモックAPI
 */

import { ChatRoom, Message } from '../types/chat';

// モックデータ
const mockChatRooms: ChatRoom[] = [
  {
    id: 'chat-1',
    taskId: '1',
    taskTitle: 'SNSマーケティング調査',
    companyName: '株式会社テックスタート',
    lastMessage: 'ご応募ありがとうございます。詳細についてお話しできればと思います。',
    lastMessageAt: '2024-01-15T10:30:00Z',
    unreadCount: 2,
  },
  {
    id: 'chat-2',
    taskId: '2',
    taskTitle: 'アプリUIテスト',
    companyName: 'デザインラボ株式会社',
    lastMessage: 'テスト結果のレポートを確認しました。素晴らしい内容でした！',
    lastMessageAt: '2024-01-14T18:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'chat-3',
    taskId: '3',
    taskTitle: 'データ入力作業',
    companyName: '合同会社データワークス',
    lastMessage: '作業お疲れ様でした。報酬の振込手続きを開始しました。',
    lastMessageAt: '2024-01-13T14:20:00Z',
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1-1',
      chatRoomId: 'chat-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'ご応募ありがとうございます！SNSマーケティング調査の件でご連絡いたしました。',
      createdAt: '2024-01-15T09:00:00Z',
      read: true,
    },
    {
      id: 'msg-1-2',
      chatRoomId: 'chat-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'ご連絡ありがとうございます。ぜひ詳細をお聞かせください。',
      createdAt: '2024-01-15T09:15:00Z',
      read: true,
    },
    {
      id: 'msg-1-3',
      chatRoomId: 'chat-1',
      senderId: 'company-1',
      senderType: 'company',
      content: '調査対象は主にInstagramとTikTokを想定しています。週に5時間程度の作業が可能でしょうか？',
      createdAt: '2024-01-15T10:00:00Z',
      read: true,
    },
    {
      id: 'msg-1-4',
      chatRoomId: 'chat-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'はい、週5時間であれば問題なく対応できます！',
      createdAt: '2024-01-15T10:20:00Z',
      read: true,
    },
    {
      id: 'msg-1-5',
      chatRoomId: 'chat-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'ご応募ありがとうございます。詳細についてお話しできればと思います。',
      createdAt: '2024-01-15T10:30:00Z',
      read: false,
    },
  ],
  'chat-2': [
    {
      id: 'msg-2-1',
      chatRoomId: 'chat-2',
      senderId: 'company-2',
      senderType: 'company',
      content: 'アプリUIテストへのご応募ありがとうございます。',
      createdAt: '2024-01-14T15:00:00Z',
      read: true,
    },
    {
      id: 'msg-2-2',
      chatRoomId: 'chat-2',
      senderId: 'user-1',
      senderType: 'user',
      content: 'テストレポートを提出いたしました。ご確認お願いいたします。',
      createdAt: '2024-01-14T17:30:00Z',
      read: true,
    },
    {
      id: 'msg-2-3',
      chatRoomId: 'chat-2',
      senderId: 'company-2',
      senderType: 'company',
      content: 'テスト結果のレポートを確認しました。素晴らしい内容でした！',
      createdAt: '2024-01-14T18:00:00Z',
      read: true,
    },
  ],
  'chat-3': [
    {
      id: 'msg-3-1',
      chatRoomId: 'chat-3',
      senderId: 'company-3',
      senderType: 'company',
      content: 'データ入力作業のご依頼です。詳細をお送りします。',
      createdAt: '2024-01-12T10:00:00Z',
      read: true,
    },
    {
      id: 'msg-3-2',
      chatRoomId: 'chat-3',
      senderId: 'user-1',
      senderType: 'user',
      content: '作業が完了しました。ご確認をお願いいたします。',
      createdAt: '2024-01-13T12:00:00Z',
      read: true,
    },
    {
      id: 'msg-3-3',
      chatRoomId: 'chat-3',
      senderId: 'company-3',
      senderType: 'company',
      content: '作業お疲れ様でした。報酬の振込手続きを開始しました。',
      createdAt: '2024-01-13T14:20:00Z',
      read: true,
    },
  ],
};

/**
 * チャットルーム一覧を取得
 */
export async function getChatRooms(): Promise<ChatRoom[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockChatRooms].sort(
    (a, b) =>
      new Date(b.lastMessageAt || 0).getTime() -
      new Date(a.lastMessageAt || 0).getTime()
  );
}

/**
 * 特定のチャットルームのメッセージを取得
 */
export async function getMessages(chatRoomId: string): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockMessages[chatRoomId] || [];
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  chatRoomId: string,
  content: string
): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    chatRoomId,
    senderId: 'user-1',
    senderType: 'user',
    content,
    createdAt: new Date().toISOString(),
    read: true,
  };

  // モックデータに追加
  if (!mockMessages[chatRoomId]) {
    mockMessages[chatRoomId] = [];
  }
  mockMessages[chatRoomId].push(newMessage);

  // チャットルームの最終メッセージを更新
  const room = mockChatRooms.find((r) => r.id === chatRoomId);
  if (room) {
    room.lastMessage = content;
    room.lastMessageAt = newMessage.createdAt;
  }

  return newMessage;
}

/**
 * メッセージを既読にする
 */
export async function markAsRead(chatRoomId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const messages = mockMessages[chatRoomId];
  if (messages) {
    messages.forEach((msg) => {
      if (msg.senderType === 'company') {
        msg.read = true;
      }
    });
  }

  const room = mockChatRooms.find((r) => r.id === chatRoomId);
  if (room) {
    room.unreadCount = 0;
  }
}

/**
 * 未読メッセージの総数を取得
 */
export async function getTotalUnreadCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockChatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
}
