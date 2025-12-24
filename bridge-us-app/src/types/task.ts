export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Task {
  id: string;
  title: string;
  company: string;
  description?: string;
  deadline?: string;
  reward?: string;
  category?: string;
  applied?: boolean;
  favorited?: boolean;
}

export interface AppliedTask extends Task {
  appliedAt: string;
  status: ApplicationStatus;
}
