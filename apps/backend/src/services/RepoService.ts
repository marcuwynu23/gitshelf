import fs from "fs";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {getUserRepoDir} from "../utils/config";
import type {RepoItem} from "../models/Repo";
import {RepoModel} from "../models/sequelize/Repo";

export class RepoService {
  async listRepos(username: string, httpBaseURL: string): Promise<RepoItem[]> {
    const repoDir = getUserRepoDir(username);
    const sshHost = process.env.SSH_HOST || "localhost";
    const sshPort = process.env.SSH_PORT || "2222";
    const sshEnabled = process.env.ENABLE_SSH !== "false";

    if (!fs.existsSync(repoDir)) {
      return [];
    }

    // Get all repo metadata from database
    // @ts-ignore - Sequelize static methods are available after init()
    const repoMetadata = await RepoModel.findAll({
      where: { username },
    });
    const metadataMap = new Map(
      repoMetadata.map((r: RepoModel) => [r.name, { title: r.title, description: r.description }])
    );

    const repos = fs
      .readdirSync(repoDir)
      .filter((f) => fs.statSync(path.join(repoDir, f)).isDirectory())
      .map((repo) => {
        // Generate SSH address using server's own SSH configuration
        const sshAddress: string | null = sshEnabled
          ? `ssh://${sshHost}:${sshPort}/${username}/${repo}`
          : null;

        const metadata = metadataMap.get(repo);

        return {
          name: repo,
          sshAddress,
          httpAddress: `${httpBaseURL}/repository/${username}/${repo}`, // Repository-based path with username
          title: metadata?.title,
          description: metadata?.description,
        };
      });

    return repos;
  }

  async createRepo(username: string, name: string, title?: string, description?: string): Promise<string> {
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

    // Save metadata to database
    // @ts-ignore - Sequelize static methods are available after init()
    await RepoModel.create({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      name: repoNameWithGit,
      title: title || null,
      description: description || null,
    });

    return repoNameWithGit;
  }

  async getRepoMetadata(username: string, repoName: string): Promise<{ title?: string; description?: string } | null> {
    // @ts-ignore - Sequelize static methods are available after init()
    const repo = await RepoModel.findOne({
      where: {
        username,
        name: repoName,
      },
    });

    if (!repo) {
      return null;
    }

    return {
      title: repo.title || undefined,
      description: repo.description || undefined,
    };
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

  async deleteRepo(username: string, repoName: string): Promise<void> {
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    const repoPath = this.getRepoPath(username, repoName);

    // Remove from filesystem
    fs.rmSync(repoPath, { recursive: true, force: true });

    // Remove from database
    // @ts-ignore - Sequelize static methods are available after init()
    await RepoModel.destroy({
      where: {
        username,
        name: repoName,
      },
    });
  }

  async archiveRepo(username: string, repoName: string): Promise<void> {
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    // For now, we'll just update the database to mark as archived
    // In a real implementation, you might want to move the repo to an archive directory
    // @ts-ignore - Sequelize static methods are available after init()
    await RepoModel.update(
      { archived: true },
      {
        where: {
          username,
          name: repoName,
        },
      }
    );
  }
}
