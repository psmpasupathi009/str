import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phoneNumber?: string | null;
  role: "USER" | "ADMIN";
  isEmailVerified?: boolean;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => {
        set({ user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart-storage");
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
