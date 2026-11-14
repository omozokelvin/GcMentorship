import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { categoryRepository } from '@/features/categories/repository/categoryRepository';

const SWATCHES = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function CategoriesScreen() {
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SWATCHES[0]!);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await categoryRepository.create(name, selectedColor);
    setName('');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <View className="flex-1 px-5 pt-3">
        <Text className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
          Categories
        </Text>

        <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-5">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="New category name..."
            placeholderTextColor="#94A3B8"
            className="text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-3 mb-3"
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2.5">
              {SWATCHES.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full items-center justify-center ${
                    selectedColor === color ? 'border-2 border-slate-900 dark:border-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>

            <Pressable
              onPress={handleCreate}
              disabled={!name.trim()}
              className={`px-4 py-2 rounded-xl ${
                name.trim() ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <Text className="text-xs font-bold text-white">Add</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl mb-2.5 border border-slate-200 dark:border-slate-800">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-base font-semibold text-slate-900 dark:text-white">
                  {item.name}
                </Text>
              </View>

              <Pressable
                onPress={() => categoryRepository.remove(item.id)}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={18} color="#94A3B8" />
              </Pressable>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
