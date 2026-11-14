import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const sqliteDb = openDatabaseSync('taskflow.db', {
  enableChangeListener: true,
});

// Enable foreign key constraints for cascading subtask deletes
sqliteDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqliteDb, { schema });
