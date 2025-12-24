import { Task, AppliedTask, ApplicationStatus } from '../types/task';

const categories = ['データ入力', 'リサーチ', 'デザイン', 'ライティング', '翻訳'];

const MOCK_TASKS: Task[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `task-${i + 1}`,
  title: `おねがいタスク ${i + 1}`,
  company: `サンプル企業 ${i + 1}`,
  description: `これはサンプルのタスク説明です（${i + 1}）。`,
  deadline: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  reward: `${(i + 1) * 1000}円`,
  category: categories[i % categories.length],
}));

interface ApplicationInfo {
  appliedAt: string;
  status: ApplicationStatus;
}

const appliedTasks = new Map<string, ApplicationInfo>();
const favoritedTasks = new Set<string>();

// デモ用の初期応募データ
appliedTasks.set('task-1', { appliedAt: '2024-12-20', status: 'approved' });
appliedTasks.set('task-3', { appliedAt: '2024-12-21', status: 'pending' });
appliedTasks.set('task-5', { appliedAt: '2024-12-19', status: 'completed' });

// デモ用の初期お気に入りデータ
favoritedTasks.add('task-2');
favoritedTasks.add('task-4');

export async function getTasks(): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TASKS.map((t) => ({
    ...t,
    applied: appliedTasks.has(t.id),
    favorited: favoritedTasks.has(t.id),
  }));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_TASKS.find((t) => t.id === id);
  return base
    ? { ...base, applied: appliedTasks.has(id), favorited: favoritedTasks.has(id) }
    : undefined;
}

export async function applyToTask(id: string, message?: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  appliedTasks.set(id, {
    appliedAt: new Date().toISOString().split('T')[0],
    status: 'pending',
  });
}

export async function unapplyTask(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  appliedTasks.delete(id);
}

export async function getAppliedTasks(): Promise<AppliedTask[]> {
  await new Promise((r) => setTimeout(r, 300));
  const result: AppliedTask[] = [];

  appliedTasks.forEach((info, taskId) => {
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (task) {
      result.push({
        ...task,
        applied: true,
        appliedAt: info.appliedAt,
        status: info.status,
      });
    }
  });

  return result.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

export async function addFavorite(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  favoritedTasks.add(id);
}

export async function removeFavorite(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  favoritedTasks.delete(id);
}

export async function getFavoriteTasks(): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TASKS.filter((t) => favoritedTasks.has(t.id)).map((t) => ({
    ...t,
    applied: appliedTasks.has(t.id),
    favorited: true,
  }));
}
