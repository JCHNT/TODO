export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'inProgress' | 'done';
export type ViewMode = 'list' | 'calendar' | 'kanban';
export type TimeView = 'day' | 'week' | 'month';
export type Theme = 'light' | 'dark';
export type SortBy = 'order' | 'deadline' | 'priority' | 'created' | 'alpha';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: Tag[];
  subtasks: Subtask[];
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
  subtasks: Subtask[];
  deadline: Date;
  reminder?: Date;
}
