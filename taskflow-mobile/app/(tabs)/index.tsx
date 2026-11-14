import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTaskUIStore } from '@/features/tasks/store/useTaskUIStore';
import { taskRepository } from '@/features/tasks/repository/taskRepository';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { FilterBar } from '@/features/tasks/components/FilterBar';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';

export default function TasksScreen() {
  const { tasks, stats, loading } = useTasks();
  const { categories } = useCategories();
  const searchQuery = useTaskUIStore((s) => s.searchQuery);
  const setSearchQuery = useTaskUIStore((s) => s.setSearchQuery);
  const openCreateModal = useTaskUIStore((s) => s.openCreateModal);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
              TaskFlow
            </Text>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {stats.pending} pending • {stats.today} due today
            </Text>
          </View>
          <View className="bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {stats.completed}/{stats.total} Done
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 mb-3">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2.5 text-sm text-slate-900 dark:text-white"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* Filter Chips */}
        <FilterBar categories={categories} />

        {/* Task List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onToggle={(id) => taskRepository.toggleCompleted(id)}
                onDelete={(id) => taskRepository.remove(id)}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#CBD5E1" />
                <Text className="text-base font-semibold text-slate-600 dark:text-slate-400 mt-3">
                  No tasks match this view
                </Text>
                <Text className="text-xs text-slate-400 mt-1">
                  Tap + below to capture a new task
                </Text>
              </View>
            }
          />
        )}

        {/* Floating Action Button */}
        <Pressable
          onPress={openCreateModal}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg active:bg-blue-700"
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <CreateTaskModal categories={categories} />
    </SafeAreaView>
  );
}
