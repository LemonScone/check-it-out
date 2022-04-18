const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      enableRemoteModule: true,
      preload: `${__dirname}/preload.js`,
      // nodeIntegration: true,
      // contextIsolation: false,
    },
  });
  if (process.env.mode === 'dev') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
    win.loadFile(`${path.join(__dirname, '../build/index.html')}`);
  }

  ipcMain.on('ACTIVE_WINDOW', async (event, payload) => {
    const activeWindow = require('active-win');
    const active = await activeWindow({ screenRecordingPermission: true });
    console.log('ipcMain on : ', active);
    event.reply('REPLY_ACTIVE_WINDOW', active);
  });

  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {
    win = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
