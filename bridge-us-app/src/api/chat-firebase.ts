import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type ChatMessage = {
  id?: string;
  text: string;
  roomId: string;
  senderId: string;
  createdAt?: any;
};

export function subscribeMessages(roomId: string, cb: (messages: ChatMessage[]) => void) {
  const ref = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    const list: ChatMessage[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ChatMessage) }));
    cb(list);
  });
  return unsub;
}

export async function sendMessage(roomId: string, senderId: string, text: string) {
  const ref = collection(db, 'chatRooms', roomId, 'messages');
  await addDoc(ref, {
    text,
    roomId,
    senderId,
    createdAt: serverTimestamp(),
  });

  // Update room with last message metadata
  const roomRef = doc(db, 'chatRooms', roomId);
  await updateDoc(roomRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
}

export function subscribeChatRooms(userId: string, cb: (rooms: any[]) => void) {
  const ref = collection(db, 'chatRooms');
  const q = query(ref, where('participants', 'array-contains', userId));
  const unsub = onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(list);
  });
  return unsub;
}

/**
 * 未読チャット数をリアルタイムで購読
 */
export function subscribeUnreadChatCount(
  userId: string,
  callback: (count: number) => void
) {
  const ref = collection(db, 'chatRooms');
  const q = query(ref, where('participants', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // unreadCount は userId ごとに管理されている想定
      const unreadCountByUser = data.unreadCountByUser || {};
      totalUnread += unreadCountByUser[userId] || 0;
    });
    callback(totalUnread);
  });

  return unsubscribe;
}
