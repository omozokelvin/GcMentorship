import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CreateTaskInput, Priority } from '@shared/ipc-contract'

interface TaskFormProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  onCreate: (input: CreateTaskInput) => Promise<void>
}

export function TaskForm({ inputRef, onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [project, setProject] = useState('Inbox')
  const [tagsText, setTagsText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      project: project.trim() || 'Inbox',
      tags,
      dueDate: dueDate || null
    })

    setTitle('')
    setDescription('')
    setTagsText('')
    setDueDate('')
    setExpanded(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onFocus={() => setExpanded(true)}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task... (Cmd/Ctrl + Shift + Space anywhere)"
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2.5 border-t border-zinc-800/80 pt-3">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes or markdown details..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Project (e.g. Work)"
              className="w-28 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300"
            />

            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="flex-1 min-w-[140px] rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300"
            />
          </div>
        </div>
      )}
    </form>
  )
}
