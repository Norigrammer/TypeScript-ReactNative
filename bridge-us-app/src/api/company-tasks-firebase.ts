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
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, TaskStatus } from '../types/task';

export interface CreateTaskData {
  title: string;
  description?: string;
  deadline?: string;
  reward?: string;
  category?: string; // 互換用（単一）
  categories?: string[]; // 複数
  status?: TaskStatus;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  deadline?: string;
  reward?: string;
  category?: string; // 互換用
  categories?: string[];
  status?: TaskStatus;
}

/**
 * 企業の自社タスク一覧をリアルタイム購読
 */
export function subscribeCompanyTasks(
  companyId: string,
  callback: (tasks: Task[]) => void
) {
  const ref = collection(db, 'tasks');
  const q = query(
    ref,
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const tasks = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const categories = Array.isArray((data as any).categories)
        ? (data as any).categories as string[]
        : (data as any).category
          ? [String((data as any).category)]
          : [];
      return {
        id: docSnap.id,
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
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
        applicantCount: data.applicantCount || 0,
      } as Task;
    });

    callback(tasks);
  });

  return unsubscribe;
}

/**
 * 企業の自社タスク一覧を取得（一回限り）
 */
export async function getCompanyTasks(companyId: string): Promise<Task[]> {
  const ref = collection(db, 'tasks');
  const q = query(
    ref,
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const categories = Array.isArray((data as any).categories)
      ? (data as any).categories as string[]
      : (data as any).category
        ? [String((data as any).category)]
        : [];
    return {
      id: docSnap.id,
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
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
      applicantCount: data.applicantCount || 0,
    } as Task;
  });
}

/**
 * タスクを作成
 */
export async function createTask(
  companyId: string,
  companyName: string,
  companyLogoUrl: string | undefined,
  data: CreateTaskData
): Promise<string> {
  const ref = collection(db, 'tasks');
  const taskDoc = doc(ref);

  await setDoc(taskDoc, {
    title: data.title,
    company: companyName,
    companyId,
    companyLogoUrl: companyLogoUrl || null,
    description: data.description || '',
    deadline: data.deadline || null,
    reward: data.reward || null,
    // 互換: categoryは先頭/単一、categoriesは配列
    categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []),
    category: data.category ?? (Array.isArray(data.categories) && data.categories.length > 0 ? data.categories[0] : null),
    status: data.status || 'published',
    applicantCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 企業の公開タスク数を更新
  if (data.status !== 'draft') {
    const companyRef = doc(db, 'users', companyId);
    await updateDoc(companyRef, {
      publishedTaskCount: increment(1),
    });
  }

  return taskDoc.id;
}

/**
 * タスクを更新
 */
export async function updateTask(
  taskId: string,
  companyId: string,
  data: UpdateTaskData
): Promise<void> {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) {
    throw new Error('タスクが見つかりません');
  }

  const currentData = taskSnap.data();

  // 所有者確認
  if (currentData.companyId !== companyId) {
    throw new Error('このタスクを編集する権限がありません');
  }

  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;
  if (data.reward !== undefined) updateData.reward = data.reward;
  if (data.categories !== undefined) updateData.categories = data.categories;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.category === undefined && data.categories !== undefined) {
    updateData.category = data.categories.length > 0 ? data.categories[0] : null;
  }
  if (data.status !== undefined) updateData.status = data.status;

  await updateDoc(taskRef, updateData);

  // ステータス変更による公開タスク数の調整
  if (data.status !== undefined && data.status !== currentData.status) {
    const companyRef = doc(db, 'users', companyId);

    if (currentData.status === 'published' && data.status !== 'published') {
      // 公開 → 非公開：カウント減少
      await updateDoc(companyRef, {
        publishedTaskCount: increment(-1),
      });
    } else if (currentData.status !== 'published' && data.status === 'published') {
      // 非公開 → 公開：カウント増加
      await updateDoc(companyRef, {
        publishedTaskCount: increment(1),
      });
    }
  }
}

/**
 * タスクを削除
 */
export async function deleteTask(
  taskId: string,
  companyId: string
): Promise<void> {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) {
    throw new Error('タスクが見つかりません');
  }

  const taskData = taskSnap.data();

  // 所有者確認
  if (taskData.companyId !== companyId) {
    throw new Error('このタスクを削除する権限がありません');
  }

  await deleteDoc(taskRef);

  // 公開タスクだった場合、カウントを減少
  if (taskData.status === 'published') {
    const companyRef = doc(db, 'users', companyId);
    await updateDoc(companyRef, {
      publishedTaskCount: increment(-1),
    });
  }
}

/**
 * タスクのステータスを変更
 */
export async function updateTaskStatus(
  taskId: string,
  companyId: string,
  status: TaskStatus
): Promise<void> {
  await updateTask(taskId, companyId, { status });
}

/**
 * タスクの応募者数を取得
 */
export async function getTaskApplicantCount(taskId: string): Promise<number> {
  const ref = collection(db, 'applications');
  const q = query(ref, where('taskId', '==', taskId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}
