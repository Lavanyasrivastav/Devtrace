import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false, // true once we've attempted to restore a session on app load

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  loginSuccess: (user, accessToken) => set({ user, accessToken }),

  logout: () => set({ user: null, accessToken: null }),
}));
