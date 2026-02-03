import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import type {BranchInfo} from "../models/Branch";
import type {Commit} from "../models/Commit";
import type {FileNode, TreeNode} from "../models/FileNode";
import {getUserRepoDir} from "../utils/config";

export class GitService {
  private getRepoPath(username: string, repoName: string): string {
    const repoDir = getUserRepoDir(username);
    return path.join(repoDir, repoName);
  }

  private getGitInstance(repoPath: string): SimpleGit {
    return simpleGit(repoPath);
  }

  async hasCommits(username: string, repoName: string): Promise<boolean> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    try {
      const log = await git.log({maxCount: 1});
      return log.total > 0;
    } catch (err: any) {
      if (err?.message.includes("does not have any commits yet")) {
        return false;
      }
      throw err;
    }
  }

  async getFileTree(
    username: string,
    repoName: string,
    branch?: string,
  ): Promise<FileNode[]> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    const hasCommits = await this.hasCommits(username, repoName);
    if (!hasCommits) return [];

    let resolvedBranch = branch?.trim();
    if (!resolvedBranch) {
      try {
        const ref = await git.raw(["symbolic-ref", "refs/remotes/origin/HEAD"]);
        resolvedBranch = ref.trim().split("/").pop();
      } catch {
        resolvedBranch = "HEAD";
      }
    }
    if (!resolvedBranch) resolvedBranch = "HEAD";

    // Ensure ref resolves to a commit
    try {
      await git.raw(["rev-parse", "--verify", `${resolvedBranch}^{commit}`]);
    } catch {
      return [];
    }

    // List files from that ref
    const treeRaw = await git.raw([
      "ls-tree",
      "-r",
      "--name-only",
      resolvedBranch,
    ]);
    const allPaths = treeRaw.split("\n").filter(Boolean);

    const root: TreeNode[] = [];

    const findOrCreateFolder = (
      nodes: TreeNode[],
      name: string,
      fullPath: string,
    ): TreeNode => {
      let node = nodes.find((n) => n.name === name && n.type === "folder");
      if (!node) {
        node = {name, path: fullPath, type: "folder", children: []};
        nodes.push(node);
      }
      return node;
    };

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
      });
    };

    for (const filePath of allPaths) {
      const parts = filePath.split("/");
      let currentLevel = root;

      for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        const isFile = index === parts.length - 1;
        const fullPath = parts.slice(0, index + 1).join("/");

        if (isFile) {
          let lastCommitMsg: string | null = null;
          let lastCommitTime: string | null = null;

          try {
            // IMPORTANT: include the ref so git logs the correct branch/commit, not default HEAD
            const logRaw = await git.raw([
              "log",
              "-1",
              "--pretty=format:%s||%cI",
              resolvedBranch,
              "--",
              filePath,
            ]);

            if (logRaw) {
              const p = logRaw.split("||");
              lastCommitMsg = p[0] ?? null;
              lastCommitTime = p[1] ?? null;
            }
          } catch {
            // ignore per-file log errors
          }

          currentLevel.push({
            name: part,
            path: fullPath,
            type: "file",
            lastCommitMsg,
            lastCommitTime,
          });
        } else {
          const folderNode = findOrCreateFolder(currentLevel, part, fullPath);
          currentLevel = folderNode.children!;
        }

        sortNodes(currentLevel);
      }
    }

    sortNodes(root);
    return root as FileNode[];
  }

  async getFileContent(
    username: string,
    repoName: string,
    filePath: string,
  ): Promise<string> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    // Get latest commit hash
    let log;
    try {
      log = await git.log({n: 1});
    } catch (err: any) {
      if (err?.message.includes("does not have any commits yet")) {
        throw new Error("No commits found");
      }
      throw err;
    }

    if (log.total === 0) {
      throw new Error("No commits found");
    }

    const latestCommit = log.latest?.hash;

    // Use 'git show' to get file content from the commit
    const content = await git.show([`${latestCommit}:${filePath}`]);

    return content;
  }

  async getBranches(username: string, repoName: string): Promise<BranchInfo> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    try {
      const branchSummary = await git.branch();
      return {
        current: branchSummary.current || null,
        branches: branchSummary.all || [],
      };
    } catch (err: any) {
      // If repo has no commits, return empty branches
      if (err?.message.includes("does not have any commits yet")) {
        return {
          current: null,
          branches: [],
        };
      }
      throw err;
    }
  }

  async getCommits(
    username: string,
    repoName: string,
    maxCount = 20,
  ): Promise<Commit[]> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    try {
      const log = await git.log({maxCount});
      return log.all.map((c) => ({
        hash: c.hash,
        message: c.message,
        author: c.author_name,
        date: c.date,
      }));
    } catch (err: any) {
      if (err?.message.includes("does not have any commits yet")) {
        return [];
      }
      throw err;
    }
  }

  async getTotalCommitCount(
    username: string,
    repoName: string,
  ): Promise<number> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    try {
      const log = await git.log();
      return log.total;
    } catch (err: any) {
      if (err?.message.includes("does not have any commits yet")) {
        return 0;
      }
      throw err;
    }
  }

  async getCurrentBranch(
    username: string,
    repoName: string,
  ): Promise<string | null> {
    const repoPath = this.getRepoPath(username, repoName);
    const git = this.getGitInstance(repoPath);

    try {
      const branchSummary = await git.branch();
      return branchSummary.current || null;
    } catch (err: any) {
      if (err?.message.includes("does not have any commits yet")) {
        return null;
      }
      throw err;
    }
  }
}
