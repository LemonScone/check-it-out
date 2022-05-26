const { BrowserWindow } = require('electron');
const { join } = require('path');
const path = require('path');
const { trackWindowStore } = require('../store/TrackWindowStore');

class WindowManager {
  window;

  createWindow = () => {
    this.window = new BrowserWindow({
      show: false,
      width: 960,
      height: 540,
      webPreferences: {
        enableRemoteModule: true,
        preload: join(__dirname, '../preload.js'),
      },
    });
    if (process.env.mode === 'dev') {
      this.window.loadURL('http://localhost:3000');
      this.window.webContents.openDevTools();
    } else {
      // this.mainWindowloadURL(`file://${path.join(__dirname, '../build/index.html')}`)
      this.window.loadFile(`${path.join(__dirname, '../build/index.html')}`);
    }

    this.window.once('ready-to-show', () => this.window.show());
    this.window.on('closed', () => {
      this.window = null;
    });

    this.window.webContents.on('did-finish-load', () => {
      const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
      this.window.webContents.send('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
    });
  };
}

module.exports.windowManager = new WindowManager();
