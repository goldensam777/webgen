"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id:    string;
  email: string;
  name:  string;
}

interface AuthStore {
  user:    AuthUser | null;
  token:   string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:  null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        set({ user: null, token: null });
      },
    }),
    {
      name:    "webgen-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
