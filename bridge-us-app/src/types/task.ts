export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type TaskStatus = 'draft' | 'published' | 'closed';

export interface Task {
  id: string;
  title: string;
  company: string;
  companyId: string;          // 企業ユーザーID
  companyLogoUrl?: string;    // 企業ロゴURL
  description?: string;
  deadline?: string;
  reward?: string;
  category?: string;          // 互換用（先頭カテゴリ）
  categories?: string[];      // 複数カテゴリ
  status: TaskStatus;         // タスクのステータス
  createdAt?: string;
  updatedAt?: string;
  applicantCount?: number;    // 応募者数（企業向け）
  // 学生向け（動的に計算）
  applied?: boolean;
  favorited?: boolean;
}

export interface AppliedTask extends Task {
  appliedAt: string;
  applicationStatus: ApplicationStatus;
}
