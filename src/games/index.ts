import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface GameProps { chatId: number | null; }
export interface GameEntry {
  Component: LazyExoticComponent<ComponentType<GameProps>>;
  title: string;
}

export const GAMES: Record<string, GameEntry> = {
  truco: { Component: lazy(() => import('./truco')), title: 'Truco' },
};

export function getGame(name: string | null | undefined): GameEntry | null {
  if (!name) return null;
  return GAMES[name.toLowerCase()] ?? null;
}
