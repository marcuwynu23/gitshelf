import {Server as SshServer, ServerConfig} from "ssh2";
import {Connection} from "ssh2";
import {GitSshService, SshStream} from "./GitSshService";
import fs from "fs";
import path from "path";
import {generateKeyPairSync, createPrivateKey} from "crypto";
import {execSync} from "child_process";

export class SshServerService {
  private sshServer: SshServer;
  private gitSshService: GitSshService;
  private port: number;

  constructor(port: number = 22) {
    this.port = port;
    this.gitSshService = new GitSshService();
    this.sshServer = new SshServer(this.getServerConfig());
    this.setupEventHandlers();
  }

  private getServerConfig(): ServerConfig {
    // Try to load SSH host keys (if they exist)
    const hostKeyPath = process.env.SSH_HOST_KEY_PATH || path.join(process.cwd(), "ssh_host_rsa_key");
    let hostKey = this.loadHostKey(hostKeyPath);

    // If no host key found, generate one automatically
    if (!hostKey) {
      console.log("[SSH] No host key found, generating one automatically...");
      hostKey = this.generateHostKey(hostKeyPath);
    }

    if (!hostKey) {
      throw new Error(
        "Failed to load or generate SSH host key. " +
        "Please generate one manually with: ssh-keygen -t rsa -f ssh_host_rsa_key -N \"\""
      );
    }

    // ssh2 expects hostKeys as array of Buffer
    return {
      hostKeys: [hostKey],
    };
  }

  private loadHostKey(keyPath: string): Buffer | null {
    try {
      if (fs.existsSync(keyPath)) {
        const keyData = fs.readFileSync(keyPath);
        
        // Validate that it's a valid OpenSSH format key
        // ssh2 requires OpenSSH format (starts with "-----BEGIN OPENSSH PRIVATE KEY-----")
        // or traditional format (starts with "-----BEGIN RSA PRIVATE KEY-----")
        const keyString = keyData.toString();
        
        if (
          keyString.includes("-----BEGIN OPENSSH PRIVATE KEY-----") ||
          keyString.includes("-----BEGIN RSA PRIVATE KEY-----") ||
          keyString.includes("-----BEGIN EC PRIVATE KEY-----") ||
          keyString.includes("-----BEGIN PRIVATE KEY-----")
        ) {
          // Try to parse it to ensure it's valid
          try {
            createPrivateKey(keyData);
            return keyData;
          } catch (parseError) {
            console.warn(`[SSH] Existing key file is invalid, will regenerate:`, parseError);
            // Delete invalid key file
            try {
              fs.unlinkSync(keyPath);
            } catch {
              // Ignore deletion errors
            }
            return null;
          }
        } else {
          // Key is in wrong format, delete it
          console.warn(`[SSH] Key file is not in OpenSSH format, will regenerate`);
          try {
            fs.unlinkSync(keyPath);
          } catch {
            // Ignore deletion errors
          }
          return null;
        }
      }
    } catch (error) {
      console.warn(`Failed to load SSH host key from ${keyPath}:`, error);
    }
    return null;
  }

  private generateHostKey(keyPath: string): Buffer | null {
    // ssh2 library requires OpenSSH format keys
    // We MUST use ssh-keygen to generate proper OpenSSH format keys
    // Node.js crypto generates PKCS1/PKCS8 format which ssh2 cannot parse
    
    const keyDir = path.dirname(keyPath);
    if (!fs.existsSync(keyDir)) {
      fs.mkdirSync(keyDir, {recursive: true});
    }

    try {
      // Use ssh-keygen command to generate OpenSSH format key
      // -t rsa: RSA key type
      // -f: output file
      // -N "": no passphrase
      // -q: quiet mode
      execSync(`ssh-keygen -t rsa -f "${keyPath}" -N "" -q`, {
        stdio: "pipe",
        encoding: "utf-8",
      });

      if (fs.existsSync(keyPath)) {
        const keyBuffer = fs.readFileSync(keyPath);
        console.log(`[SSH] Generated host key using ssh-keygen: ${keyPath}`);
        return keyBuffer;
      }
    } catch (error: any) {
      // ssh-keygen not available or failed
      const errorMsg = error.message || String(error);
      console.error(`[SSH] Failed to generate host key with ssh-keygen: ${errorMsg}`);
      console.error(
        `[SSH] ssh-keygen is required to generate OpenSSH format keys.\n` +
        `Please install OpenSSH or generate the key manually:\n` +
        `  ssh-keygen -t rsa -f "${keyPath}" -N ""`
      );
      return null;
    }

    return null;
  }

  private setupEventHandlers(): void {
    this.sshServer.on("connection", (client: Connection, info) => {
      console.log(`[SSH] New connection from ${info.ip}:${info.port}`);

      client.on("authentication", (ctx) => {
        const username = ctx.username;

        if (ctx.method === "password") {
          // Password authentication
          if (this.gitSshService.authenticateUser(username, ctx.password)) {
            ctx.accept();
          } else {
            ctx.reject();
          }
        } else if (ctx.method === "publickey") {
          // Public key authentication
          if (this.gitSshService.validateSshKey(ctx.key.data, username)) {
            ctx.accept();
          } else {
            ctx.reject();
          }
        } else {
          // Reject other auth methods
          ctx.reject();
        }
      });

      client.on("ready", () => {
        console.log(`[SSH] Client authenticated: ${client.username()}`);

        client.on("session", (accept, reject) => {
          const session = accept();

          session.on("exec", (accept, reject, info) => {
            const stream = accept();
            const command = info.command;

            console.log(`[SSH] Exec command: ${command}`);

            try {
              // Parse git command
              // Format: git-upload-pack '/path/to/repo.git' or git-receive-pack '/path/to/repo.git'
              const match = command.match(/^git-(upload-pack|receive-pack)\s+['"](.+?)['"]$/);
              
              if (match) {
                const [, , repoPath] = match;
                // Extract repo name from path (handle both absolute and relative paths)
                const repoName = path.basename(repoPath).replace(/\.git$/, "");
                
                // Handle git command
                this.gitSshService.handleGitCommand(command, repoName, stream as SshStream);
              } else {
                // Unknown command - try to handle as shell command
                console.warn(`[SSH] Unknown command: ${command}`);
                stream.stderr.write(`Unknown command: ${command}\n`);
                stream.exit(1);
                stream.end();
              }
            } catch (error: any) {
              console.error("[SSH] Error executing command:", error);
              if (stream.stderr) {
                stream.stderr.write(`Error: ${error.message}\n`);
              }
              stream.exit(1);
              stream.end();
            }
          });
        });
      });

      client.on("error", (error) => {
        console.error("[SSH] Client error:", error);
      });
    });

    this.sshServer.on("error", (error) => {
      console.error("[SSH] Server error:", error);
    });
  }

  start(): void {
    this.sshServer.listen(this.port, "0.0.0.0", () => {
      console.log(`SSH server listening on port ${this.port}...`);
      console.log(`Note: SSH requires proper host keys. Generate them with:`);
      console.log(`  ssh-keygen -t rsa -f ssh_host_rsa_key -N ""`);
    });
  }

  stop(): void {
    this.sshServer.close();
  }
}

