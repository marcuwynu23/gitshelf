import type {FileNode} from "@myapp/ui";
import axios from "axios";
import {create} from "zustand";
import type {RepoItem} from "~/props/Repos";

interface RepoStore {
  repos: RepoItem[];
  selectedRepo: string | null;
  selectedFile: string | null;
  fileTree: FileNode[];
  repoName: string;
  fileContent: Record<string, string>; // store file contents keyed by path
  isLoading: boolean;

  setRepoName: (v: string) => void;
  setSelectedFile: (filePath: string | null) => void;
  setIsLoading: (v: boolean) => void;
  fetchRepos: () => Promise<void>;
  createRepo: (
    title?: string,
    description?: string,
    options?: {
      defaultBranch?: string;
      addReadme?: boolean;
      addLicense?: boolean;
      addGitignore?: boolean;
    },
  ) => Promise<void>;
  viewRepo: (name: string, branchOrCommit?: string) => Promise<void>;
  fetchFileContent: (
    filePath: string,
    branchOrCommit?: string,
  ) => Promise<void>; // new action
  clearSelectedRepo: () => void;
}

export const useRepoStore = create<RepoStore>((set, get) => ({
  repos: [],
  selectedRepo: null,
  selectedFile: null,
  fileTree: [],
  repoName: "",
  fileContent: {},
  isLoading: false,

  setRepoName: (v) => set({repoName: v}),
  setSelectedFile: (filePath) => set({selectedFile: filePath}),
  setIsLoading: (v) => set({isLoading: v}),

  fetchRepos: async () => {
    try {
      const res = await axios.get("/api/repos");
      console.log(res.data);
      set({repos: res.data});
    } catch (err) {
      console.error(err);
    }
  },

  createRepo: async (title, description, options) => {
    const {repoName, fetchRepos} = get();
    if (!repoName.trim()) return;

    try {
      await axios.post("/api/repos", {
        name: repoName,
        title: title || undefined,
        description: description || undefined,
        defaultBranch: options?.defaultBranch || "main",
        addReadme: options?.addReadme || false,
        addLicense: options?.addLicense || false,
        addGitignore: options?.addGitignore || false,
      });
      set({repoName: ""});
      fetchRepos();
    } catch (err) {
      console.error(err);
    }
  },

  viewRepo: async (name, branchOrCommit) => {
    set({isLoading: true, fileTree: [], selectedRepo: name});
    try {
      // API expects repo name with .git; encode to support names with slashes
      const nameWithGit = name.includes(".git") ? name : `${name}.git`;
      const res = await axios.get(
        `/api/repos/${encodeURIComponent(nameWithGit)}${branchOrCommit ? `?branchOrCommit=${encodeURIComponent(branchOrCommit)}` : ""}`,
      );
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
    } finally {
      set({isLoading: false});
    }
  },

  clearSelectedRepo: () => {
    set({
      selectedRepo: null,
      selectedFile: null,
      fileTree: [],
      fileContent: {},
      isLoading: false,
    });
  },

  fetchFileContent: async (filePath: string, branchOrCommit?: string) => {
    const {selectedRepo, fileContent} = get();
    if (!selectedRepo) return;

    try {
      const repoWithGit = selectedRepo.includes(".git")
        ? selectedRepo
        : `${selectedRepo}.git`;

      const params = new URLSearchParams({filePath});
      if (branchOrCommit) params.set("branchOrCommit", branchOrCommit);

      const res = await axios.get(
        `/api/repos/${encodeURIComponent(repoWithGit)}/files?${params.toString()}`,
      );

      set({
        fileContent: {
          ...(fileContent ?? {}),
          [filePath]: res.data.content,
        },
      });
    } catch (err) {
      console.error(err);
    }
  },
}));
