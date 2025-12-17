# SSH Server Setup for Git Operations

The backend now supports SSH-based Git operations (clone, push, pull) in addition to HTTP/HTTPS.

## Installation

Install the required SSH dependency:

```bash
npm install ssh2 @types/ssh2
```

## Configuration

Add these environment variables to your `.env` file:

```env
# SSH Server Configuration
SSH_PORT=2222                    # SSH server port (default: 2222)
SSH_HOST=localhost               # SSH server hostname for SSH URLs
SSH_HOST_KEY_PATH=./ssh_host_rsa_key  # Path to SSH host key (optional)
ENABLE_SSH=true                  # Set to "false" to disable SSH server
```

## Generate SSH Host Key

Generate an SSH host key for the server:

```bash
ssh-keygen -t rsa -f ssh_host_rsa_key -N ""
```

This creates:
- `ssh_host_rsa_key` (private key)
- `ssh_host_rsa_key.pub` (public key)

**Important**: Keep the private key secure and never commit it to version control.

## Usage

### Cloning via SSH

```bash
git clone ssh://localhost:2222/repo.git
```

Or using the standard SSH format:

```bash
git clone ssh://user@localhost:2222/repo.git
```

### Pushing via SSH

```bash
git remote add origin ssh://localhost:2222/repo.git
git push origin main
```

## Authentication

Currently, the SSH server accepts:
- **Password authentication**: Any username/password (for development)
- **Public key authentication**: Any SSH key (for development)

**⚠️ Security Warning**: The current implementation is for development only. For production:

1. Implement proper user authentication
2. Validate SSH keys against an authorized_keys file
3. Use proper password hashing
4. Implement rate limiting
5. Use proper SSH host keys

## Extending Authentication

To implement proper authentication, modify:

1. `GitSshService.authenticateUser()` - Add user/password validation
2. `GitSshService.validateSshKey()` - Add SSH key validation against authorized_keys

Example:

```typescript
authenticateUser(username: string, password?: string): boolean {
  // Validate against database or config
  const users = process.env.SSH_USERS?.split(',') || [];
  return users.includes(username);
}

validateSshKey(key: Buffer, username: string): boolean {
  // Read authorized_keys file
  const authorizedKeysPath = path.join(process.cwd(), 'authorized_keys');
  const authorizedKeys = fs.readFileSync(authorizedKeysPath, 'utf-8');
  // Validate key against authorized_keys
  // ...
}
```

## Troubleshooting

### SSH server fails to start

- Check if port is already in use
- Ensure SSH host key exists (or generate one)
- Check logs for specific error messages

### Connection refused

- Verify SSH_PORT is correct
- Check firewall settings
- Ensure SSH server is enabled (ENABLE_SSH=true)

### Authentication fails

- Check authentication method (password vs publickey)
- Verify SSH key format
- Check server logs for authentication errors

