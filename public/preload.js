const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  sendIpc: (key, ...args) => {
    //* main process 호출
    ipcRenderer.send(key, ...args);
  },
  onIpc: (key, fn) => {
    //* main process의 회신 처리
    ipcRenderer.on(key, fn);
  },
  removeIpc: (key) => {
    ipcRenderer.removeAllListeners(key);
  },
});
