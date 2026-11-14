import { count } from 'drizzle-orm';
import { db } from './client';
import { categories, tasks, subtasks } from './schema';
import { createId } from '../utils/id';

export async function seedInitialDataIfEmpty(): Promise<void> {
  const existing = await db.select({ value: count() }).from(categories);
  if ((existing[0]?.value ?? 0) > 0) return;

  const now = new Date();
  const workId = createId('cat');
  const personalId = createId('cat');
  const shoppingId = createId('cat');

  await db.insert(categories).values([
    {
      id: workId,
      name: 'Work',
      color: '#2563EB',
      icon: 'briefcase-outline',
      createdAt: now,
    },
    {
      id: personalId,
      name: 'Personal',
      color: '#10B981',
      icon: 'person-outline',
      createdAt: now,
    },
    {
      id: shoppingId,
      name: 'Errands',
      color: '#F59E0B',
      icon: 'cart-outline',
      createdAt: now,
    },
  ]);

  const onboardingTaskId = createId('tsk');

  await db.insert(tasks).values([
    {
      id: onboardingTaskId,
      title: 'Welcome to TaskFlow — Tap to view details & subtasks',
      notes: 'Swipe right on any task to toggle completion, or tap + below to capture a new task.',
      completed: false,
      priority: 'high',
      dueDate: new Date(now.getTime() + 3600 * 1000 * 4),
      categoryId: personalId,
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId('tsk'),
      title: 'Review Q4 sprint deliverables',
      notes: 'Finalize mobile release checklist and QA sign-off.',
      completed: false,
      priority: 'medium',
      dueDate: new Date(now.getTime() + 86400 * 1000),
      categoryId: workId,
      position: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.insert(subtasks).values([
    {
      id: createId('sub'),
      taskId: onboardingTaskId,
      title: 'Try filtering tasks by Today, Upcoming, or Priority',
      completed: true,
      position: 0,
    },
    {
      id: createId('sub'),
      taskId: onboardingTaskId,
      title: 'Create your first custom task with a due date',
      completed: false,
      position: 1,
    },
  ]);
}
