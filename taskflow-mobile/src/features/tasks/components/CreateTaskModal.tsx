import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskUIStore } from '../store/useTaskUIStore';
import { taskRepository } from '../repository/taskRepository';
import type { Category, TaskPriority } from '@/shared/db/schema';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

const QUICK_DUE_OPTIONS = [
  { label: 'No Date', getDate: () => null },
  {
    label: 'In 2 Hours',
    getDate: () => new Date(Date.now() + 2 * 3600 * 1000),
  },
  {
    label: 'Tomorrow 9 AM',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: 'Next Week',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

export function CreateTaskModal({ categories }: { categories: Category[] }) {
  const isOpen = useTaskUIStore((s) => s.isCreateModalOpen);
  const close = useTaskUIStore((s) => s.closeCreateModal);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dueOptionIndex, setDueOptionIndex] = useState(0);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtaskList, setSubtaskList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setPriority('medium');
    setCategoryId(null);
    setDueOptionIndex(0);
    setSubtaskDraft('');
    setSubtaskList([]);
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    setSubtaskList((prev) => [...prev, trimmed]);
    setSubtaskDraft('');
  };

  const handleCreate = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const dueDate = QUICK_DUE_OPTIONS[dueOptionIndex]?.getDate() ?? null;
      await taskRepository.create({
        title,
        notes,
        priority,
        categoryId,
        dueDate,
        subtasks: subtaskList,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[88%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              New Task
            </Text>
            <Pressable onPress={close} hitSlop={10}>
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#94A3B8"
              autoFocus
              className="text-base font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3.5 mb-3"
            />

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes or context (optional)"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              className="text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 mb-4"
            />

            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Priority
            </Text>
            <View className="flex-row gap-2 mb-4">
              {PRIORITIES.map((p) => {
                const selected = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      selected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${
                        selected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Due & Reminder
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 mb-4"
            >
              {QUICK_DUE_OPTIONS.map((opt, index) => {
                const selected = dueOptionIndex === index;
                return (
                  <Pressable
                    key={opt.label}
                    onPress={() => setDueOptionIndex(index)}
                    className={`px-3.5 py-2 rounded-xl border ${
                      selected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 mb-4"
            >
              {categories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(selected ? null : cat.id)}
                    className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
                      selected
                        ? 'bg-slate-900 dark:bg-slate-100 border-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                    }`}
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        selected
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

            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Subtasks
            </Text>
            <View className="flex-row gap-2 mb-2">
              <TextInput
                value={subtaskDraft}
                onChangeText={setSubtaskDraft}
                onSubmitEditing={handleAddSubtask}
                placeholder="Add step..."
                placeholderTextColor="#94A3B8"
                className="flex-1 text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2.5"
              />
              <Pressable
                onPress={handleAddSubtask}
                className="bg-slate-200 dark:bg-slate-700 px-4 rounded-xl items-center justify-center"
              >
                <Ionicons name="add" size={20} color="#2563EB" />
              </Pressable>
            </View>

            {subtaskList.map((item, idx) => (
              <View
                key={`${item}-${idx}`}
                className="flex-row items-center justify-between py-1.5 px-2"
              >
                <Text className="text-sm text-slate-700 dark:text-slate-300">
                  • {item}
                </Text>
                <Pressable
                  onPress={() =>
                    setSubtaskList((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={handleCreate}
              disabled={!title.trim() || saving}
              className={`mt-5 py-4 rounded-2xl items-center ${
                title.trim() ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <Text className="text-base font-bold text-white">
                {saving ? 'Saving...' : 'Create Task'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
