import fs from "fs";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {getUserRepoDir} from "../utils/config";
import type {RepoItem} from "../models/Repo";
import {RepoModel} from "../models/sequelize/Repo";
import {ActivityService} from "./ActivityService";

export class RepoService {
  private activityService: ActivityService;

  constructor() {
    this.activityService = new ActivityService();
  }

  async listRepos(username: string, httpBaseURL: string): Promise<RepoItem[]> {
    const repoDir = getUserRepoDir(username);
    const sshHost = process.env.SSH_HOST || "localhost";
    const sshPort = process.env.SSH_PORT || "2222";
    const sshEnabled = process.env.ENABLE_SSH !== "false";

    if (!fs.existsSync(repoDir)) {
      return [];
    }

    // Get all repo metadata from database
    const repoMetadata = await RepoModel.findAll({
      where: {username},
    });
    const metadataMap = new Map(
      repoMetadata.map((r: RepoModel) => [
        r.name,
        {title: r.title, description: r.description, archived: r.archived},
      ]),
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
          httpAddress: `${httpBaseURL}/repository/${username}/${repo}`, // Repository-based path
          title: metadata?.title,
          description: metadata?.description,
          archived: metadata?.archived || false,
        };
      });

    return repos;
  }

  async createRepo(
    userId: string,
    username: string,
    name: string,
    title?: string,
    description?: string,
  ): Promise<string> {
    if (!name.trim()) {
      throw new Error("Repo name required");
    }

    const repoNameWithGit = `${name}.git`;
    const repoDir = getUserRepoDir(username);
    const repoPath = path.join(repoDir, repoNameWithGit);

    // Check if repo exists in database
    const existingRepo = await RepoModel.findOne({
      where: {
        username,
        name: repoNameWithGit,
      },
    });

    if (existingRepo) {
      throw new Error("Repo exists");
    }

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
      title: title,
      description: description,
    });

    // Create activity
    await this.activityService.createActivity(
      userId,
      "REPO_CREATE",
      `Created repository ${name}`,
      description || `Created new repository ${username}/${name}`,
      `/repository/${username}/${name}.git`,
    );

    return repoNameWithGit;
  }

  async getRepoMetadata(
    username: string,
    repoName: string,
    httpBaseURL: string,
  ): Promise<{
    title?: string;
    description?: string;
    archived?: boolean;
    sshAddress: string | null;
    httpAddress: string;
  } | null> {
    // Check if repo exists physically first
    if (!this.repoExists(username, repoName)) {
      return null;
    }

    // @ts-ignore - Sequelize static methods are available after init()
    const repo = await RepoModel.findOne({
      where: {
        username,
        name: repoName,
      },
    });

    const sshHost = process.env.SSH_HOST || "localhost";
    const sshPort = process.env.SSH_PORT || "2222";
    const sshEnabled = process.env.ENABLE_SSH !== "false";
    const sshAddress: string | null = sshEnabled
      ? `ssh://${sshHost}:${sshPort}/${username}/${repoName}`
      : null;

    if (!repo) {
      // Repo exists on disk but not in DB -> Return virtual metadata
      return {
        title: repoName.replace(/\.git$/, ""),
        description: undefined,
        archived: false,
        sshAddress,
        httpAddress: `${httpBaseURL}/repository/${username}/${repoName}`,
      };
    }

    return {
      title: repo.title || undefined,
      description: repo.description || undefined,
      archived: repo.archived || false,
      sshAddress: sshAddress,
      httpAddress: `${httpBaseURL}/repository/${username}/${repo.name}`, // Repository-based path
    };
  }

  async updateRepoMetadata(
    username: string,
    repoName: string,
    title?: string | null,
    description?: string | null,
  ): Promise<{title?: string; description?: string}> {
    // 1. Check if repo exists physically
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    // 2. Try to find the repo in DB
    let repo = await RepoModel.findOne({
      where: {
        username,
        name: repoName,
      },
    });

    if (repo) {
      // Update existing record
      await repo.update({
        title: title !== undefined ? title : repo.title,
        description: description !== undefined ? description : repo.description,
      });
    } else {
      // Repo exists on disk but not in DB -> Create it (Upsert-like behavior)
      repo = await RepoModel.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        username,
        name: repoName,
        title: title || repoName.replace(/\.git$/, ""), // Default title if not provided
        description: description || null,
        archived: false,
      });
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

  async deleteRepo(
    userId: string,
    username: string,
    repoName: string,
  ): Promise<void> {
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    const repoPath = this.getRepoPath(username, repoName);

    // Remove from filesystem
    fs.rmSync(repoPath, {recursive: true, force: true});

    // Remove from database
    await RepoModel.destroy({
      where: {
        username,
        name: repoName,
      },
    });

    // Create activity
    await this.activityService.createActivity(
      userId,
      "REPO_DELETE",
      `Deleted repository ${repoName.replace(".git", "")}`,
      `Deleted repository ${username}/${repoName}`,
    );
  }

  async archiveRepo(username: string, repoName: string): Promise<void> {
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    // For now, we'll just update the database to mark as archived
    // In a real implementation, you might want to move the repo to an archive directory
    await RepoModel.update(
      {archived: true},
      {
        where: {
          username,
          name: repoName,
        },
      },
    );
  }

  async unarchiveRepo(username: string, repoName: string): Promise<void> {
    if (!this.repoExists(username, repoName)) {
      throw new Error("Repo not found");
    }

    // Update the database to mark as unarchived
    await RepoModel.update(
      {archived: false},
      {
        where: {
          username,
          name: repoName,
        },
      },
    );
  }

  async renameRepo(
    username: string,
    oldRepoName: string,
    newRepoName: string,
    httpBaseURL: string,
  ): Promise<RepoItem> {
    console.log("Service: Checking if repo exists:", username, oldRepoName);
    if (!this.repoExists(username, oldRepoName)) {
      throw new Error("Repo not found");
    }

    const newRepoNameWithGit = `${newRepoName}.git`;
    const repoDir = getUserRepoDir(username);
    const oldRepoPath = path.join(repoDir, oldRepoName);
    const newRepoPath = path.join(repoDir, newRepoNameWithGit);

    // Check if new name already exists in database
    // @ts-ignore - Sequelize static methods are available after init()
    const existingRepo = await RepoModel.findOne({
      where: {
        username,
        name: newRepoNameWithGit,
      },
    });

    if (existingRepo) {
      throw new Error("New repo name already exists");
    }

    // Check if new name already exists on file system
    if (fs.existsSync(newRepoPath)) {
      throw new Error("New repo name already exists");
    }

    console.log("Renaming directory:", oldRepoPath, "->", newRepoPath);
    // Rename the directory
    fs.renameSync(oldRepoPath, newRepoPath);
    console.log("Directory renamed successfully");

    console.log("Updating database record");
    // Update database record (only name changes for rename)
    await RepoModel.update(
      {
        name: newRepoNameWithGit,
      },
      {
        where: {
          username,
          name: oldRepoName,
        },
      },
    );
    console.log("Database updated successfully");

    // Return updated repo info
    const result = {
      name: newRepoNameWithGit,
      httpAddress: `${httpBaseURL}/repository/${newRepoNameWithGit}`,
      sshAddress: (() => {
        const sshHost = process.env.SSH_HOST || "localhost";
        const sshPort = process.env.SSH_PORT || "2222";
        const sshEnabled = process.env.ENABLE_SSH !== "false";
        return sshEnabled
          ? `ssh://${sshHost}:${sshPort}/${username}/${newRepoNameWithGit}`
          : null;
      })(),
    };
    console.log("Returning result:", result);
    return result;
  }
}
