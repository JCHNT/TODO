export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'inProgress' | 'done';
export type ViewMode = 'list' | 'calendar';
export type TimeView = 'day' | 'week' | 'month';
export type Theme = 'light' | 'dark';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: Tag[];
  status: Status;
  createdAt: Date;
  deadline: Date;
  completedAt?: Date;
  reminder?: Date;
  order: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  deadline: Date;
  reminder?: Date;
}