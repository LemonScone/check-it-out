const { ipcMain } = require('electron');
const activeWin = require('active-win');
const { storeAppIcon } = require('./icon');
const { trackWindowStore } = require('../store/TrackWindowStore.js');

const activeWinActions = {
  SELECTEDDAY_WINDOW: (event, payload) => {
    trackWindowStore.setSelectedDay(payload);

    const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
    event.reply('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
  },
  ACTIVE_WINDOW: async (event) => {
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
  },
  STOP_ACTIVE_WINDOW: (event) => {
    trackWindowStore.endTrackingWindow();

    const allDayTrackWindows = trackWindowStore.findTrackWindowBySelectedDay();
    event.reply('REPLY_ACTIVE_WINDOW', { allDayTrackWindows });
  },
};

class IPCManager {
  init = () => {
    Object.keys(activeWinActions).forEach((actionName) => {
      ipcMain.on(actionName, async (...args) => {
        try {
          const result = activeWinActions[actionName](...args);
          return result;
        } catch (e) {
          return { error: e.toString() };
        }
      });
    });
  };
}

module.exports.ipcManager = new IPCManager();
