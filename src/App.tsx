import { Router } from './router/router.tsx';
import { useAuthRefresh } from './hooks/useAuthRefresh.tsx';
import { useAuthStore } from './store/authStore';

function App() {
  useAuthRefresh();

  const isChecking = useAuthStore((s) => s.isChecking);

  if (isChecking)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">Загрузка...</div>
    );

  return (
    <div>
      <Router />
    </div>
  );
}

export default App;
