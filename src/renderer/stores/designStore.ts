import { create } from 'zustand';

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'character';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  src?: string;
}

interface DesignState {
  elements: DesignElement[];
  selectedId: string | null;
  productType: 'golf_ball' | 'sticker';
  addElement: (el: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  setProductType: (type: 'golf_ball' | 'sticker') => void;
  clearAll: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  elements: [],
  selectedId: null,
  productType: 'golf_ball',
  addElement: (el) => set((s) => ({ elements: [...s.elements, el] })),
  updateElement: (id, updates) => set((s) => ({ elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)) })),
  removeElement: (id) => set((s) => ({ elements: s.elements.filter((el) => el.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })),
  selectElement: (id) => set({ selectedId: id }),
  moveElementUp: (id) => set((s) => {
    const idx = s.elements.findIndex((el) => el.id === id);
    if (idx >= s.elements.length - 1) return s;
    const arr = [...s.elements];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    return { elements: arr };
  }),
  moveElementDown: (id) => set((s) => {
    const idx = s.elements.findIndex((el) => el.id === id);
    if (idx <= 0) return s;
    const arr = [...s.elements];
    [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    return { elements: arr };
  }),
  setProductType: (type) => set({ productType: type }),
  clearAll: () => set({ elements: [], selectedId: null }),
}));
