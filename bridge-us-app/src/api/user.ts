import { User } from '../types/user';

const mockUser: User = {
  id: 'user-1',
  name: '山田 太郎',
  email: 'yamada.taro@example.com',
  university: '東京大学',
  faculty: '経済学部',
  year: 3,
  bio: '社会課題に興味があり、企業と連携したプロジェクトに積極的に参加したいと思っています。',
  avatarUrl: undefined,
  appliedTaskCount: 3,
  completedTaskCount: 1,
};

export async function getCurrentUser(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockUser;
}

export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  Object.assign(mockUser, updates);
  return mockUser;
}
