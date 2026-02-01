import { create } from 'zustand';

interface V3StatusStore {
  v3Available: boolean;
  setV3Available: (available: boolean) => void;
}

export const useV3Status = create<V3StatusStore>((set) => ({
  v3Available: false,
  setV3Available: (available: boolean) => set({ v3Available: available }),
}));
