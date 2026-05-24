const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  chooseDir:       ()                      => ipcRenderer.invoke('choose-dir'),
  convertIfNeeded: (srcPath)               => ipcRenderer.invoke('convert-if-needed', srcPath),
  saveFile:        (filePath, arrayBuffer) => ipcRenderer.invoke('save-file', filePath, arrayBuffer),
  readFile:        (filePath)              => ipcRenderer.invoke('read-file', filePath),
  pathJoin:        (...parts)              => ipcRenderer.invoke('path-join', ...parts),
  ensureDir:       (dirPath)               => ipcRenderer.invoke('ensure-dir', dirPath),
});
