import { ChevronRightIcon, CodeBracketIcon, Cog6ToothIcon, DocumentIcon, FolderIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  // optional commit info (populated by backend)
  lastCommitMsg?: string | null;
  lastCommitTime?: string | null; // ISO 8601
}

interface FileTreeProps {
  nodes: FileNode[];
  onFileClick?: (filePath: string) => void;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileClick, level = 0 }) => {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <FileNodeItem key={node.path} node={node} onFileClick={onFileClick} level={level} />
      ))}
    </ul>
  );
};

const FileNodeItem: React.FC<{
  node: FileNode;
  onFileClick?: (filePath: string) => void;
  level: number;
}> = ({ node, onFileClick, level }) => {
  const [open, setOpen] = useState(level === 0);
  const indent = level * 16;

  // File icon/color mapping with theme colors
  const getFileAppearance = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    let icon = <DocumentIcon className="w-4 h-4 text-white/60" />;
    let textColor = "text-white/90";

    const map: Record<string, { icon: any; textColor: string }> = {
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

    return map[ext] ?? { icon, textColor };
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

    return { icon, textColor };
  };

  if (node.type === "folder") {
    const { icon, textColor } = getFolderAppearance(node.name);
    return (
      <li>
        <div
          className="flex items-center justify-between gap-2 py-1 px-2 rounded-md hover:bg-app-surface/50 cursor-pointer select-none transition-colors"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-1.5">
            <ChevronRightIcon className={`w-3 h-3 text-white/40 transition-transform ${open ? "rotate-90" : ""}`} />
            {icon}
            <span className={`text-sm font-medium ${textColor}`}>{node.name}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 opacity-60 text-sm">
            <span className="text-ellipsis max-w-[28ch]">—</span>
            <span className="text-xs text-white/50">—</span>
          </div>
        </div>
        {open && node.children && <FileTree nodes={node.children} onFileClick={onFileClick} level={level + 1} />}
      </li>
    );
  }

  const { icon, textColor } = getFileAppearance(node.name);

  const formatRelative = (iso?: string | null) => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then; // ms
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    const y = Math.floor(mo / 12);
    return `${y}y ago`;
  };

  return (
    <li
      className="flex items-center justify-between gap-2 py-1 px-2 rounded-md hover:bg-app-surface/50 cursor-pointer transition-colors"
      style={{ paddingLeft: `${indent + 20}px` }}
      onClick={() => onFileClick && onFileClick(node.path)}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {icon}
        <span className={`text-sm ${textColor} truncate`}>{node.name}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0 text-sm opacity-80">
        <span className="max-w-[40ch] overflow-hidden text-ellipsis whitespace-nowrap block text-white/90">{node.lastCommitMsg ?? ""}</span>
        <span className="text-xs text-white/90">{formatRelative(node.lastCommitTime)}</span>
      </div>
    </li>
  );
};
