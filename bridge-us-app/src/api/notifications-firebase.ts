import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification, NotificationType } from '../types/notification';

/**
 * 通知のリアルタイム購読
 */
export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const ref = collection(db, 'notifications');
  const q = query(
    ref,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        type: data.type as NotificationType,
        title: data.title,
        message: data.message,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        read: data.read ?? false,
        taskId: data.taskId,
        chatId: data.chatId,
      };
    });
    callback(notifications);
  });

  return unsubscribe;
}

/**
 * 通知を既読にする
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
}

/**
 * すべての通知を既読にする
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const ref = collection(db, 'notifications');
  const q = query(
    ref,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });

  await batch.commit();
}

/**
 * 未読通知数を取得（リアルタイム）
 */
export function subscribeUnreadCount(
  userId: string,
  callback: (count: number) => void
) {
  const ref = collection(db, 'notifications');
  const q = query(
    ref,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });

  return unsubscribe;
}
