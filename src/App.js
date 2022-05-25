import { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ProgramTable from './components/ProgramTable';
import { useInterval } from './hooks/intervalHooks.js';
const {
  electronBridge: { sendIpc, onIpc, removeIpc },
} = window;

function App() {
  let [isOnTracked, setIsOnTracked] = useState(false);
  const [allDayTrackWindows, setAllDayTrackWindows] = useState([]);

  useEffect(() => {
    onIpc('REPLY_ACTIVE_WINDOW', (event, payload) => {
      console.log(payload.newActiveWin);
      console.table(payload.allDayTrackWindows);
      setAllDayTrackWindows(payload.allDayTrackWindows);
    });
    return () => {
      removeIpc('REPLY_ACTIVE_WINDOW');
    };
  }, [allDayTrackWindows]);

  useInterval(
    () => {
      sendIpc('ACTIVE_WINDOW', '');
    },
    isOnTracked ? 5000 : null,
  );

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar
        name="check-it-out"
        isOnTracked={isOnTracked}
        setIsOnTracked={setIsOnTracked}></Toolbar>
      <ProgramTable programList={allDayTrackWindows}></ProgramTable>
    </div>
  );
}

export default App;
