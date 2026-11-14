import React from 'react';
import { View, Text } from 'react-native';
import type { TaskPriority } from '@/shared/db/schema';

const PRIORITY_STYLES: Record<
  TaskPriority,
  { bg: string; text: string; label: string }
> = {
  high: {
    bg: 'bg-red-100 dark:bg-red-950/60',
    text: 'text-red-700 dark:text-red-300',
    label: 'High',
  },
  medium: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Medium',
  },
  low: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    label: 'Low',
  },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
}
