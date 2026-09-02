import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoPage from './pages/TodoPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  const { email, isLoggedIn, setUser, clearUser } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={setUser} />
          } />
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage onLogin={setUser} />
          } />
          <Route path="/" element={
            isLoggedIn ? <TodoPage email={email!} onLogout={clearUser} /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
