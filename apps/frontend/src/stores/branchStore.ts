import {create} from "zustand";
import axios from "axios";

interface BranchStore {
  branches: string[];
  currentBranch: string;
  fetchBranches: (repo: string) => Promise<void>;
}

export const useBranchStore = create<BranchStore>((set) => ({
  branches: [],
  currentBranch: "",

  fetchBranches: async (repo) => {
    const res = await axios.get(`/api/repos/${repo}/branches`);
    set({
      branches: res.data.branches,
      currentBranch: res.data.current,
    });
  },
}));
