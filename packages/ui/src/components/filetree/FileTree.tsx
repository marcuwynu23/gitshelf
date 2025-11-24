import {useState} from "react";
import {
  FolderIcon,
  DocumentIcon,
  CodeBracketIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  onFileClick?: (filePath: string) => void;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  onFileClick,
  level = 0,
}) => {
  return (
    <ul className="pl-0">
      {nodes.map((node) => (
        <FileNodeItem
          key={node.path}
          node={node}
          onFileClick={onFileClick}
          level={level}
        />
      ))}
    </ul>
  );
};

const FileNodeItem: React.FC<{
  node: FileNode;
  onFileClick?: (filePath: string) => void;
  level: number;
}> = ({node, onFileClick, level}) => {
  const [open, setOpen] = useState(false);
  const indent = `${level * 1}rem`;

  // --- File icon/color mapping ---
  const getFileAppearance = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    let color = "#e5e7eb"; // default gray
    let icon = <DocumentIcon className="w-5 h-5 mr-2 text-white" />;

    const map: Record<string, {color: string; icon: any}> = {
      js: {
        color: "#facc15",
        icon: <CodeBracketIcon className="w-5 h-5 mr-2 text-yellow-400" />,
      },
      ts: {
        color: "#3b82f6",
        icon: <CodeBracketIcon className="w-5 h-5 mr-2 text-blue-500" />,
      },
      jsx: {
        color: "#facc15",
        icon: <CodeBracketIcon className="w-5 h-5 mr-2 text-yellow-400" />,
      },
      tsx: {
        color: "#3b82f6",
        icon: <CodeBracketIcon className="w-5 h-5 mr-2 text-blue-500" />,
      },
      json: {
        color: "#34d399",
        icon: <DocumentIcon className="w-5 h-5 mr-2 text-green-400" />,
      },
      md: {
        color: "#60a5fa",
        icon: <DocumentIcon className="w-5 h-5 mr-2 text-blue-400" />,
      },
      png: {
        color: "#f472b6",
        icon: <PhotoIcon className="w-5 h-5 mr-2 text-pink-400" />,
      },
      jpg: {
        color: "#f472b6",
        icon: <PhotoIcon className="w-5 h-5 mr-2 text-pink-400" />,
      },
      jpeg: {
        color: "#f472b6",
        icon: <PhotoIcon className="w-5 h-5 mr-2 text-pink-400" />,
      },
      svg: {
        color: "#f472b6",
        icon: <PhotoIcon className="w-5 h-5 mr-2 text-pink-400" />,
      },
      gif: {
        color: "#f472b6",
        icon: <PhotoIcon className="w-5 h-5 mr-2 text-pink-400" />,
      },
      env: {
        color: "#a3e635",
        icon: <Cog6ToothIcon className="w-5 h-5 mr-2 text-lime-400" />,
      },
      config: {
        color: "#a3e635",
        icon: <Cog6ToothIcon className="w-5 h-5 mr-2 text-lime-400" />,
      },
      yaml: {
        color: "#a3e635",
        icon: <Cog6ToothIcon className="w-5 h-5 mr-2 text-lime-400" />,
      },
      yml: {
        color: "#a3e635",
        icon: <Cog6ToothIcon className="w-5 h-5 mr-2 text-lime-400" />,
      },
    };

    return map[ext] ?? {color, icon};
  };

  // --- Folder icon/color mapping ---
  const getFolderAppearance = (name: string) => {
    const lower = name.toLowerCase();
    let color = "#d1d5db"; // default gray
    let icon = <FolderIcon className="w-5 h-5 mr-2 text-gray-300" />;

    if (lower.includes("src")) {
      color = "#93c5fd"; // blue
      icon = <FolderIcon className="w-5 h-5 mr-2 text-blue-300" />;
    } else if (lower.includes("assets")) {
      color = "#f472b6"; // pink
      icon = <FolderIcon className="w-5 h-5 mr-2 text-pink-400" />;
    } else if (lower.includes("public")) {
      color = "#34d399"; // green
      icon = <FolderIcon className="w-5 h-5 mr-2 text-green-400" />;
    } else if (lower.includes("config") || lower.includes("settings")) {
      color = "#a78bfa"; // purple
      icon = <FolderIcon className="w-5 h-5 mr-2 text-purple-400" />;
    } else if (lower.includes("node_modules")) {
      color = "#fbbf24"; // yellow
      icon = <FolderIcon className="w-5 h-5 mr-2 text-yellow-400" />;
    }

    return {color, icon};
  };

  if (node.type === "folder") {
    const {color, icon} = getFolderAppearance(node.name);
    return (
      <li className="mb-1">
        <div
          className="flex items-center cursor-pointer select-none"
          style={{paddingLeft: indent, color}}
          onClick={() => setOpen(!open)}
        >
          {icon}
          <span className="text-xs">{node.name}</span>
        </div>
        {open && node.children && (
          <FileTree
            nodes={node.children}
            onFileClick={onFileClick}
            level={level + 1}
          />
        )}
      </li>
    );
  }

  const {color, icon} = getFileAppearance(node.name);

  return (
    <li
      className="flex items-center mb-1 cursor-pointer"
      style={{paddingLeft: indent}}
      onClick={() => onFileClick && onFileClick(node.path)}
    >
      {icon}
      <span className="text-xs" style={{color}}>
        {node.name}
      </span>
    </li>
  );
};
