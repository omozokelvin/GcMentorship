import { z } from 'zod'

export const PrioritySchema = z.enum(['low', 'medium', 'high'])
export type Priority = z.infer<typeof PrioritySchema>

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  completed: z.boolean(),
  priority: PrioritySchema,
  project: z.string().max(50).default('Inbox'),
  tags: z.array(z.string().max(30)),
  dueDate: z.string().nullable(), // ISO date string YYYY-MM-DD
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Task = z.infer<typeof TaskSchema>

export const CreateTaskInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().default(''),
  priority: PrioritySchema.optional().default('medium'),
  project: z.string().trim().max(50).optional().default('Inbox'),
  tags: z.array(z.string().trim().min(1).max(30)).optional().default([]),
  dueDate: z.string().nullable().optional().default(null)
})

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>

export const UpdateTaskInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  completed: z.boolean().optional(),
  priority: PrioritySchema.optional(),
  project: z.string().trim().max(50).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).optional(),
  dueDate: z.string().nullable().optional()
})

export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>

export const TaskFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'completed']).default('all'),
  priority: PrioritySchema.or(z.literal('all')).default('all'),
  project: z.string().optional()
})

export type TaskFilter = z.infer<typeof TaskFilterSchema>

export const IPC_CHANNELS = {
  TASKS_LIST: 'tasks:list',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  UI_FOCUS_QUICK_ADD: 'ui:focus-quick-add'
} as const

export interface ElectronTodoAPI {
  listTasks: (filter?: Partial<TaskFilter>) => Promise<Task[]>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (input: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<boolean>
  onFocusQuickAdd: (callback: () => void) => () => void
}
