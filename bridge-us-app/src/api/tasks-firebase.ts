import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  where,
  Timestamp,
  addDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, AppliedTask, ApplicationStatus } from '../types/task';

/**
 * タスク一覧のリアルタイム購読（公開中のタスクのみ）
 */
export function subscribeTasks(
  userId: string | null,
  callback: (tasks: Task[]) => void
) {
  const ref = collection(db, 'tasks');
  // インデックス未作成時のフォールバック: 全件取得してクライアント側でフィルタリング
  const unsubscribe = onSnapshot(ref, async (snapshot) => {
    // 公開中のタスクのみをフィルタリング
    const publishedDocs = snapshot.docs.filter((docSnap) => {
      const data = docSnap.data();
      return data.status === 'published';
    });

    const tasksPromises = publishedDocs.map(async (docSnap) => {
      const data = docSnap.data();
      const taskId = docSnap.id;
      const categories = Array.isArray((data as any).categories)
        ? (data as any).categories as string[]
        : (data as any).category
          ? [String((data as any).category)]
          : [];

      // ユーザーがログインしている場合、応募・お気に入り状態をチェック
      let applied = false;
      let favorited = false;

      if (userId) {
        const applicationRef = doc(db, 'applications', `${userId}_${taskId}`);
        const applicationSnap = await getDoc(applicationRef);
        applied = applicationSnap.exists();

        const favoriteRef = doc(db, 'favorites', `${userId}_${taskId}`);
        const favoriteSnap = await getDoc(favoriteRef);
        favorited = favoriteSnap.exists();
      }

      return {
        id: taskId,
        title: data.title,
        company: data.company,
        companyId: data.companyId,
        companyLogoUrl: data.companyLogoUrl,
        description: data.description,
        deadline: data.deadline instanceof Timestamp
          ? data.deadline.toDate().toISOString().split('T')[0]
          : data.deadline,
        reward: data.reward,
        category: categories[0],
        categories,
        status: data.status || 'published',
        applied,
        favorited,
        createdAt: data.createdAt,
      } as Task;
    });

    const tasks = await Promise.all(tasksPromises);
    // createdAtで降順ソート
    tasks.sort((a, b) => {
      const aTime = (a as any).createdAt?.toMillis?.() || 0;
      const bTime = (b as any).createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(tasks);
  });

  return unsubscribe;
}

/**
 * タスク一覧を取得（一回限り、公開中のタスクのみ）
 */
export async function getTasks(userId: string | null): Promise<Task[]> {
  const ref = collection(db, 'tasks');
  // インデックス未作成時のフォールバック: 全件取得してクライアント側でフィルタリング
  const snapshot = await getDocs(ref);

  // 公開中のタスクのみをフィルタリング
  const publishedDocs = snapshot.docs.filter((docSnap) => {
    const data = docSnap.data();
    return data.status === 'published';
  });

  const tasksPromises = publishedDocs.map(async (docSnap) => {
    const data = docSnap.data();
    const taskId = docSnap.id;
    const categories = Array.isArray((data as any).categories)
      ? (data as any).categories as string[]
      : (data as any).category
        ? [String((data as any).category)]
        : [];

    let applied = false;
    let favorited = false;

    if (userId) {
      const applicationRef = doc(db, 'applications', `${userId}_${taskId}`);
      const applicationSnap = await getDoc(applicationRef);
      applied = applicationSnap.exists();

      const favoriteRef = doc(db, 'favorites', `${userId}_${taskId}`);
      const favoriteSnap = await getDoc(favoriteRef);
      favorited = favoriteSnap.exists();
    }

    return {
      id: taskId,
      title: data.title,
      company: data.company,
      companyId: data.companyId,
      companyLogoUrl: data.companyLogoUrl,
      description: data.description,
      deadline: data.deadline instanceof Timestamp
        ? data.deadline.toDate().toISOString().split('T')[0]
        : data.deadline,
      reward: data.reward,
      category: categories[0],
      categories,
      status: data.status || 'published',
      applied,
      favorited,
      createdAt: data.createdAt,
    } as Task;
  });

  const tasks = await Promise.all(tasksPromises);
  // createdAtで降順ソート
  tasks.sort((a, b) => {
    const aTime = (a as any).createdAt?.toMillis?.() || 0;
    const bTime = (b as any).createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return tasks;
}

/**
 * タスク詳細を取得
 */
export async function getTaskById(
  taskId: string,
  userId: string | null
): Promise<Task | undefined> {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) return undefined;

  const data = taskSnap.data();
  const categories = Array.isArray((data as any).categories)
    ? (data as any).categories as string[]
    : (data as any).category
      ? [String((data as any).category)]
      : [];

  let applied = false;
  let favorited = false;

  if (userId) {
    const applicationRef = doc(db, 'applications', `${userId}_${taskId}`);
    const applicationSnap = await getDoc(applicationRef);
    applied = applicationSnap.exists();

    const favoriteRef = doc(db, 'favorites', `${userId}_${taskId}`);
    const favoriteSnap = await getDoc(favoriteRef);
    favorited = favoriteSnap.exists();
  }

  return {
    id: taskSnap.id,
    title: data.title,
    company: data.company,
    companyId: data.companyId,
    companyLogoUrl: data.companyLogoUrl,
    description: data.description,
    deadline: data.deadline instanceof Timestamp
      ? data.deadline.toDate().toISOString().split('T')[0]
      : data.deadline,
    reward: data.reward,
    category: categories[0],
    categories,
    status: data.status || 'published',
    applied,
    favorited,
  };
}

export interface ApplyToTaskParams {
  userId: string;
  taskId: string;
  message?: string;
  studentName: string;
  studentUniversity?: string;
  studentYear?: number;
  studentAvatarUrl?: string;
}

/**
 * タスクに応募
 */
export async function applyToTask(params: ApplyToTaskParams): Promise<void> {
  const { userId, taskId, message, studentName, studentUniversity, studentYear, studentAvatarUrl } = params;
  const applicationId = `${userId}_${taskId}`;
  const applicationRef = doc(db, 'applications', applicationId);

  // タスク情報を取得（企業への通知用）
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) {
    throw new Error('タスクが見つかりません');
  }

  const taskData = taskSnap.data();

  // 応募を保存（学生情報のスナップショットを含む）
  await setDoc(applicationRef, {
    userId,
    taskId,
    message: message || '',
    appliedAt: serverTimestamp(),
    status: 'pending' as ApplicationStatus,
    studentName,
    studentUniversity: studentUniversity || null,
    studentYear: studentYear || null,
    studentAvatarUrl: studentAvatarUrl || null,
  });

  // タスクの応募者数を更新
  await updateDoc(taskRef, {
    applicantCount: increment(1),
  });

  // 企業に通知を送信
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    userId: taskData.companyId,
    type: 'new_application',
    title: '新しい応募があります',
    body: `${studentName}さんが「${taskData.title}」に応募しました`,
    taskId,
    taskTitle: taskData.title,
    studentName,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * 応募を取り消し
 */
export async function unapplyTask(
  userId: string,
  taskId: string
): Promise<void> {
  const applicationId = `${userId}_${taskId}`;
  const applicationRef = doc(db, 'applications', applicationId);
  await deleteDoc(applicationRef);

  // タスクの応募者数を減少
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    applicantCount: increment(-1),
  });
}

/**
 * 応募中のタスク一覧を取得
 */
export async function getAppliedTasks(userId: string): Promise<AppliedTask[]> {
  const ref = collection(db, 'applications');
  const q = query(ref, where('userId', '==', userId), orderBy('appliedAt', 'desc'));
  const snapshot = await getDocs(q);

  const appliedTasksPromises = snapshot.docs.map(async (appDoc) => {
    const appData = appDoc.data();
    const taskRef = doc(db, 'tasks', appData.taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) return null;

    const taskData = taskSnap.data();
    const categories = Array.isArray((taskData as any).categories)
      ? (taskData as any).categories as string[]
      : (taskData as any).category
        ? [String((taskData as any).category)]
        : [];

    return {
      id: taskSnap.id,
      title: taskData.title,
      company: taskData.company,
      companyId: taskData.companyId,
      companyLogoUrl: taskData.companyLogoUrl,
      description: taskData.description,
      deadline: taskData.deadline instanceof Timestamp
        ? taskData.deadline.toDate().toISOString().split('T')[0]
        : taskData.deadline,
      reward: taskData.reward,
      category: categories[0],
      categories,
      status: taskData.status || 'published',
      applied: true,
      appliedAt: appData.appliedAt instanceof Timestamp
        ? appData.appliedAt.toDate().toISOString().split('T')[0]
        : appData.appliedAt,
      applicationStatus: appData.status as ApplicationStatus,
    } as AppliedTask;
  });

  const results = await Promise.all(appliedTasksPromises);
  return results.filter((t): t is AppliedTask => t !== null);
}

/**
 * お気に入りに追加
 */
export async function addFavorite(userId: string, taskId: string): Promise<void> {
  const favoriteId = `${userId}_${taskId}`;
  const favoriteRef = doc(db, 'favorites', favoriteId);

  await setDoc(favoriteRef, {
    userId,
    taskId,
    createdAt: serverTimestamp(),
  });
}

/**
 * お気に入りを削除
 */
export async function removeFavorite(userId: string, taskId: string): Promise<void> {
  const favoriteId = `${userId}_${taskId}`;
  const favoriteRef = doc(db, 'favorites', favoriteId);
  await deleteDoc(favoriteRef);
}

/**
 * お気に入りタスク一覧を取得
 */
export async function getFavoriteTasks(userId: string): Promise<Task[]> {
  const ref = collection(db, 'favorites');
  const q = query(ref, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const favoriteTasksPromises = snapshot.docs.map(async (favDoc) => {
    const favData = favDoc.data();
    const taskRef = doc(db, 'tasks', favData.taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) return null;

    const taskData = taskSnap.data();
    const categories = Array.isArray((taskData as any).categories)
      ? (taskData as any).categories as string[]
      : (taskData as any).category
        ? [String((taskData as any).category)]
        : [];

    // 応募状態もチェック
    const applicationRef = doc(db, 'applications', `${userId}_${favData.taskId}`);
    const applicationSnap = await getDoc(applicationRef);
    const applied = applicationSnap.exists();

    return {
      id: taskSnap.id,
      title: taskData.title,
      company: taskData.company,
      companyId: taskData.companyId,
      companyLogoUrl: taskData.companyLogoUrl,
      description: taskData.description,
      deadline: taskData.deadline instanceof Timestamp
        ? taskData.deadline.toDate().toISOString().split('T')[0]
        : taskData.deadline,
      reward: taskData.reward,
      category: categories[0],
      categories,
      status: taskData.status || 'published',
      applied,
      favorited: true,
    } as Task;
  });

  const results = await Promise.all(favoriteTasksPromises);
  return results.filter((t): t is Task => t !== null);
}
