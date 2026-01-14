import {exec} from "child_process";
import {promisify} from "util";
import path from "path";
import fs from "fs";
import simpleGit from "simple-git";
import {getUserRepoDir} from "../utils/config";

const execAsync = promisify(exec);

export class GitHttpService {
  private getRepoPath(username: string, repoName: string): string {
    const repoDir = getUserRepoDir(username);
    return path.join(repoDir, repoName);
  }

  async getInfoRefs(
    username: string,
    repoName: string,
    service: string
  ): Promise<string> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git")
      ? repoName
      : `${repoName}.git`;
    const repoPath = this.getRepoPath(username, normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (service === "git-upload-pack" || service === "git-receive-pack") {
      // Git smart HTTP protocol
      // Use git command with subcommand instead of direct executable
      const absoluteRepoPath = path.resolve(repoPath);
      const subcommand = service.replace("git-", "");
      const cmd = `git ${subcommand} --stateless-rpc --advertise-refs "${absoluteRepoPath}"`;
      try {
        const {stdout} = await execAsync(cmd);
        return stdout;
      } catch (err: any) {
        console.error(`Git command failed: ${cmd}`, err);
        throw new Error(`Git command failed: ${err.message}`);
      }
    } else {
      // Dumb HTTP protocol (fallback)
      const git = simpleGit(repoPath);
      const refs = await git.raw(["show-ref"]);
      return refs;
    }
  }

  async handleUploadPack(
    username: string,
    repoName: string,
    rawBody: Buffer
  ): Promise<any> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git")
      ? repoName
      : `${repoName}.git`;
    const repoPath = this.getRepoPath(username, normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (!rawBody) {
      throw new Error("Request body required");
    }

    // Use git command with upload-pack subcommand
    const absoluteRepoPath = path.resolve(repoPath);
    const cmd = `git upload-pack --stateless-rpc "${absoluteRepoPath}"`;
    return exec(cmd);
  }

  async handleReceivePack(
    userId: string,
    repoName: string,
    rawBody: Buffer
  ): Promise<any> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git")
      ? repoName
      : `${repoName}.git`;
    const repoPath = this.getRepoPath(userId, normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (!rawBody) {
      throw new Error("Request body required");
    }

    // Use git command with receive-pack subcommand
    const absoluteRepoPath = path.resolve(repoPath);
    const cmd = `git receive-pack --stateless-rpc "${absoluteRepoPath}"`;
    return exec(cmd);
  }
}
