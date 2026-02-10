import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useUserStore } from '../store/userStore.ts';
import LoginPage from '../pages/LoginPage/LoginPage.tsx';
import LobbyPage from '../pages/LobbyPage/LobbyPage.tsx';
import type { ReactElement } from 'react';
import GamePage from '../pages/GamePage/GamePage.tsx';
import FightPage from '../pages/FightPage/FightPage.tsx';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { currentUser } = useUserStore();

  return currentUser ? children : <Navigate to="/login" />;
};

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <LobbyPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/game/:gameId"
        element={
          <PrivateRoute>
            <GamePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/fight/:gameId"
        element={
          <PrivateRoute>
            <FightPage />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
