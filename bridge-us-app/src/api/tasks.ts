import { Task } from '../types/task';

const MOCK_TASKS: Task[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `task-${i + 1}`,
  title: `おねがいタスク ${i + 1}`,
  company: `サンプル企業 ${i + 1}`,
  description: `これはサンプルのタスク説明です（${i + 1}）。`,
}));

export async function getTasks(): Promise<Task[]> {
  // 擬似的なネットワーク待機
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TASKS;
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_TASKS.find((t) => t.id === id);
}
