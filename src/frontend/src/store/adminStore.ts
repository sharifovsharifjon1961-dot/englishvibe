import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
  signOut: () => void;
}

/**
 * Admin session flag persisted to localStorage. The passcode itself is never
 * stored — only the unlocked state, verified against the backend passcode.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      setAdmin: (isAdmin) => set({ isAdmin }),
      signOut: () => set({ isAdmin: false }),
    }),
    { name: "cefr-admin" },
  ),
);
