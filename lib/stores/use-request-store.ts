import { create } from "zustand";

interface RequestState {
  pendingRequests: Set<string>;
  addRequest: (key: string) => void;
  removeRequest: (key: string) => void;
  isPending: (key: string) => boolean;
}

// Store to prevent duplicate requests and unwanted clicks
export const useRequestStore = create<RequestState>((set, get) => ({
  pendingRequests: new Set<string>(),
  addRequest: (key) => {
    set((state) => ({
      pendingRequests: new Set(state.pendingRequests).add(key),
    }));
  },
  removeRequest: (key) => {
    set((state) => {
      const newSet = new Set(state.pendingRequests);
      newSet.delete(key);
      return { pendingRequests: newSet };
    });
  },
  isPending: (key) => {
    return get().pendingRequests.has(key);
  },
}));
