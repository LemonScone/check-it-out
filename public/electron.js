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

    const activeWindows = trackWindowStore.findTrackWindowBySelectedDay();
    event.reply('REPLY_ACTIVE_WINDOW', { activeWindows });
  });

  ipcMain.on('ACTIVE_WINDOW', async (event) => {
    const window = await activeWin({ screenRecordingPermission: true });
    const {
      id,
      title,
      url,
      owner: { name, processId, path },
    } = window;

    const processedWindow = {
      id,
      title,
      processId,
      name,
      url: url,
      startDate: new Date(),
    };

    storeAppIcon(name, path); // 앱 아이콘 저장

    trackWindowStore.getStore();

    if (trackWindowStore.isNewTrackWindow(processedWindow)) {
      if (trackWindowStore.hasCurrentWindow()) {
        trackWindowStore.setCurrentActiveWinFinishedDate(processedWindow.startDate);
      }
      trackWindowStore.setNewTrackWindow(processedWindow);
    }

    if (trackWindowStore.isSelectedDayToday()) {
      const activeWindows = trackWindowStore.findTrackWindowBySelectedDay();
      event.reply('REPLY_ACTIVE_WINDOW', { processedWindow, activeWindows });
    }
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
