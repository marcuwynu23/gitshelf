export interface RepoItem {
  name: string;
  sshAddress: string | null;
  httpAddress: string;
}

export interface CreateRepoRequest {
  name: string;
}

export interface CreateRepoResponse {
  message: string;
  name: string;
}
