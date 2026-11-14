import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = join(app.getPath('userData'), 'tasks.sqlite')
  const db = new Database(dbPath)

  // Performance & safety pragmas
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('foreign_keys = ON')
  db.pragma('cache_size = -8000') // Cap page cache at ~8MB to keep RAM well under 150MB

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      project TEXT NOT NULL DEFAULT 'Inbox',
      tags TEXT NOT NULL DEFAULT '[]',
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  `)

  dbInstance = db
  return db
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
