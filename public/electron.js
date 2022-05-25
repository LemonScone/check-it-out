const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const activeWin = require('active-win');
const { storeAppIcon } = require('./utils/icon');
const { trackWindowStore } = require('./store/TrackWindowStore.js');

app.whenReady().then(() => {
  let win = new BrowserWindow({
    show: false,
    width: 960,
    height: 540,
    webPreferences: {
      enableRemoteModule: true,
      preload: `${__dirname}/preload.js`,
    },
  });
  if (process.env.mode === 'dev') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
    win.loadFile(`${path.join(__dirname, '../build/index.html')}`);
  }

  ipcMain.on('SELECTEDDAY_WINDOW', (event, payload) => {
    trackWindowStore.setSelectedDay(payload);

    const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
    event.reply('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
  });

  ipcMain.on('ACTIVE_WINDOW', async (event) => {
    const window = await activeWin({ screenRecordingPermission: true });
    const {
      id,
      title,
      url,
      owner: { name, processId, path },
    } = window;

    const newActiveWin = {
      id,
      title,
      processId,
      name,
      url: url,
      startDate: new Date(),
    };

    storeAppIcon(name, path); // 앱 아이콘 저장

    trackWindowStore.getStore();

    if (trackWindowStore.isNewTrackWindow(newActiveWin)) {
      if (trackWindowStore.hasCurrentWindow()) {
        trackWindowStore.setCurrentActiveWinFinishedDate(newActiveWin.startDate);
      }
      trackWindowStore.setNewTrackWindow(newActiveWin);
    }

    if (trackWindowStore.isSelectedDayToday()) {
      const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
      event.reply('REPLY_ACTIVE_WINDOW', { newActiveWin, allDayTrackWindows });
    }
  });

  ipcMain.on('STOP_ACTIVE_WINDOW', async (event) => {
    trackWindowStore.endTrackingWindow();

    const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
    event.reply('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
  });

  win.webContents.on('did-finish-load', () => {
    const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
    win.webContents.send('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
  });

  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {
    win = null;
  });

  //react developer tools extension 추가
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  trackWindowStore.endTrackingWindow();
});
