import { create } from 'zustand';
import type { TaskFilter } from '../types/task.types';
import type { TaskPriority } from '@/shared/db/schema';

interface TaskUIState {
  filter: TaskFilter;
  selectedCategoryId: string | null;
  priorityFilter: TaskPriority | 'all';
  searchQuery: string;
  isCreateModalOpen: boolean;

  setFilter: (filter: TaskFilter) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  setSearchQuery: (query: string) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  resetFilters: () => void;
}

export const useTaskUIStore = create<TaskUIState>((set) => ({
  filter: 'all',
  selectedCategoryId: null,
  priorityFilter: 'all',
  searchQuery: '',
  isCreateModalOpen: false,

  setFilter: (filter) => set({ filter }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  resetFilters: () =>
    set({
      filter: 'all',
      selectedCategoryId: null,
      priorityFilter: 'all',
      searchQuery: '',
    }),
}));
