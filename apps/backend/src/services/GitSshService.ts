import {exec} from "child_process";
import path from "path";
import fs from "fs";
import {BASE_REPO_DIR as REPO_DIR} from "../utils/config";

export interface SshStream extends NodeJS.WritableStream {
  stderr?: NodeJS.WritableStream;
  exit?: (code: number) => void;
}

export class GitSshService {
  private getRepoPath(repoName: string): string {
    // Normalize repo name (ensure it ends with .git)
    const normalizedRepoName = repoName.endsWith(".git") ? repoName : `${repoName}.git`;
    return path.join(REPO_DIR, normalizedRepoName);
  }

  private validateRepo(repoName: string): void {
    const repoPath = this.getRepoPath(repoName);
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository '${repoName}' not found`);
    }
  }

  handleGitCommand(
    command: string,
    repoName: string,
    stream: SshStream
  ): void {
    // Parse git command (e.g., "git-upload-pack '/path/to/repo.git'")
    const match = command.match(/^git-(upload-pack|receive-pack)\s+['"](.+?)['"]$/);
    if (!match) {
      throw new Error(`Invalid git command: ${command}`);
    }

    const [, gitCommand] = match;
    const normalizedRepoName = repoName.endsWith(".git") ? repoName : `${repoName}.git`;

    this.validateRepo(normalizedRepoName);

    const repoPathAbsolute = path.resolve(this.getRepoPath(normalizedRepoName));
    const fullCommand = `git-${gitCommand} --stateless-rpc "${repoPathAbsolute}"`;

    console.log(`[SSH] Executing: ${fullCommand}`);

    // Execute git command and pipe output
    const childProcess = exec(fullCommand, {
      env: {
        ...process.env,
        GIT_DIR: repoPathAbsolute,
      },
    });

    // Pipe stdin from SSH stream to git process
    if (childProcess.stdin) {
      // The stream is writable, but we need to read from it
      // In SSH2, the exec stream is both readable and writable
      (stream as any).pipe(childProcess.stdin);
    }

    // Pipe git process stdout to SSH stream
    if (childProcess.stdout) {
      childProcess.stdout.pipe(stream as any);
    }

    // Handle stderr
    if (childProcess.stderr) {
      if (stream.stderr) {
        childProcess.stderr.pipe(stream.stderr);
      } else {
        childProcess.stderr.on("data", (data) => {
          console.error(`Git SSH stderr (${gitCommand}):`, data.toString());
        });
      }
    }

    childProcess.on("error", (error) => {
      console.error(`Git SSH command error (${gitCommand}):`, error);
      if (stream.exit) {
        stream.exit(1);
      }
      stream.end();
    });

    childProcess.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Git SSH command exited with code ${code} (${gitCommand})`);
      }
      if (stream.exit) {
        stream.exit(code || 0);
      }
      stream.end();
    });
  }

  // Simple authentication - can be extended with key-based auth
  authenticateUser(username: string, password?: string): boolean {
    // For now, allow any user (can be extended with proper auth)
    // In production, implement proper SSH key authentication
    return true;
  }

  // Validate SSH key (placeholder - implement proper key validation)
  validateSshKey(key: Buffer, username: string): boolean {
    // TODO: Implement proper SSH key validation
    // For now, allow all keys (not secure for production)
    return true;
  }
}
