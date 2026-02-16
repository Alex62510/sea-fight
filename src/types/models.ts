// Пользователь

export interface User {
  id: number;
  username: string;
  email: string;
  status: 'online' | 'offline' | 'in-game';
  friends: string[];
  wins: number;
  loses: number;
}

// Игра
export interface Game {
  id: string;
  players: string[]; // id игроков
  boardState: Record<string, BoardCell[]>; // 'playerId' -> массив клеток
  turn: string; // id игрока, чей ход
  status: 'setup' | 'in-progress' | 'finished';
}

// Клетка на поле
export type BoardCell = {
  x: number;
  y: number;
  ship?: Ship;
  hasShip: boolean;
  isHit: boolean;
  blocked: boolean;
  missed?: boolean;
};
export type Ship = {
  id: string;
  name: string;
  size: number;
  orientation: 'horizontal' | 'vertical';
  placed: boolean;
  hits: number;
};
// Запрос на игру
export interface GameInvite {
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
}
export type GamePhase =
  | 'setup' // расстановка кораблей
  | 'waiting' // я готов, жду противника
  | 'battle' // бой
  | 'finished';

export interface AuthResponse {
  accessToken: string;
  user: User;
}
export interface ChatMessage {
  senderId: number;
  message: string;
  timestamp: number;
}
