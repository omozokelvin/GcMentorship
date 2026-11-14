import { useEffect, useState, useCallback, useMemo } from 'react';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { taskRepository } from '../repository/taskRepository';
import { useTaskUIStore } from '../store/useTaskUIStore';
import { isToday } from '@/shared/utils/date';
import type { TaskWithRelations } from '../types/task.types';

export function useTasks() {
  const [rawTasks, setRawTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = useTaskUIStore((s) => s.filter);
  const selectedCategoryId = useTaskUIStore((s) => s.selectedCategoryId);
  const priorityFilter = useTaskUIStore((s) => s.priorityFilter);
  const searchQuery = useTaskUIStore((s) => s.searchQuery);

  const refresh = useCallback(async () => {
    const data = await taskRepository.getAllWithRelations();
    setRawTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const subscription = addDatabaseChangeListener(() => {
      refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return rawTasks.filter((task) => {
      if (filter === 'today') {
        if (task.completed || !isToday(task.dueDate)) return false;
      } else if (filter === 'upcoming') {
        if (task.completed || !task.dueDate || task.dueDate.getTime() < Date.now()) {
          return false;
        }
      } else if (filter === 'completed') {
        if (!task.completed) return false;
      }

      if (selectedCategoryId && task.categoryId !== selectedCategoryId) {
        return false;
      }

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      if (normalizedQuery) {
        const matchTitle = task.title.toLowerCase().includes(normalizedQuery);
        const matchNotes = task.notes?.toLowerCase().includes(normalizedQuery) ?? false;
        if (!matchTitle && !matchNotes) return false;
      }

      return true;
    });
  }, [rawTasks, filter, selectedCategoryId, priorityFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = rawTasks.length;
    const completed = rawTasks.filter((t) => t.completed).length;
    const today = rawTasks.filter((t) => !t.completed && isToday(t.dueDate)).length;
    return { total, completed, pending: total - completed, today };
  }, [rawTasks]);

  return {
    tasks: filteredTasks,
    allTasks: rawTasks,
    stats,
    loading,
    refresh,
  };
}
