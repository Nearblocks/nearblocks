'use client';

import { createStore } from 'zustand/vanilla';

export type SessionStatus =
  | 'challenge'
  | 'error'
  | 'idle'
  | 'minting'
  | 'ready';

interface SessionActions {
  reset: () => void;
  setStatus: (status: SessionStatus) => void;
  setToken: (token: string, expiresAt: number) => void;
}

export interface SessionState extends SessionActions {
  expiresAt: null | number;
  ready: boolean;
  status: SessionStatus;
  token: null | string;
}

export type SessionStore = ReturnType<typeof createSessionStore>;

export const createSessionStore = () => {
  return createStore<SessionState>()((set) => ({
    expiresAt: null,
    ready: false,
    reset: () =>
      set((s) => ({
        ...s,
        expiresAt: null,
        ready: false,
        status: 'idle',
        token: null,
      })),
    setStatus: (status) => set((s) => ({ ...s, status })),
    setToken: (token, expiresAt) =>
      set((s) => ({
        ...s,
        expiresAt,
        ready: true,
        status: 'ready',
        token,
      })),
    status: 'idle',
    token: null,
  }));
};
