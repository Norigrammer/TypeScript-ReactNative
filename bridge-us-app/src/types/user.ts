export type UserType = 'student' | 'company';

// 学生ユーザー
export interface StudentUser {
  id: string;
  email: string;
  userType: 'student';
  name: string;
  university?: string;
  faculty?: string;
  year?: number;
  bio?: string;
  avatarUrl?: string;
  appliedTaskCount: number;
  completedTaskCount: number;
}

// 企業ユーザー
export interface CompanyUser {
  id: string;
  email: string;
  userType: 'company';
  companyName: string;
  representativeName: string;
  description?: string;
  logoUrl?: string;
  publishedTaskCount: number;
}

// ユニオン型
export type User = StudentUser | CompanyUser;

// 型ガード
export function isStudentUser(user: User): user is StudentUser {
  return user.userType === 'student';
}

export function isCompanyUser(user: User): user is CompanyUser {
  return user.userType === 'company';
}

// 後方互換性のため（既存コード用）
export interface LegacyUser {
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
