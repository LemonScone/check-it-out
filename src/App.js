import { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ProgramTable from './components/ProgramTable';
import { useInterval } from './hooks/intervalHooks.js';
const {
  electronBridge: { sendIpc, onIpc, removeIpc },
} = window;

function App() {
  let [isOnTracked, setIsOnTracked] = useState(false);
  const [activeWindows, setActiveWindows] = useState([]);

  useEffect(() => {
    onIpc('REPLY_ACTIVE_WINDOW', (event, payload) => {
      console.log(payload.processedWindow);
      console.table(payload.activeWindows);
      setActiveWindows(payload.activeWindows);
    });
    return () => {
      removeIpc('REPLY_ACTIVE_WINDOW');
    };
  }, [activeWindows]);

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
      <ProgramTable programList={activeWindows}></ProgramTable>
    </div>
  );
}

export default App;
