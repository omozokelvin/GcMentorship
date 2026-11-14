import { asc, eq } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { categories, type Category } from '@/shared/db/schema';
import { createId } from '@/shared/utils/id';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.createdAt));
  },

  async create(name: string, color: string, icon = 'folder-outline'): Promise<Category> {
    const newCategory: Category = {
      id: createId('cat'),
      name: name.trim(),
      color,
      icon,
      createdAt: new Date(),
    };
    await db.insert(categories).values(newCategory);
    return newCategory;
  },

  async remove(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  },
};
