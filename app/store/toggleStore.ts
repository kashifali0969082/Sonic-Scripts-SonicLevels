import { create } from "zustand";

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

type UIState = {
  on: boolean;
  toggle: () => void;

  network: boolean; // false = testnet, true = sonic mainnet
  toggleNetwork: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  on: false,
  toggle: () => set((state) => ({ on: !state.on })),

  network: false,
  toggleNetwork: () => set((state) => ({ network: !state.network })),
}));
