import Toolbar from './components/Toolbar';
import ProgramTable from './components/ProgramTable';
import { useEffect, useRef } from 'react';
const {
  electronBridge: { sendIpc, onIpc },
} = window;

onIpc('REPLY_ACTIVE_WINDOW', (event, payload) => {
  console.log('payload : ', payload);
});

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function App() {
  useInterval(() => {
    // Your custom logic here
    sendIpc('ACTIVE_WINDOW', '');
  }, 1000);

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar name="check-it-out"></Toolbar>
      <ProgramTable></ProgramTable>
    </div>
  );
}

export default App;
