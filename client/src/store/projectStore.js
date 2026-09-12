import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
