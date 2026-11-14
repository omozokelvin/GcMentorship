import { ipcMain } from 'electron'
import { z } from 'zod'
import {
  CreateTaskInputSchema,
  IPC_CHANNELS,
  TaskFilterSchema,
  UpdateTaskInputSchema
} from '@shared/ipc-contract'
import { TaskRepository } from '../db/task-repo'

export function registerTaskHandlers(repo: TaskRepository): void {
  ipcMain.handle(IPC_CHANNELS.TASKS_LIST, (_event, rawFilter: unknown) => {
    const filter = TaskFilterSchema.parse(rawFilter ?? {})
    return repo.list(filter)
  })

  ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, (_event, rawInput: unknown) => {
    const input = CreateTaskInputSchema.parse(rawInput)
    return repo.create(input)
  })

  ipcMain.handle(IPC_CHANNELS.TASKS_UPDATE, (_event, rawInput: unknown) => {
    const input = UpdateTaskInputSchema.parse(rawInput)
    return repo.update(input)
  })

  ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, (_event, rawId: unknown) => {
    const id = z.string().uuid().parse(rawId)
    return repo.delete(id)
  })
}
