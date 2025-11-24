import { create } from "zustand";

//
// Toggle Store (unchanged)
//
type ToggleState = {
  on: boolean;
  toggle: () => void;
  setOn: (value: boolean) => void;
};

export const useToggleStore = create<ToggleState>((set) => ({
  on: false,
  toggle: () => set((state) => ({ on: !state.on })),
  setOn: (value) => set({ on: value }),
}));


//
// UI Store (clean + correct)
//
type UIState = {
  on: boolean;
  toggle: () => void;

  network: boolean;   // false = Sepolia, true = Sonic
  toggleNetwork: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  on: false,
  toggle: () => set((state) => ({ on: !state.on })),

  network: false,
  toggleNetwork: () =>
    set((state) => ({
      network: !state.network,
    })),
}));
