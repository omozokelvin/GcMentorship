import { eq, asc, desc } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { tasks, subtasks, categories } from '@/shared/db/schema';
import { createId } from '@/shared/utils/id';
import {
  scheduleTaskReminder,
  cancelTaskReminder,
} from '@/shared/services/notifications';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskWithRelations,
} from '../types/task.types';

export const taskRepository = {
  async getAllWithRelations(): Promise<TaskWithRelations[]> {
    const [allTasks, allSubtasks, allCategories] = await Promise.all([
      db.select().from(tasks).orderBy(asc(tasks.completed), desc(tasks.createdAt)),
      db.select().from(subtasks).orderBy(asc(subtasks.position)),
      db.select().from(categories),
    ]);

    const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
    const subtasksByTask = new Map<string, typeof allSubtasks>();

    for (const sub of allSubtasks) {
      const list = subtasksByTask.get(sub.taskId) ?? [];
      list.push(sub);
      subtasksByTask.set(sub.taskId, list);
    }

    return allTasks.map((task) => ({
      ...task,
      category: task.categoryId ? (categoryMap.get(task.categoryId) ?? null) : null,
      subtasks: subtasksByTask.get(task.id) ?? [],
    }));
  },

  async getById(id: string): Promise<TaskWithRelations | null> {
    const rows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    const task = rows[0];
    if (!task) return null;

    const [taskSubtasks, categoryRows] = await Promise.all([
      db
        .select()
        .from(subtasks)
        .where(eq(subtasks.taskId, id))
        .orderBy(asc(subtasks.position)),
      task.categoryId
        ? db.select().from(categories).where(eq(categories.id, task.categoryId)).limit(1)
        : Promise.resolve([]),
    ]);

    return {
      ...task,
      category: categoryRows[0] ?? null,
      subtasks: taskSubtasks,
    };
  },

  async create(input: CreateTaskInput): Promise<string> {
    const id = createId('tsk');
    const now = new Date();
    let reminderId: string | null = null;

    if (input.dueDate) {
      reminderId = await scheduleTaskReminder(id, input.title, input.dueDate);
    }

    await db.insert(tasks).values({
      id,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      completed: false,
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ?? null,
      reminderId,
      categoryId: input.categoryId ?? null,
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    if (input.subtasks && input.subtasks.length > 0) {
      const validSubtasks = input.subtasks
        .map((s) => s.trim())
        .filter(Boolean)
        .map((title, idx) => ({
          id: createId('sub'),
          taskId: id,
          title,
          completed: false,
          position: idx,
        }));

      if (validSubtasks.length > 0) {
        await db.insert(subtasks).values(validSubtasks);
      }
    }

    return id;
  },

  async update(id: string, input: UpdateTaskInput): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;

    let reminderId = existing.reminderId;

    if (input.dueDate !== undefined || input.completed !== undefined) {
      await cancelTaskReminder(existing.reminderId);
      reminderId = null;

      const nextCompleted = input.completed ?? existing.completed;
      const nextDueDate = input.dueDate !== undefined ? input.dueDate : existing.dueDate;
      const nextTitle = input.title ?? existing.title;

      if (!nextCompleted && nextDueDate) {
        reminderId = await scheduleTaskReminder(id, nextTitle, nextDueDate);
      }
    }

    await db
      .update(tasks)
      .set({
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        reminderId,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));
  },

  async toggleCompleted(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;
    await this.update(id, { completed: !existing.completed });
  },

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (existing?.reminderId) {
      await cancelTaskReminder(existing.reminderId);
    }
    await db.delete(tasks).where(eq(tasks.id, id));
  },

  async addSubtask(taskId: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;

    const existing = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId));

    await db.insert(subtasks).values({
      id: createId('sub'),
      taskId,
      title: trimmed,
      completed: false,
      position: existing.length,
    });
  },

  async toggleSubtask(subtaskId: string, completed: boolean): Promise<void> {
    await db
      .update(subtasks)
      .set({ completed })
      .where(eq(subtasks.id, subtaskId));
  },

  async removeSubtask(subtaskId: string): Promise<void> {
    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
  },
};
