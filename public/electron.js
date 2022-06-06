const { app } = require('electron');
const { trackWindowStore } = require('./store/TrackWindowStore');
const { windowManager } = require('./utils/window-manager');
const { ipcManager } = require('./utils/ipc-manager');

app.whenReady().then(async () => {
  windowManager.createWindow();
  ipcManager.init();

  if (process.env.mode === 'dev') {
    const { extensionsManager } = require('./utils/extensions-manager');
    await extensionsManager.init();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  trackWindowStore.endTrackingWindow();
});
