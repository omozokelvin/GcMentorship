/// <reference types="vite/client" />
import type { ElectronTodoAPI } from '@shared/ipc-contract'

declare global {
  interface Window {
    todoAPI: ElectronTodoAPI
  }
}
