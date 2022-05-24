const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const { format, intervalToDuration, formatDuration } = require('date-fns');
const formatDistanceStrict = require('date-fns/formatDistanceStrict');
const Store = require('electron-store');
const activeWin = require('active-win');
const { storeAppIcon } = require('./utils/icon');

const store = new Store();

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

  ipcMain.on('ACTIVE_WINDOW', async (event, payload) => {
    let window = await activeWin({ screenRecordingPermission: true });

    //* store에는 "trackWindows"와 "currentActiveWin"이 저장되어 있음
    const trackWindows = store.get('trackWindows') || [];
    const currentActiveWin = store.get('currentActiveWin') || null;

    const {
      id,
      title,
      url,
      owner: { name, processId, path },
    } = window;

    storeAppIcon(name, path); // 앱 아이콘 저장

    //* 데이터 가공
    const processedWindow = {
      id,
      title,
      processId,
      name,
      url: url,
      startDate: new Date(),
    };

    //* 첫 할당이거나 활성 프로그램이 변했으면 재할당
    if (!currentActiveWin || currentActiveWin.id !== processedWindow.id) {
      //* 활성 프로그램이 바꼈으면 이전 프로그램 정보에 finishedDate 정보 추가해서 store에 저장
      if (currentActiveWin) {
        //* 날짜 객체 생성해서 차이 구하기
        const { startDate } = currentActiveWin;
        const { startDate: finishedDate } = processedWindow;
        const distance = getDistanceDate(startDate, finishedDate);

        //* 이전의 active-win 객체에 finishedDate와 distance 정보 업데이트
        trackWindows.forEach((w) => {
          if (w.id === currentActiveWin.id && w.startDate === currentActiveWin.startDate) {
            [w.finishedDate, w.distance] = [finishedDate, distance];
          }
        });
      }
      trackWindows.push(processedWindow);
      store.set('trackWindows', trackWindows);
      store.set('currentActiveWin', processedWindow);
    }

    const activeWindows = findTrackWindowByDate(new Date());

    event.reply('REPLY_ACTIVE_WINDOW', { processedWindow, activeWindows });
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

const findTrackWindowByDate = (comparedDate) => {
  comparedDate = typeof date === 'string' ? new Date(comparedDate) : comparedDate;
  const filtered = store
    .get('trackWindows')
    .filter(
      (w) => format(new Date(w.startDate), 'yyyy-MM-dd') === format(comparedDate, 'yyyy-MM-dd'),
    );

  filtered.forEach(
    (w) =>
      ([w.startDate, w.finishedDate] = [
        new Date(w.startDate),
        w.finishedDate ? new Date(w.finishedDate) : null,
      ]),
  );

  return filtered;
};

const getDistanceDate = (baseDate, comparedDate) => {
  const formatDistanceLocale = {
    xSeconds: (count) => `${count}sec`,
    xMinutes: (count) => `${count}min`,
    xHours: (count) => `${count}hour`,
  };

  const shortLocale = {
    formatDistance: (token, count) => formatDistanceLocale[token](count),
  };

  const seconds = parseInt(
    formatDistanceStrict(new Date(baseDate), new Date(comparedDate), {
      unit: 'second',
    }),
  );
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const distance = formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    locale: shortLocale,
  });

  return distance;
};
