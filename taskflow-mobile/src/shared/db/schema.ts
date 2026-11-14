import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export type TaskPriority = 'low' | 'medium' | 'high';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#2563EB'),
  icon: text('icon').notNull().default('folder-outline'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    notes: text('notes'),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    priority: text('priority').$type<TaskPriority>().notNull().default('medium'),
    dueDate: integer('due_date', { mode: 'timestamp_ms' }),
    reminderId: text('reminder_id'),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    position: integer('position').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_tasks_completed').on(table.completed),
    index('idx_tasks_due_date').on(table.dueDate),
    index('idx_tasks_category').on(table.categoryId),
  ]
);

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  position: integer('position').notNull().default(0),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Subtask = typeof subtasks.$inferSelect;
