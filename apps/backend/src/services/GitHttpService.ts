import {exec} from "child_process";
import {promisify} from "util";
import path from "path";
import fs from "fs";
import simpleGit from "simple-git";
import {REPO_DIR} from "../utils/config";

const execAsync = promisify(exec);

export class GitHttpService {
  private getRepoPath(repoName: string): string {
    return path.join(REPO_DIR, repoName);
  }

  async getInfoRefs(repoName: string, service: string): Promise<string> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git") ? repoName : `${repoName}.git`;
    const repoPath = this.getRepoPath(normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (service === "git-upload-pack" || service === "git-receive-pack") {
      // Git smart HTTP protocol
      // git-upload-pack and git-receive-pack are standalone executables, not git subcommands
      // Use absolute path and proper quoting for Windows compatibility
      const absoluteRepoPath = path.resolve(repoPath);
      const cmd = `${service} --stateless-rpc --advertise-refs "${absoluteRepoPath}"`;
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

  async handleUploadPack(repoName: string, rawBody: Buffer): Promise<any> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git") ? repoName : `${repoName}.git`;
    const repoPath = this.getRepoPath(normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (!rawBody) {
      throw new Error("Request body required");
    }

    // Use absolute path for Windows compatibility
    // git-upload-pack is a standalone executable, not a git subcommand
    const absoluteRepoPath = path.resolve(repoPath);
    const cmd = `git-upload-pack --stateless-rpc "${absoluteRepoPath}"`;
    return exec(cmd);
  }

  async handleReceivePack(repoName: string, rawBody: Buffer): Promise<any> {
    // Ensure repo name ends with .git
    const normalizedRepoName = repoName.endsWith(".git") ? repoName : `${repoName}.git`;
    const repoPath = this.getRepoPath(normalizedRepoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository not found");
    }

    if (!rawBody) {
      throw new Error("Request body required");
    }

    // Use absolute path for Windows compatibility
    // git-receive-pack is a standalone executable, not a git subcommand
    const absoluteRepoPath = path.resolve(repoPath);
    const cmd = `git-receive-pack --stateless-rpc "${absoluteRepoPath}"`;
    return exec(cmd);
  }
}

