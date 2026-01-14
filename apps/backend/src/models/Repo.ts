export interface RepoItem {
  name: string;
  sshAddress: string | null;
  httpAddress: string;
  title?: string;
  description?: string;
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
  title?: string;
  description?: string;
}
