import { Router } from './router/router.tsx';
import { useAuthRefresh } from './hooks/useAuthRefresh.tsx';

function App() {
  useAuthRefresh();
  return (
    <div className="">
      <Router />
    </div>
  );
}

export default App;
