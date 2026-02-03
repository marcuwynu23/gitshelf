import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BranchStore {
  branches: string[];
  currentBranch: string | null;
  setCurrentBranch: (branch: string | null) => void;
  fetchBranches: (repo: string) => Promise<void>;
}

const STORAGE_KEY = "branch-store-v1";

export const useBranchStore = create<BranchStore>()(
  persist(
    (set, get) => ({
      branches: [],
      currentBranch: null,

      setCurrentBranch: (branch) => set({ currentBranch: branch }),

      fetchBranches: async (repo) => {
        try {
          const repoWithGit = repo.includes(".git") ? repo : `${repo}.git`;
          const res = await axios.get(`/api/repos/${repoWithGit}/branches`);

          const branches: string[] = Array.isArray(res.data?.branches) ? res.data.branches : [];

          const apiCurrent: string | null = typeof res.data?.current === "string" ? res.data.current : null;

          // Keep persisted currentBranch if API doesn't provide one (or provides invalid)
          const nextCurrent =
            apiCurrent && branches.includes(apiCurrent)
              ? apiCurrent
              : get().currentBranch && branches.includes(get().currentBranch!)
                ? get().currentBranch
                : (apiCurrent ?? branches[0] ?? null);

          set({
            branches,
            currentBranch: nextCurrent,
          });
        } catch (err) {
          console.error("Error fetching branches:", err);
          set({
            branches: [],
            currentBranch: null,
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        branches: state.branches,
        currentBranch: state.currentBranch,
      }),
    },
  ),
);
