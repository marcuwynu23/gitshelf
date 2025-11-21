// FileTree.tsx
import {useState} from "react";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
}

export const FileTree: React.FC<FileTreeProps> = ({nodes}) => {
  return (
    <ul className="pl-4">
      {nodes.map((node) => (
        <FileNodeItem key={node.name} node={node} />
      ))}
    </ul>
  );
};

const FileNodeItem: React.FC<{node: FileNode}> = ({node}) => {
  const [open, setOpen] = useState(false);

  if (node.type === "folder") {
    return (
      <li className="mb-1">
        <div
          className="flex items-center cursor-pointer select-none hover:text-blue-500"
          onClick={() => setOpen(!open)}
        >
          <span className="mr-2">{open ? "📂" : "📁"}</span>
          {node.name}
        </div>
        {open && node.children && <FileTree nodes={node.children} />}
      </li>
    );
  }

  return (
    <li className="flex items-center mb-1 pl-6 hover:text-gray-700">
      <span className="mr-2">📄</span>
      {node.name}
    </li>
  );
};
