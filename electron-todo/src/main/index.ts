import { app, BrowserWindow, globalShortcut, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { IPC_CHANNELS } from '@shared/ipc-contract'
import { closeDatabase, getDatabase } from './db/database'
import { TaskRepository } from './db/task-repo'
import { registerTaskHandlers } from './ipc/task-handlers'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 980,
    height: 700,
    minWidth: 680,
    minHeight: 500,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // Hide to tray on close instead of terminating background shortcut listener
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win.hide()
    }
  })

  // Block external navigation
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function triggerQuickAdd(): void {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
  mainWindow.webContents.send(IPC_CHANNELS.UI_FOCUS_QUICK_ADD)
}

function setupTray(): void {
  // 16x16 empty fallback icon; replace with assets/tray.png in production
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('TaskFlow')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quick Add Task', click: triggerQuickAdd },
    { label: 'Open TaskFlow', click: () => mainWindow?.show() },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    const db = getDatabase()
    const repo = new TaskRepository(db)
    registerTaskHandlers(repo)

    mainWindow = createWindow()
    setupTray()

    globalShortcut.register('CommandOrControl+Shift+Space', triggerQuickAdd)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow()
      } else {
        mainWindow?.show()
      }
    })
  })
}

app.on('before-quit', () => {
  isQuitting = true
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  closeDatabase()
})
