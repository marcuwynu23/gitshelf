import fs from "fs";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {getUserRepoDir} from "../utils/config";
import type {RepoItem} from "../models/Repo";

export class RepoService {
  async listRepos(username: string, httpBaseURL: string): Promise<RepoItem[]> {
    const repoDir = getUserRepoDir(username);
    const sshHost = process.env.SSH_HOST || "localhost";
    const sshPort = process.env.SSH_PORT || "2222";
    const sshEnabled = process.env.ENABLE_SSH !== "false";

    if (!fs.existsSync(repoDir)) {
      return [];
    }

    const repos = fs
      .readdirSync(repoDir)
      .filter((f) => fs.statSync(path.join(repoDir, f)).isDirectory())
      .map((repo) => {
        // Generate SSH address using server's own SSH configuration
        const sshAddress: string | null = sshEnabled
          ? `ssh://${sshHost}:${sshPort}/${username}/${repo}`
          : null;

        return {
          name: repo,
          sshAddress,
          httpAddress: `${httpBaseURL}/${username}/${repo}`, // Username-based path
        };
      });

    return repos;
  }

  async createRepo(username: string, name: string): Promise<string> {
    if (!name.trim()) {
      throw new Error("Repo name required");
    }

    const repoNameWithGit = `${name}.git`;
    const repoDir = getUserRepoDir(username);
    const repoPath = path.join(repoDir, repoNameWithGit);

    if (fs.existsSync(repoPath)) {
      throw new Error("Repo exists");
    }

    fs.mkdirSync(repoPath, {recursive: true});
    const git: SimpleGit = simpleGit(repoPath);
    await git.init(true); // bare repo

    return repoNameWithGit;
  }

  repoExists(username: string, repoName: string): boolean {
    const repoDir = getUserRepoDir(username);
    const repoPath = path.join(repoDir, repoName);
    return fs.existsSync(repoPath);
  }

  getRepoPath(username: string, repoName: string): string {
    const repoDir = getUserRepoDir(username);
    return path.join(repoDir, repoName);
  }
}
