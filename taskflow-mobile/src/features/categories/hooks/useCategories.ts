import { useEffect, useState, useCallback } from 'react';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { categoryRepository } from '../repository/categoryRepository';
import type { Category } from '@/shared/db/schema';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const refresh = useCallback(async () => {
    const data = await categoryRepository.getAll();
    setCategories(data);
  }, []);

  useEffect(() => {
    refresh();
    const sub = addDatabaseChangeListener(() => {
      refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { categories, refresh };
}
