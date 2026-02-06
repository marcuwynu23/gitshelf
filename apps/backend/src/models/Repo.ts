export interface RepoItem {
  name: string;
  sshAddress: string | null;
  httpAddress: string;
  title?: string | null;
  description?: string | null;
}

export interface CreateRepoRequest {
  name: string;
  title?: string;
  description?: string;
}

export interface CreateRepoResponse {
  message: string;
  name: string;
}

export interface RepoMetadata {
  title?: string | null;
  description?: string | null;
}
