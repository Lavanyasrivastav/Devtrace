import { create } from 'zustand';

const storedTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'dark';

export const useUIStore = create((set) => ({
  theme: storedTheme,
  isSidebarOpen: false, // mobile sidebar drawer

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
