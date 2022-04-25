import Toolbar from './components/Toolbar';
import ProgramTable from './components/ProgramTable';
import { useInterval } from './hooks/intervalHooks.js';
const {
  electronBridge: { sendIpc, onIpc },
} = window;

onIpc('REPLY_ACTIVE_WINDOW', (event, payload) => {
  console.log(payload);
});

function App() {
  useInterval(() => {
    sendIpc('ACTIVE_WINDOW', '');
  }, 5000);

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar name="check-it-out"></Toolbar>
      <ProgramTable></ProgramTable>
    </div>
  );
}

export default App;
