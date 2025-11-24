export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string; // <-- add this
  content?: string; // optional, for files
  children?: FileNode[];
}
