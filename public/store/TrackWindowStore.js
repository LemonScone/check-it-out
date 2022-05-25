const { getDistanceDate } = require('../utils/dateFormat.js');
const Store = require('electron-store');
const { format } = require('date-fns');

class TrackWindowStore {
  #store = new Store();
  #selectedDay = format(new Date(), 'yyyy-MM-dd');
  #trackWindows = [];
  #currentActiveWin = null;

  constructor() {
    this.getStore();
  }

  getStore = () => {
    this.#trackWindows = (this.#store.get('trackWindows') || []).map((w) => {
      [w.startDate, w.finishedDate] = [
        new Date(w.startDate),
        w.finishedDate ? new Date(w.finishedDate) : null,
      ];

      return w;
    });
    this.#currentActiveWin = this.#store.get('currentActiveWin') || null;
  };

  setStore = () => {
    this.#store.set('trackWindows', this.#trackWindows);
    this.#store.set('currentActiveWin', this.#currentActiveWin);
  };

  setSelectedDay = (date) => {
    this.#selectedDay = date;
  };

  isSelectedDayToday = () => {
    return this.#selectedDay === format(new Date(), 'yyyy-MM-dd');
  };

  addTrackWindows = (window) => {
    this.#trackWindows.push(window);
  };

  setCurrentActiveWin = (newActiveWin) => {
    this.#currentActiveWin = newActiveWin;
  };

  deleteCurrentActiveWin = () => {
    this.#currentActiveWin = null;
    this.#store.delete('currentActiveWin');
  };

  setNewTrackWindow = (newWindow) => {
    this.addTrackWindows(newWindow);
    this.setCurrentActiveWin(newWindow);
    this.setStore();
  };

  hasCurrentWindow = () => {
    if (this.#currentActiveWin) {
      return true;
    }

    return false;
  };

  isSameWindowAsCurrentActiveWin = (comparedWindow) => {
    return this.isSameWindow(this.#currentActiveWin, comparedWindow);
  };

  isNewTrackWindow = (newWindow) => {
    return !this.hasCurrentWindow() || !this.isSameWindowAsCurrentActiveWin(newWindow);
  };

  isSameWindow = (window1, window2) => {
    if (window1 && window2 && window1.app === window2.app && window1.title === window2.title) {
      return true;
    }

    return false;
  };

  findTrackWindowBySelectedDay = () => {
    const filtered = this.#trackWindows.filter(
      (w) => this.#selectedDay === format(w.startDate, 'yyyy-MM-dd'),
    );
    return filtered;
  };

  setCurrentActiveWinFinishedDate = (finishedDate) => {
    const { startDate } = this.#currentActiveWin;

    //* 활성 프로그램이 바꼈으면 이전의 active-win 객체에 finishedDate와 distance 정보 업데이트
    this.#trackWindows.forEach((w) => {
      if (
        this.isSameWindow(w, this.#currentActiveWin) &&
        JSON.stringify(w.startDate) === JSON.stringify(startDate)
      ) {
        [w.finishedDate, w.distance] = [finishedDate, getDistanceDate(startDate, finishedDate)];
      }
    });
  };
}

module.exports.trackWindowStore = new TrackWindowStore();
