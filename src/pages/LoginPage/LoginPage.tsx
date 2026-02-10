import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { loginApi, registerApi } from '../../services/authApi.ts';
import axios from 'axios';

const LoginPage = () => {
  const setUser = useUserStore((s) => s.setCurrentUser);
  const statuses = useUserStore((s) => s.statuses);
  const setToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  console.log('statuses', statuses);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === 'register' && !username.trim())) return;

    setLoading(true);
    setError('');

    try {
      const data =
        mode === 'login'
          ? await loginApi(email, password)
          : await registerApi(username, email, password);

      setToken(data.accessToken);
      setUser(data.user);

      navigate('/');
    } catch (err) {
      let message = 'Ошибка входа/регистрации';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="relative w-full max-w-sm group">
        <span className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/30 via-white/20 to-purple-500/30 opacity-0 blur-2xl group-hover:opacity-100 group-hover:animate-[shine_2s_linear_infinite] pointer-events-none" />

        <div className="relative bg-slate-800 p-8 rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            {mode === 'login' ? 'Войти в игру' : 'Регистрация'}
          </h1>

          {error && <p className="text-red-400 text-center mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Имя игрока</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя"
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 -translate-y-1/2 text-gray-400 hover:text-white transition p-1 cursor-pointer"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative group w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition active:scale-95 cursor-pointer"
            >
              <span className="relative z-10">
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </span>
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-4">
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
