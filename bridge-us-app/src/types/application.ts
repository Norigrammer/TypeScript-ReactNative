import { ApplicationStatus } from './task';

export interface Application {
  id: string;                    // ドキュメントID: `${userId}_${taskId}`
  userId: string;
  taskId: string;
  message?: string;
  appliedAt: string;
  status: ApplicationStatus;
  reviewedAt?: string;           // 企業がレビューした日時
  reviewNote?: string;           // 企業の内部メモ
  // 学生情報スナップショット（企業が一覧で見る用）
  studentName: string;
  studentUniversity?: string;
  studentYear?: number;
  studentAvatarUrl?: string;
}

// 応募とタスク情報を合わせた型（企業向け一覧用）
export interface ApplicationWithTask extends Application {
  taskTitle: string;
  taskDeadline?: string;
  taskReward?: string;
  taskCategory?: string;
}
