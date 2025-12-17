import {create} from "zustand";
import axios from "axios";

interface BranchStore {
  branches: string[];
  currentBranch: string | null;
  fetchBranches: (repo: string) => Promise<void>;
}

export const useBranchStore = create<BranchStore>((set) => ({
  branches: [],
  currentBranch: null,

  fetchBranches: async (repo) => {
    try {
      const res = await axios.get(`/api/repos/${repo}/branches`);
      set({
        branches: res.data.branches || [],
        currentBranch: res.data.current || null,
      });
    } catch (err) {
      console.error("Error fetching branches:", err);
      set({
        branches: [],
        currentBranch: null,
      });
    }
  },
}));
