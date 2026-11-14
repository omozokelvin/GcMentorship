import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useTaskUIStore } from '../store/useTaskUIStore';
import type { TaskFilter } from '../types/task.types';
import type { Category } from '@/shared/db/schema';

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

export function FilterBar({ categories }: { categories: Category[] }) {
  const filter = useTaskUIStore((s) => s.filter);
  const selectedCategoryId = useTaskUIStore((s) => s.selectedCategoryId);
  const setFilter = useTaskUIStore((s) => s.setFilter);
  const setSelectedCategoryId = useTaskUIStore((s) => s.setSelectedCategoryId);

  return (
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 pb-2"
      >
        {FILTERS.map((item) => {
          const active = filter === item.key && !selectedCategoryId;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                setSelectedCategoryId(null);
                setFilter(item.key);
              }}
              className={`px-4 py-2 rounded-full border ${
                active
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {categories.map((cat) => {
          const active = selectedCategoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                setFilter('all');
                setSelectedCategoryId(active ? null : cat.id);
              }}
              className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${
                active
                  ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <Text
                className={`text-sm font-medium ${
                  active
                    ? 'text-white dark:text-slate-900'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
