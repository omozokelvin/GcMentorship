import { randomUUID } from 'crypto'
import type Database from 'better-sqlite3'
import type { CreateTaskInput, Task, TaskFilter, UpdateTaskInput } from '@shared/ipc-contract'

interface TaskRow {
  id: string
  title: string
  description: string
  completed: number
  priority: 'low' | 'medium' | 'high'
  project: string
  tags: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export class TaskRepository {
  constructor(private readonly db: Database.Database) {}

  private mapRow(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: Boolean(row.completed),
      priority: row.priority,
      project: row.project,
      tags: JSON.parse(row.tags || '[]'),
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  list(filter: TaskFilter): Task[] {
    const conditions: string[] = []
    const params: Record<string, unknown> = {}

    if (filter.status === 'active') {
      conditions.push('completed = 0')
    } else if (filter.status === 'completed') {
      conditions.push('completed = 1')
    }

    if (filter.priority !== 'all') {
      conditions.push('priority = @priority')
      params.priority = filter.priority
    }

    if (filter.project && filter.project !== 'All') {
      conditions.push('project = @project')
      params.project = filter.project
    }

    if (filter.search && filter.search.trim().length > 0) {
      conditions.push('(title LIKE @search OR description LIKE @search OR tags LIKE @search)')
      params.search = `%${filter.search.trim()}%`
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY
        completed ASC,
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at DESC
    `

    const rows = this.db.prepare(sql).all(params) as TaskRow[]
    return rows.map((r) => this.mapRow(r))
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString()
    const id = randomUUID()

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, completed, priority, project, tags, due_date, created_at, updated_at)
      VALUES (@id, @title, @description, 0, @priority, @project, @tags, @due_date, @created_at, @updated_at)
    `)

    stmt.run({
      id,
      title: input.title,
      description: input.description,
      priority: input.priority,
      project: input.project,
      tags: JSON.stringify(input.tags),
      due_date: input.dueDate,
      created_at: now,
      updated_at: now
    })

    return this.getById(id)!
  }

  update(input: UpdateTaskInput): Task {
    const existing = this.getById(input.id)
    if (!existing) throw new Error(`Task not found: ${input.id}`)

    const updated: Task = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      completed: input.completed ?? existing.completed,
      priority: input.priority ?? existing.priority,
      project: input.project ?? existing.project,
      tags: input.tags ?? existing.tags,
      dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
      updatedAt: new Date().toISOString()
    }

    this.db
      .prepare(`
        UPDATE tasks
        SET title = @title,
            description = @description,
            completed = @completed,
            priority = @priority,
            project = @project,
            tags = @tags,
            due_date = @dueDate,
            updated_at = @updatedAt
        WHERE id = @id
      `)
      .run({
        ...updated,
        completed: updated.completed ? 1 : 0,
        tags: JSON.stringify(updated.tags)
      })

    return updated
  }

  delete(id: string): boolean {
    const info = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    return info.changes > 0
  }

  private getById(id: string): Task | null {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined
    return row ? this.mapRow(row) : null
  }
}
