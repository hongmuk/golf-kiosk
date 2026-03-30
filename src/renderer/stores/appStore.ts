import { create } from 'zustand';

interface AppState {
  currentPage: string;
  isAdmin: boolean;
  settings: Record<string, string>;
  setCurrentPage: (page: string) => void;
  setIsAdmin: (val: boolean) => void;
  setSettings: (settings: Record<string, string>) => void;
  updateSetting: (key: string, value: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: '/',
  isAdmin: false,
  settings: {},
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsAdmin: (val) => set({ isAdmin: val }),
  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({ settings: { ...state.settings, [key]: value } })),
}));
