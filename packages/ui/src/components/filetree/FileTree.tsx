import {useState} from "react";
import {
  FolderIcon,
  DocumentIcon,
  CodeBracketIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
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
    <ul className="space-y-0.5">
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
  const [open, setOpen] = useState(level === 0);
  const indent = level * 16;

  // File icon/color mapping with theme colors
  const getFileAppearance = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    let icon = <DocumentIcon className="w-4 h-4 text-white/60" />;
    let textColor = "text-white/90";

    const map: Record<string, {icon: any; textColor: string}> = {
      js: {
        icon: <CodeBracketIcon className="w-4 h-4 text-yellow-400" />,
        textColor: "text-yellow-400",
      },
      ts: {
        icon: <CodeBracketIcon className="w-4 h-4 text-blue-400" />,
        textColor: "text-blue-400",
      },
      jsx: {
        icon: <CodeBracketIcon className="w-4 h-4 text-yellow-400" />,
        textColor: "text-yellow-400",
      },
      tsx: {
        icon: <CodeBracketIcon className="w-4 h-4 text-blue-400" />,
        textColor: "text-blue-400",
      },
      json: {
        icon: <DocumentIcon className="w-4 h-4 text-green-400" />,
        textColor: "text-green-400",
      },
      md: {
        icon: <DocumentIcon className="w-4 h-4 text-blue-400" />,
        textColor: "text-blue-400",
      },
      png: {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      },
      jpg: {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      },
      jpeg: {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      },
      svg: {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      },
      gif: {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      },
      env: {
        icon: <Cog6ToothIcon className="w-4 h-4 text-lime-400" />,
        textColor: "text-lime-400",
      },
      config: {
        icon: <Cog6ToothIcon className="w-4 h-4 text-lime-400" />,
        textColor: "text-lime-400",
      },
      yaml: {
        icon: <Cog6ToothIcon className="w-4 h-4 text-lime-400" />,
        textColor: "text-lime-400",
      },
      yml: {
        icon: <Cog6ToothIcon className="w-4 h-4 text-lime-400" />,
        textColor: "text-lime-400",
      },
    };

    return map[ext] ?? {icon, textColor};
  };

  // Folder icon/color mapping
  const getFolderAppearance = (name: string) => {
    const lower = name.toLowerCase();
    let icon = <FolderIcon className="w-4 h-4 text-white/70" />;
    let textColor = "text-white/90";

    if (lower.includes("src")) {
      icon = <FolderIcon className="w-4 h-4 text-blue-400" />;
      textColor = "text-blue-400";
    } else if (lower.includes("assets")) {
      icon = <FolderIcon className="w-4 h-4 text-pink-400" />;
      textColor = "text-pink-400";
    } else if (lower.includes("public")) {
      icon = <FolderIcon className="w-4 h-4 text-green-400" />;
      textColor = "text-green-400";
    } else if (lower.includes("config") || lower.includes("settings")) {
      icon = <FolderIcon className="w-4 h-4 text-purple-400" />;
      textColor = "text-purple-400";
    } else if (lower.includes("node_modules")) {
      icon = <FolderIcon className="w-4 h-4 text-yellow-400" />;
      textColor = "text-yellow-400";
    }

    return {icon, textColor};
  };

  if (node.type === "folder") {
    const {icon, textColor} = getFolderAppearance(node.name);
    return (
      <li>
        <div
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-app-surface/50 cursor-pointer select-none transition-colors"
          style={{paddingLeft: `${indent}px`}}
          onClick={() => setOpen(!open)}
        >
          <ChevronRightIcon
            className={`w-3 h-3 text-white/40 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          {icon}
          <span className={`text-sm font-medium ${textColor}`}>{node.name}</span>
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

  const {icon, textColor} = getFileAppearance(node.name);

  return (
    <li
      className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-app-surface/50 cursor-pointer transition-colors"
      style={{paddingLeft: `${indent + 20}px`}}
      onClick={() => onFileClick && onFileClick(node.path)}
    >
      {icon}
      <span className={`text-sm ${textColor}`}>{node.name}</span>
    </li>
  );
};
