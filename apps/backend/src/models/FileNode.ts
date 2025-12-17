export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string; // relative path from repo root
  content?: string; // only for files
  children?: FileNode[]; // only for folders
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}
