"use strict";
const electron = require("electron");
const api = {
  listTasks: (filter) => electron.ipcRenderer.invoke("tasks:list", filter),
  createTask: (input) => electron.ipcRenderer.invoke("tasks:create", input),
  updateTask: (input) => electron.ipcRenderer.invoke("tasks:update", input),
  deleteTask: (id) => electron.ipcRenderer.invoke("tasks:delete", id),
  onFocusQuickAdd: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("ui:focus-quick-add", listener);
    return () => electron.ipcRenderer.removeListener("ui:focus-quick-add", listener);
  }
};
electron.contextBridge.exposeInMainWorld("todoAPI", api);
