import {create} from "zustand";
import axios from "axios";
import type {FileNode} from "~/props/FileNode";
import type {RepoItem} from "~/props/Repos";

interface RepoStore {
  repos: RepoItem[];
  selectedRepo: string | null;
  fileTree: FileNode[];
  repoName: string;
  fileContent: Record<string, string>; // store file contents keyed by path

  setRepoName: (v: string) => void;
  fetchRepos: () => Promise<void>;
  createRepo: () => Promise<void>;
  viewRepo: (name: string) => Promise<void>;
  fetchFileContent: (filePath: string) => Promise<void>; // new action
}

export const useRepoStore = create<RepoStore>((set, get) => ({
  repos: [],
  selectedRepo: null,
  fileTree: [],
  repoName: "",
  fileContent: {},

  setRepoName: (v) => set({repoName: v}),

  fetchRepos: async () => {
    try {
      const res = await axios.get("/api/repos");
      console.log(res.data);
      set({repos: res.data});
    } catch (err) {
      console.error(err);
    }
  },

  createRepo: async () => {
    const {repoName, fetchRepos} = get();
    if (!repoName.trim()) return;

    try {
      await axios.post("/api/repos", {name: repoName});
      set({repoName: ""});
      fetchRepos();
    } catch (err) {
      console.error(err);
    }
  },

  viewRepo: async (name) => {
    try {
      const res = await axios.get(`/api/repos/${name}`);
      set({fileTree: res.data, selectedRepo: name, fileContent: {}}); // reset content
    } catch (err) {
      console.error(err);
      set({fileTree: [], selectedRepo: null, fileContent: {}});
    }
  },

  fetchFileContent: async (filePath: string) => {
    const {selectedRepo, fileContent} = get();
    if (!selectedRepo) return;

    try {
      const res = await axios.get(
        `/api/repos/${selectedRepo}/files?filePath=${encodeURIComponent(
          filePath
        )}`
      );
      console.log(res.data);
      set({fileContent: {...fileContent, [filePath]: res.data.content}});
    } catch (err) {
      console.error(err);
    }
  },
}));
