import type { Task, Subtask, Category, TaskPriority } from '@/shared/db/schema';

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

export interface TaskWithRelations extends Task {
  category: Category | null;
  subtasks: Subtask[];
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
  categoryId?: string | null;
  subtasks?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string | null;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | null;
  categoryId?: string | null;
}
