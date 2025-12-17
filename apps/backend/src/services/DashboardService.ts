import fs from "fs";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {REPO_DIR} from "../utils/config";
import {RepoService} from "./RepoService";
import {GitService} from "./GitService";
import type {RepoItem} from "../models/Repo";

export interface DashboardStats {
  totalRepos: number;
  totalCommits: number;
  totalBranches: number;
  recentRepos: RepoItem[];
  recentActivity: Array<{
    repo: string;
    branch: string;
    lastCommit: {
      hash: string;
      message: string;
      author: string;
      date: string;
    } | null;
  }>;
}

export class DashboardService {
  private repoService: RepoService;
  private gitService: GitService;

  constructor() {
    this.repoService = new RepoService();
    this.gitService = new GitService();
  }

  async getDashboardStats(httpBaseURL: string): Promise<DashboardStats> {
    const repos = await this.repoService.listRepos(httpBaseURL);
    const totalRepos = repos.length;

    let totalCommits = 0;
    let totalBranches = 0;
    const recentActivity: DashboardStats["recentActivity"] = [];

    // Get stats for each repository
    for (const repo of repos) {
      try {
        const repoName = repo.name;
        const repoPath = path.join(REPO_DIR, repoName);

        if (!fs.existsSync(repoPath)) {
          continue;
        }

        const git: SimpleGit = simpleGit(repoPath);

        // Get branches
        let branchCount = 0;
        let branches: any = null;
        try {
          branches = await git.branchLocal();
          branchCount = branches.all.length;
          totalBranches += branchCount;
        } catch (err) {
          // Repo might be empty or have no branches
          branches = {all: [], current: null};
        }

        // Get commits count and latest commit
        try {
          const log = await git.log();
          const commitCount = log.total;
          totalCommits += commitCount;

          // Get current branch name
          const currentBranch = branches?.current || branches?.all[0] || "main";

          // Use the latest commit from the log we already fetched
          // This is more reliable than querying from a specific branch
          if (log.latest && log.total > 0) {
            recentActivity.push({
              repo: repo.name,
              branch: currentBranch,
              lastCommit: {
                hash: log.latest.hash,
                message: log.latest.message,
                author: log.latest.author_name || "Unknown",
                date: log.latest.date,
              },
            });
          } else {
            // No commits found
            recentActivity.push({
              repo: repo.name,
              branch: currentBranch,
              lastCommit: null,
            });
          }
        } catch (err: any) {
          // Handle case where repo has no commits yet
          if (err?.message?.includes("does not have any commits yet")) {
            const currentBranch =
              branches?.current || branches?.all[0] || "main";
            recentActivity.push({
              repo: repo.name,
              branch: currentBranch,
              lastCommit: null,
            });
          } else {
            // Other error - repo might be empty or corrupted
            recentActivity.push({
              repo: repo.name,
              branch: "main",
              lastCommit: null,
            });
          }
        }
      } catch (err) {
        console.error(`Error processing repo ${repo.name}:`, err);
        // Continue with other repos
      }
    }

    // Sort recent activity by date (most recent first)
    recentActivity.sort((a, b) => {
      if (!a.lastCommit) return 1;
      if (!b.lastCommit) return -1;
      return (
        new Date(b.lastCommit.date).getTime() -
        new Date(a.lastCommit.date).getTime()
      );
    });

    // Get recent repos (last 5)
    const recentRepos = repos.slice(0, 5);

    return {
      totalRepos,
      totalCommits,
      totalBranches,
      recentRepos,
      recentActivity: recentActivity.slice(0, 10), // Last 10 activities
    };
  }
}
