'use client';

import { create } from 'zustand';
import {
  type AuthClientUser,
  saveUserToLocalStorage,
  getUserFromLocalStorage,
  clearUserFromLocalStorage
} from '@/lib/auth-client';

type AuthState = {
  user: AuthClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  // actions
  setUser: (user: AuthClientUser | null) => void;
  login: (user: AuthClientUser) => void;
  logout: () => void;
  hydrate: () => void; // read user from localStorage
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => {
    set({
      user,
      token: user?.token ?? null,
      isAuthenticated: !!user
    });
    if (user) saveUserToLocalStorage(user);
    else clearUserFromLocalStorage();
  },

  login: (user) => {
    set({ user, token: user?.token ?? null, isAuthenticated: true });
    saveUserToLocalStorage(user);
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    clearUserFromLocalStorage();
  },

  hydrate: () => {
    const user = getUserFromLocalStorage();
    set({ user, token: user?.token ?? null, isAuthenticated: !!user });
  }
}));

export type { AuthState };
