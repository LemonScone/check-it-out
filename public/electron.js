const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const formatDistanceStrict = require('date-fns/formatDistanceStrict');
//require('devtron').install();

const activeWindows = [];
let currentActiveWin;

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
    const activeWin = require('active-win');
    let window = await activeWin({ screenRecordingPermission: true });

    //* 데이터 가공
    const processedWindow = {
      id: window.id,
      title: window.title,
      processId: window.owner.processId,
      name: window.owner.name,
      url: window.url,
      startDate: new Date(),
    };

    //* 첫 할당이거나 활성 프로그램이 변했으면 재할당
    //TODO 아무 프로그램도 활성화되어 있지 않을 때 (=바탕화면에 포커스가 잡혀있는 경우)
    if (!currentActiveWin || currentActiveWin.id !== processedWindow.id) {
      //* 날짜 객체 생성해서 차이 구하기
      const startedDate = currentActiveWin ? currentActiveWin.startDate : processedWindow.startDate;
      const finishedDate = processedWindow.startDate;

      const distance = formatDistanceStrict(startedDate, finishedDate, {
        unit: 'second',
      });

      if (currentActiveWin) {
        [currentActiveWin.finishedDate, currentActiveWin.distance] = [finishedDate, distance];
      }

      currentActiveWin = processedWindow;
      activeWindows.push(processedWindow);
    }

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
