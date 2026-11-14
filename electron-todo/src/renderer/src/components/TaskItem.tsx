import React from 'react'
import { Calendar, CheckCircle2, Circle, Folder, Tag, Trash2 } from 'lucide-react'
import type { Task, UpdateTaskInput } from '@shared/ipc-contract'

interface TaskItemProps {
  task: Task
  onUpdate: (input: UpdateTaskInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  return (
    <div
      className={`group flex items-start justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 transition hover:border-zinc-700 ${
        task.completed ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onUpdate({ id: task.id, completed: !task.completed })}
          className="mt-0.5 text-zinc-400 hover:text-indigo-400"
          aria-label="Toggle completion"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium ${
                task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </span>

            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                PRIORITY_STYLES[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="whitespace-pre-wrap text-xs text-zinc-400">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {task.project}
            </span>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Calendar className="h-3 w-3" />
                {task.dueDate}
              </span>
            )}

            {task.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded bg-zinc-800/80 px-1.5 py-0.5 text-zinc-300"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
