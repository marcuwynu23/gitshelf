import fs from "fs";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {REPO_DIR} from "../utils/config";
import type {RepoItem} from "../models/Repo";

export class RepoService {
  async listRepos(httpBaseURL: string): Promise<RepoItem[]> {
    const sshHost = process.env.SSH_HOST || "localhost";
    const sshPort = process.env.SSH_PORT || "2222";
    const sshEnabled = process.env.ENABLE_SSH !== "false";

    const repos = fs
      .readdirSync(REPO_DIR)
      .filter((f) => fs.statSync(path.join(REPO_DIR, f)).isDirectory())
      .map((repo) => {
        // Generate SSH address using server's own SSH configuration
        const sshAddress: string | null = sshEnabled
          ? `ssh://${sshHost}:${sshPort}/${repo}`
          : null;

        return {
          name: repo,
          sshAddress,
          httpAddress: `${httpBaseURL}/${repo}`, // Standard Git HTTP format
        };
      });

    return repos;
  }

  async createRepo(name: string): Promise<string> {
    if (!name.trim()) {
      throw new Error("Repo name required");
    }

    const repoNameWithGit = `${name}.git`;
    const repoPath = path.join(REPO_DIR, repoNameWithGit);

    if (fs.existsSync(repoPath)) {
      throw new Error("Repo exists");
    }

    fs.mkdirSync(repoPath, {recursive: true});
    const git: SimpleGit = simpleGit(repoPath);
    await git.init(true); // bare repo

    return repoNameWithGit;
  }

  repoExists(repoName: string): boolean {
    const repoPath = path.join(REPO_DIR, repoName);
    return fs.existsSync(repoPath);
  }
}

