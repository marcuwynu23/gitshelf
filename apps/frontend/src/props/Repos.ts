export interface RepoItem {
  name: string;
  sshAddress: string | null;
  httpAddress: string | null;
  title?: string;
  description?: string;
}
