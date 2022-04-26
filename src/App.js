import { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ProgramTable from './components/ProgramTable';
import { useInterval } from './hooks/intervalHooks.js';
const {
  electronBridge: { sendIpc, onIpc, removeIpc },
} = window;

function App() {
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

  useInterval(() => {
    sendIpc('ACTIVE_WINDOW', '');
  }, 5000);

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar name="check-it-out"></Toolbar>
      <ProgramTable programList={activeWindows}></ProgramTable>
    </div>
  );
}

export default App;
