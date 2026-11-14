import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { taskRepository } from '@/features/tasks/repository/taskRepository';
import type { TaskWithRelations } from '@/features/tasks/types/task.types';
import type { TaskPriority } from '@/shared/db/schema';
import { PriorityBadge } from '@/features/tasks/components/PriorityBadge';
import { formatDueDate } from '@/shared/utils/date';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(async () => {
    if (!id) return;
    const data = await taskRepository.getById(id);
    if (data) {
      setTask(data);
      setTitle(data.title);
      setNotes(data.notes ?? '');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Text className="text-slate-500">Task not found.</Text>
      </View>
    );
  }

  const handleSaveText = async () => {
    if (!title.trim()) return;
    await taskRepository.update(task.id, { title, notes });
    await loadTask();
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await taskRepository.update(task.id, { priority });
    await loadTask();
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    await taskRepository.addSubtask(task.id, newSubtask);
    setNewSubtask('');
    await loadTask();
  };

  const handleDelete = async () => {
    await taskRepository.remove(task.id);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950 px-5 pt-4">
      <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-4">
        <TextInput
          value={title}
          onChangeText={setTitle}
          onBlur={handleSaveText}
          className="text-lg font-bold text-slate-900 dark:text-white mb-2"
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          onBlur={handleSaveText}
          placeholder="Add notes..."
          placeholderTextColor="#94A3B8"
          multiline
          className="text-sm text-slate-600 dark:text-slate-300 min-h-[60px]"
        />

        <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <Text className="text-xs text-slate-500">
              Due: {formatDueDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>

      {/* Priority Selector */}
      <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        Priority
      </Text>
      <View className="flex-row gap-2 mb-5">
        {PRIORITIES.map((p) => (
          <Pressable
            key={p}
            onPress={() => handlePriorityChange(p)}
            className={`flex-1 py-2.5 rounded-xl items-center border ${
              task.priority === p
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                task.priority === p
                  ? 'text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Subtasks */}
      <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        Checklist ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
      </Text>
      <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-5">
        <View className="flex-row gap-2 mb-3">
          <TextInput
            value={newSubtask}
            onChangeText={setNewSubtask}
            onSubmitEditing={handleAddSubtask}
            placeholder="Add checklist item..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2"
          />
          <Pressable
            onPress={handleAddSubtask}
            className="bg-blue-600 px-3.5 rounded-xl items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {task.subtasks.map((sub) => (
          <View
            key={sub.id}
            className="flex-row items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
          >
            <Pressable
              onPress={async () => {
                await taskRepository.toggleSubtask(sub.id, !sub.completed);
                await loadTask();
              }}
              className="flex-row items-center gap-2.5 flex-1"
            >
              <Ionicons
                name={sub.completed ? 'checkbox' : 'square-outline'}
                size={20}
                color={sub.completed ? '#2563EB' : '#94A3B8'}
              />
              <Text
                className={`text-sm flex-1 ${
                  sub.completed
                    ? 'line-through text-slate-400'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {sub.title}
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                await taskRepository.removeSubtask(sub.id);
                await loadTask();
              }}
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        onPress={handleDelete}
        className="py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 items-center mb-10"
      >
        <Text className="text-sm font-bold text-red-600 dark:text-red-400">
          Delete Task
        </Text>
      </Pressable>
    </ScrollView>
  );
}
