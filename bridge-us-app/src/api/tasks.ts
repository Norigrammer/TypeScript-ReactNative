import { Task } from '../types/task';

const MOCK_TASKS: Task[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `task-${i + 1}`,
  title: `おねがいタスク ${i + 1}`,
  company: `サンプル企業 ${i + 1}`,
  description: `これはサンプルのタスク説明です（${i + 1}）。`,
}));

const appliedIds = new Set<string>();

export async function getTasks(): Promise<Task[]> {
  // 擬似的なネットワーク待機
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TASKS.map((t) => ({ ...t, applied: appliedIds.has(t.id) }));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_TASKS.find((t) => t.id === id);
  return base ? { ...base, applied: appliedIds.has(id) } : undefined;
}

export async function applyToTask(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  appliedIds.add(id);
}

export async function unapplyTask(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  appliedIds.delete(id);
}
