import { contextBridge, ipcRenderer } from 'electron'
import type {
  CreateTaskInput,
  ElectronTodoAPI,
  TaskFilter,
  UpdateTaskInput
} from '@shared/ipc-contract'

const api: ElectronTodoAPI = {
  listTasks: (filter?: Partial<TaskFilter>) => ipcRenderer.invoke('tasks:list', filter),
  createTask: (input: CreateTaskInput) => ipcRenderer.invoke('tasks:create', input),
  updateTask: (input: UpdateTaskInput) => ipcRenderer.invoke('tasks:update', input),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),
  onFocusQuickAdd: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('ui:focus-quick-add', listener)
    return () => ipcRenderer.removeListener('ui:focus-quick-add', listener)
  }
}

contextBridge.exposeInMainWorld('todoAPI', api)