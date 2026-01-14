export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string; // relative path from repo root
  content?: string; // only for files
  children?: FileNode[]; // only for folders
  // Optional last commit info (for files; folders may be null)
  lastCommitMsg?: string | null;
  lastCommitTime?: string | null; // ISO 8601
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
  lastCommitMsg?: string | null;
  lastCommitTime?: string | null;
}
