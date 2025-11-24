import {create} from "zustand";
import axios from "axios";
import type {Commit} from "~/props/Commit";

interface CommitStore {
  commits: Commit[];
  fetchCommits: (repo: string) => Promise<void>;
}

export const useCommitStore = create<CommitStore>((set) => ({
  commits: [],

  fetchCommits: async (repo) => {
    const res = await axios.get(`/api/repos/${repo}/commits`);
    set({commits: res.data});
  },
}));
