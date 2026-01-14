import {create} from "zustand";
import axios from "axios";
import type {FileNode} from "~/props/FileNode";
import type {RepoItem} from "~/props/Repos";

interface RepoStore {
  repos: RepoItem[];
  selectedRepo: string | null;
  selectedFile: string | null;
  fileTree: FileNode[];
  repoName: string;
  fileContent: Record<string, string>; // store file contents keyed by path

  setRepoName: (v: string) => void;
  setSelectedFile: (filePath: string | null) => void;
  fetchRepos: () => Promise<void>;
  createRepo: (title?: string, description?: string) => Promise<void>;
  viewRepo: (name: string) => Promise<void>;
  fetchFileContent: (filePath: string) => Promise<void>; // new action
  clearSelectedRepo: () => void;
}

export const useRepoStore = create<RepoStore>((set, get) => ({
  repos: [],
  selectedRepo: null,
  selectedFile: null,
  fileTree: [],
  repoName: "",
  fileContent: {},

  setRepoName: (v) => set({repoName: v}),
  setSelectedFile: (filePath) => set({selectedFile: filePath}),

  fetchRepos: async () => {
    try {
      const res = await axios.get("/api/repos");
      console.log(res.data);
      set({repos: res.data});
    } catch (err) {
      console.error(err);
    }
  },

  createRepo: async (title?: string, description?: string) => {
    const {repoName, fetchRepos} = get();
    if (!repoName.trim()) return;

    try {
      await axios.post("/api/repos", {
        name: repoName,
        title: title || undefined,
        description: description || undefined,
      });
      set({repoName: ""});
      fetchRepos();
    } catch (err) {
      console.error(err);
    }
  },

  viewRepo: async (name) => {
    try {
      const res = await axios.get(`/api/repos/${name}`);
      set({
        fileTree: res.data,
        selectedRepo: name,
        selectedFile: null,
        fileContent: {},
      }); // reset content and file
    } catch (err) {
      console.error(err);
      set({
        fileTree: [],
        selectedRepo: null,
        selectedFile: null,
        fileContent: {},
      });
    }
  },

  clearSelectedRepo: () => {
    set({
      selectedRepo: null,
      selectedFile: null,
      fileTree: [],
      fileContent: {},
    });
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
