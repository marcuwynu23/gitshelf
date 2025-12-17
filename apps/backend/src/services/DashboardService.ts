import fs from "fs";
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

  async getDashboardStats(
    username: string,
    httpBaseURL: string
  ): Promise<DashboardStats> {
    const repos = await this.repoService.listRepos(username, httpBaseURL);
    const totalRepos = repos.length;

    let totalCommits = 0;
    let totalBranches = 0;
    const recentActivity: DashboardStats["recentActivity"] = [];

    // Get stats for each repository
    for (const repo of repos) {
      try {
        const repoName = repo.name;
        const repoPath = this.repoService.getRepoPath(username, repoName);

        if (!fs.existsSync(repoPath)) {
          continue;
        }

        // Get branches using GitService
        let branchInfo;
        try {
          branchInfo = await this.gitService.getBranches(username, repoName);
          const branchCount = branchInfo.branches.length;
          totalBranches += branchCount;
        } catch (err) {
          // Repo might be empty or have no branches
          branchInfo = {branches: [], current: null};
        }

        // Get commits count and latest commit
        try {
          // Get total commit count
          const commitCount = await this.gitService.getTotalCommitCount(
            username,
            repoName
          );
          totalCommits += commitCount;

          // Get latest commits for recent activity (only if there are commits)
          const commits =
            commitCount > 0
              ? await this.gitService.getCommits(username, repoName, 1)
              : [];

          // Get current branch name
          const currentBranch =
            branchInfo?.current || branchInfo?.branches[0] || "main";

          // Use the latest commit for recent activity
          if (commits.length > 0) {
            const latestCommit = commits[0];
            recentActivity.push({
              repo: repo.name,
              branch: currentBranch,
              lastCommit: {
                hash: latestCommit.hash,
                message: latestCommit.message,
                author: latestCommit.author || "Unknown",
                date: latestCommit.date,
              },
            });
          } else {
            // No commits found
            const currentBranch =
              branchInfo?.current || branchInfo?.branches[0] || "main";
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
              branchInfo?.current || branchInfo?.branches[0] || "main";
            recentActivity.push({
              repo: repo.name,
              branch: currentBranch,
              lastCommit: null,
            });
          } else {
            // Other error - repo might be empty or corrupted
            console.error(
              `Error getting commits for repo ${repo.name}:`,
              err
            );
            recentActivity.push({
              repo: repo.name,
              branch: branchInfo?.current || branchInfo?.branches[0] || "main",
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
