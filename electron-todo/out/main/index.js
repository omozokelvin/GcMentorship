"use strict";
const electron = require("electron");
const path = require("path");
const zod = require("zod");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const PrioritySchema = zod.z.enum(["low", "medium", "high"]);
zod.z.object({
  id: zod.z.string().uuid(),
  title: zod.z.string().min(1).max(200),
  description: zod.z.string().max(5e3).default(""),
  completed: zod.z.boolean(),
  priority: PrioritySchema,
  project: zod.z.string().max(50).default("Inbox"),
  tags: zod.z.array(zod.z.string().max(30)),
  dueDate: zod.z.string().nullable(),
  // ISO date string YYYY-MM-DD
  createdAt: zod.z.string(),
  updatedAt: zod.z.string()
});
const CreateTaskInputSchema = zod.z.object({
  title: zod.z.string().trim().min(1, "Title is required").max(200),
  description: zod.z.string().max(5e3).optional().default(""),
  priority: PrioritySchema.optional().default("medium"),
  project: zod.z.string().trim().max(50).optional().default("Inbox"),
  tags: zod.z.array(zod.z.string().trim().min(1).max(30)).optional().default([]),
  dueDate: zod.z.string().nullable().optional().default(null)
});
const UpdateTaskInputSchema = zod.z.object({
  id: zod.z.string().uuid(),
  title: zod.z.string().trim().min(1).max(200).optional(),
  description: zod.z.string().max(5e3).optional(),
  completed: zod.z.boolean().optional(),
  priority: PrioritySchema.optional(),
  project: zod.z.string().trim().max(50).optional(),
  tags: zod.z.array(zod.z.string().trim().min(1).max(30)).optional(),
  dueDate: zod.z.string().nullable().optional()
});
const TaskFilterSchema = zod.z.object({
  search: zod.z.string().optional(),
  status: zod.z.enum(["all", "active", "completed"]).default("all"),
  priority: PrioritySchema.or(zod.z.literal("all")).default("all"),
  project: zod.z.string().optional()
});
const IPC_CHANNELS = {
  TASKS_LIST: "tasks:list",
  TASKS_CREATE: "tasks:create",
  TASKS_UPDATE: "tasks:update",
  TASKS_DELETE: "tasks:delete",
  UI_FOCUS_QUICK_ADD: "ui:focus-quick-add"
};
let dbInstance = null;
function getDatabase() {
  if (dbInstance) return dbInstance;
  const dbPath = path.join(electron.app.getPath("userData"), "tasks.sqlite");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("cache_size = -8000");
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
  `);
  dbInstance = db;
  return db;
}
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
class TaskRepository {
  constructor(db) {
    this.db = db;
  }
  db;
  mapRow(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: Boolean(row.completed),
      priority: row.priority,
      project: row.project,
      tags: JSON.parse(row.tags || "[]"),
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  list(filter) {
    const conditions = [];
    const params = {};
    if (filter.status === "active") {
      conditions.push("completed = 0");
    } else if (filter.status === "completed") {
      conditions.push("completed = 1");
    }
    if (filter.priority !== "all") {
      conditions.push("priority = @priority");
      params.priority = filter.priority;
    }
    if (filter.project && filter.project !== "All") {
      conditions.push("project = @project");
      params.project = filter.project;
    }
    if (filter.search && filter.search.trim().length > 0) {
      conditions.push("(title LIKE @search OR description LIKE @search OR tags LIKE @search)");
      params.search = `%${filter.search.trim()}%`;
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY
        completed ASC,
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at DESC
    `;
    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this.mapRow(r));
  }
  create(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, completed, priority, project, tags, due_date, created_at, updated_at)
      VALUES (@id, @title, @description, 0, @priority, @project, @tags, @due_date, @created_at, @updated_at)
    `);
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
    });
    return this.getById(id);
  }
  update(input) {
    const existing = this.getById(input.id);
    if (!existing) throw new Error(`Task not found: ${input.id}`);
    const updated = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      completed: input.completed ?? existing.completed,
      priority: input.priority ?? existing.priority,
      project: input.project ?? existing.project,
      tags: input.tags ?? existing.tags,
      dueDate: input.dueDate !== void 0 ? input.dueDate : existing.dueDate,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(`
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
      `).run({
      ...updated,
      completed: updated.completed ? 1 : 0,
      tags: JSON.stringify(updated.tags)
    });
    return updated;
  }
  delete(id) {
    const info = this.db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return info.changes > 0;
  }
  getById(id) {
    const row = this.db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    return row ? this.mapRow(row) : null;
  }
}
function registerTaskHandlers(repo) {
  electron.ipcMain.handle(IPC_CHANNELS.TASKS_LIST, (_event, rawFilter) => {
    const filter = TaskFilterSchema.parse(rawFilter ?? {});
    return repo.list(filter);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, (_event, rawInput) => {
    const input = CreateTaskInputSchema.parse(rawInput);
    return repo.create(input);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TASKS_UPDATE, (_event, rawInput) => {
    const input = UpdateTaskInputSchema.parse(rawInput);
    return repo.update(input);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, (_event, rawId) => {
    const id = zod.z.string().uuid().parse(rawId);
    return repo.delete(id);
  });
}
let mainWindow = null;
let tray = null;
let isQuitting = false;
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 980,
    height: 700,
    minWidth: 680,
    minHeight: 500,
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return win;
}
function triggerQuickAdd() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send(IPC_CHANNELS.UI_FOCUS_QUICK_ADD);
}
function setupTray() {
  const icon = electron.nativeImage.createEmpty();
  tray = new electron.Tray(icon);
  tray.setToolTip("TaskFlow");
  const contextMenu = electron.Menu.buildFromTemplate([
    { label: "Quick Add Task", click: triggerQuickAdd },
    { label: "Open TaskFlow", click: () => mainWindow?.show() },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => mainWindow?.show());
}
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  electron.app.whenReady().then(() => {
    const db = getDatabase();
    const repo = new TaskRepository(db);
    registerTaskHandlers(repo);
    mainWindow = createWindow();
    setupTray();
    electron.globalShortcut.register("CommandOrControl+Shift+Space", triggerQuickAdd);
    electron.app.on("activate", () => {
      if (electron.BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
      } else {
        mainWindow?.show();
      }
    });
  });
}
electron.app.on("before-quit", () => {
  isQuitting = true;
});
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
  closeDatabase();
});
