import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import type { CreateTaskInput, Task, TaskFilter, UpdateTaskInput } from '@shared/ipc-contract'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'

export function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    status: 'all',
    priority: 'all',
    project: 'All'
  })

  const quickAddRef = useRef<HTMLInputElement | null>(null)

  const refreshTasks = useCallback(async () => {
    const data = await window.todoAPI.listTasks(filter)
    setTasks(data)
  }, [filter])

  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  useEffect(() => {
    return window.todoAPI.onFocusQuickAdd(() => {
      quickAddRef.current?.focus()
    })
  }, [])

  const projects = useMemo(() => {
    const set = new Set<string>(['All', 'Inbox'])
    tasks.forEach((t) => set.add(t.project))
    return Array.from(set)
  }, [tasks])

  const handleCreate = async (input: CreateTaskInput) => {
    await window.todoAPI.createTask(input)
    await refreshTasks()
  }

  const handleUpdate = async (input: UpdateTaskInput) => {
    await window.todoAPI.updateTask(input)
    await refreshTasks()
  }

  const handleDelete = async (id: string) => {
    await window.todoAPI.deleteTask(id)
    await refreshTasks()
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top Drag Region */}
      <header className="drag-region flex h-11 items-center justify-between border-b border-zinc-800/80 px-4 pl-20">
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          TaskFlow
        </span>
        <div className="no-drag relative w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={filter.search ?? ''}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search tasks or tags..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1 pl-8 pr-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 border-r border-zinc-800/80 bg-zinc-950 p-3 space-y-6">
          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </p>
            {(['all', 'active', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter((f) => ({ ...f, status }))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs capitalize transition ${
                  filter.status === status
                    ? 'bg-indigo-600/20 font-medium text-indigo-300'
                    : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Projects
            </p>
            {projects.map((proj) => (
              <button
                key={proj}
                onClick={() => setFilter((f) => ({ ...f, project: proj }))}
                className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  filter.project === proj
                    ? 'bg-zinc-800 font-medium text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                {proj}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-5">
            <TaskForm inputRef={quickAddRef} onCreate={handleCreate} />

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{tasks.length} task(s)</span>
              <select
                value={filter.priority}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    priority: e.target.value as TaskFilter['priority']
                  }))
                }
                className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-300"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-xs text-zinc-500">
                  No tasks match your current filters.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
