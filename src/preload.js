const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    send: (event, data) => ipcRenderer.send(event, data),
    on: (event, data) => ipcRenderer.on(event, data),
    requestSave: (callback) => ipcRenderer.on("request-save", (event, value) => callback(value)),
    openSettings: (callback) => ipcRenderer.on("open-settings", (event, value) => callback(value)),
    /*
    leftClickFileContextMenu: (event) => ipcRenderer.send(event),
    requestDelete: (callback) => ipcRenderer.on("request-delete", (event, value) => callback(value))
    */
})