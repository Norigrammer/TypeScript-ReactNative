import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  where,
  Timestamp,
  serverTimestamp,
  increment,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Application, ApplicationStatus } from '../types/application';
import { getUserById } from './users-firebase';

/**
 * タスクへの応募一覧をリアルタイム購読（企業向け）
 */
export function subscribeTaskApplications(
  taskId: string,
  callback: (applications: Application[]) => void
) {
  const ref = collection(db, 'applications');
  const q = query(
    ref,
    where('taskId', '==', taskId),
    orderBy('appliedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const applications = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        taskId: data.taskId,
        message: data.message,
        appliedAt: data.appliedAt instanceof Timestamp
          ? data.appliedAt.toDate().toISOString()
          : data.appliedAt,
        status: data.status as ApplicationStatus,
        reviewedAt: data.reviewedAt instanceof Timestamp
          ? data.reviewedAt.toDate().toISOString()
          : data.reviewedAt,
        reviewNote: data.reviewNote,
        studentName: data.studentName,
        studentUniversity: data.studentUniversity,
        studentYear: data.studentYear,
        studentAvatarUrl: data.studentAvatarUrl,
      } as Application;
    });

    callback(applications);
  });

  return unsubscribe;
}

/**
 * タスクへの応募一覧を取得（一回限り）
 */
export async function getTaskApplications(taskId: string): Promise<Application[]> {
  const ref = collection(db, 'applications');
  const q = query(
    ref,
    where('taskId', '==', taskId),
    orderBy('appliedAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      taskId: data.taskId,
      message: data.message,
      appliedAt: data.appliedAt instanceof Timestamp
        ? data.appliedAt.toDate().toISOString()
        : data.appliedAt,
      status: data.status as ApplicationStatus,
      reviewedAt: data.reviewedAt instanceof Timestamp
        ? data.reviewedAt.toDate().toISOString()
        : data.reviewedAt,
      reviewNote: data.reviewNote,
      studentName: data.studentName,
      studentUniversity: data.studentUniversity,
      studentYear: data.studentYear,
      studentAvatarUrl: data.studentAvatarUrl,
    } as Application;
  });
}

/**
 * 応募を承認
 */
export async function approveApplication(
  applicationId: string,
  companyId: string,
  companyName: string,
  taskId: string,
  taskTitle: string,
  reviewNote?: string
): Promise<string> {
  const applicationRef = doc(db, 'applications', applicationId);
  const applicationSnap = await getDoc(applicationRef);

  if (!applicationSnap.exists()) {
    throw new Error('応募が見つかりません');
  }

  const applicationData = applicationSnap.data();
  const studentId = applicationData.userId;

  // 応募ステータスを更新
  await updateDoc(applicationRef, {
    status: 'approved' as ApplicationStatus,
    reviewedAt: serverTimestamp(),
    reviewNote: reviewNote || null,
  });

  // チャットルームを作成
  const chatRoomId = await createChatRoom(
    taskId,
    taskTitle,
    companyId,
    companyName,
    studentId,
    applicationData.studentName
  );

  // 学生に通知を送信
  await sendApplicationNotification(
    studentId,
    'application_approved',
    taskTitle,
    companyName
  );

  return chatRoomId;
}

/**
 * 応募を拒否
 */
export async function rejectApplication(
  applicationId: string,
  taskTitle: string,
  companyName: string,
  reviewNote?: string
): Promise<void> {
  const applicationRef = doc(db, 'applications', applicationId);
  const applicationSnap = await getDoc(applicationRef);

  if (!applicationSnap.exists()) {
    throw new Error('応募が見つかりません');
  }

  const applicationData = applicationSnap.data();
  const studentId = applicationData.userId;

  await updateDoc(applicationRef, {
    status: 'rejected' as ApplicationStatus,
    reviewedAt: serverTimestamp(),
    reviewNote: reviewNote || null,
  });

  // 学生に通知を送信
  await sendApplicationNotification(
    studentId,
    'application_rejected',
    taskTitle,
    companyName
  );
}

/**
 * チャットルームを作成（応募承認時）
 */
async function createChatRoom(
  taskId: string,
  taskTitle: string,
  companyId: string,
  companyName: string,
  studentId: string,
  studentName: string
): Promise<string> {
  // 既存のチャットルームをチェック
  const existingRoom = await findExistingChatRoom(taskId, companyId, studentId);
  if (existingRoom) {
    return existingRoom;
  }

  const chatRoomsRef = collection(db, 'chatRooms');
  const newRoomRef = doc(chatRoomsRef);

  await setDoc(newRoomRef, {
    taskId,
    taskTitle,
    companyId,
    companyName,
    studentId,
    studentName,
    participants: [companyId, studentId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    lastMessageAt: null,
  });

  return newRoomRef.id;
}

/**
 * 既存のチャットルームを検索
 */
async function findExistingChatRoom(
  taskId: string,
  companyId: string,
  studentId: string
): Promise<string | null> {
  const ref = collection(db, 'chatRooms');
  const q = query(
    ref,
    where('taskId', '==', taskId),
    where('companyId', '==', companyId),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].id;
}

/**
 * 応募に関する通知を送信
 */
async function sendApplicationNotification(
  userId: string,
  type: 'application_approved' | 'application_rejected',
  taskTitle: string,
  companyName: string
): Promise<void> {
  const notificationsRef = collection(db, 'notifications');

  const title = type === 'application_approved'
    ? '応募が承認されました'
    : '応募結果のお知らせ';

  const body = type === 'application_approved'
    ? `${companyName}が「${taskTitle}」への応募を承認しました。チャットでメッセージを送りましょう！`
    : `${companyName}が「${taskTitle}」への応募を見送りました。`;

  await addDoc(notificationsRef, {
    userId,
    type,
    title,
    body,
    taskTitle,
    companyName,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * 企業に新規応募通知を送信
 */
export async function sendNewApplicationNotification(
  companyId: string,
  taskId: string,
  taskTitle: string,
  studentName: string
): Promise<void> {
  const notificationsRef = collection(db, 'notifications');

  await addDoc(notificationsRef, {
    userId: companyId,
    type: 'new_application',
    title: '新しい応募があります',
    body: `${studentName}さんが「${taskTitle}」に応募しました`,
    taskId,
    taskTitle,
    studentName,
    isRead: false,
    createdAt: serverTimestamp(),
  });

  // タスクの応募者数を更新
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    applicantCount: increment(1),
  });
}
