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
      // API expects repo name with .git
      const repoWithGit = repo.includes('.git') ? repo : `${repo}.git`;
      const res = await axios.get(`/api/repos/${repoWithGit}/branches`);
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
