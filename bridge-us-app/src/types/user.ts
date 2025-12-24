export interface User {
  id: string;
  name: string;
  email: string;
  university?: string;
  faculty?: string;
  year?: number;
  bio?: string;
  avatarUrl?: string;
  appliedTaskCount: number;
  completedTaskCount: number;
}
