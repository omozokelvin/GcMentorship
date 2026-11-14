import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { TaskWithRelations } from '../types/task.types';
import { PriorityBadge } from './PriorityBadge';
import { formatDueDate, isOverdue } from '@/shared/utils/date';

interface TaskCardProps {
  task: TaskWithRelations;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const router = useRouter();
  const overdue = isOverdue(task.dueDate, task.completed);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(task.id);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  };

  return (
    <Pressable
      onPress={() => router.push(`/task/${task.id}`)}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3 border border-slate-200/80 dark:border-slate-800 active:opacity-90"
    >
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={handleToggle}
          hitSlop={10}
          className={`w-6 h-6 mt-0.5 rounded-full border-2 items-center justify-center ${
            task.completed
              ? 'bg-blue-600 border-blue-600'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          {task.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </Pressable>

        <View className="flex-1">
          <Text
            numberOfLines={2}
            className={`text-base font-semibold leading-snug ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </Text>

          {task.notes ? (
            <Text
              numberOfLines={1}
              className="text-sm text-slate-500 dark:text-slate-400 mt-1"
            >
              {task.notes}
            </Text>
          ) : null}

          <View className="flex-row flex-wrap items-center gap-2 mt-3">
            <PriorityBadge priority={task.priority} />

            {task.category && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {task.category.name}
                </Text>
              </View>
            )}

            {task.dueDate && (
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={overdue ? '#EF4444' : '#64748B'}
                />
                <Text
                  className={`text-xs font-medium ${
                    overdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            )}

            {task.subtasks.length > 0 && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="git-branch-outline" size={13} color="#64748B" />
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {completedSubtasks}/{task.subtasks.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable onPress={handleDelete} hitSlop={10} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#94A3B8" />
        </Pressable>
      </View>
    </Pressable>
  );
}
