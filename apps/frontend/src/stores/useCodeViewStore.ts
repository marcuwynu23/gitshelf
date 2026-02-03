import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CodeViewStore {
  /**
   * Branch name, tag, or commit hash.
   * Empty string means "default" (server resolves to HEAD/latest commit).
   */
  viewRef: string;

  setViewRef: (ref: string) => void;
  clearViewRef: () => void;
}

const STORAGE_KEY = "code-view-store-v1";

export const useCodeViewStore = create<CodeViewStore>()(
  persist(
    (set) => ({
      viewRef: "",

      setViewRef: (ref: string) => set({ viewRef: ref ?? "" }),
      clearViewRef: () => set({ viewRef: "" }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ viewRef: state.viewRef }),
    },
  ),
);
