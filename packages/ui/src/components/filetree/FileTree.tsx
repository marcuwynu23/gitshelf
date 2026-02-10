import {
  ChevronRightIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  FolderIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import React, {useState} from "react";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  lastCommitMsg?: string | null;
  lastCommitTime?: string | null; // ISO 8601
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

type Appearance = {
  icon: React.ReactNode;
  textColor: string;
};

function getBaseName(pathOrName: string) {
  return pathOrName.split("/").pop() || pathOrName;
}

function getDeviconClassForFile(name: string): string | null {
  const base = getBaseName(name);
  const lowerBase = base.toLowerCase();

  // Special-case common tool files with no extension
  if (lowerBase === "jenkinsfile") return "devicon-jenkins-plain";
  if (lowerBase === "dockerfile") return "devicon-docker-plain";

  // Common config filenames (optional, but nice)
  if (lowerBase === "package.json") return "devicon-nodejs-plain";
  if (lowerBase === "go.mod") return "devicon-go-plain";
  if (lowerBase === "composer.json") return "devicon-php-plain";
  if (lowerBase === "requirements.txt") return "devicon-python-plain";

  const ext = base.includes(".")
    ? (base.split(".").pop()?.toLowerCase() ?? "")
    : "";

  switch (ext) {
    // JS/TS
    case "ts":
    case "tsx":
      return "devicon-typescript-plain";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "devicon-javascript-plain";

    // Backend languages
    case "py":
      return "devicon-python-plain";
    case "go":
      return "devicon-go-plain";
    case "java":
      return "devicon-java-plain";
    case "cs":
      return "devicon-csharp-plain";
    case "php":
      return "devicon-php-plain";
    case "rb":
      return "devicon-ruby-plain";
    case "rs":
      return "devicon-rust-plain";

    // Web
    case "html":
    case "htm":
      return "devicon-html5-plain";
    case "css":
      return "devicon-css3-plain";
    case "scss":
      return "devicon-sass-original";

    // Data / configs
    case "json":
      return "devicon-json-plain";
    case "yml":
    case "yaml":
      return "devicon-yaml-plain";
    case "xml":
      return "devicon-xml-plain";

    // Shell
    case "sh":
    case "bash":
      return "devicon-bash-plain";

    // Markdown (Devicon doesn't really have MD; keep fallback)
    default:
      return null;
  }
}

function Devicon({klass, title}: {klass: string; title?: string}) {
  // "colored" uses Devicon’s built-in colors; remove if you prefer monochrome.
  return (
    <i
      className={`${klass} colored text-base leading-none`}
      aria-hidden="true"
      title={title}
      data-testid={`devicon:${klass}`}
    />
  );
}

const FileNodeItem: React.FC<{
  node: FileNode;
  onFileClick?: (filePath: string) => void;
  level: number;
}> = ({node, onFileClick, level}) => {
  const [open, setOpen] = useState(false);
  const indent = level * 16;

  const getFileAppearance = (name: string): Appearance => {
    const ext = getBaseName(name).split(".").pop()?.toLowerCase() ?? "";
    const deviconClass = getDeviconClassForFile(name);

    // Images keep Heroicons
    const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);
    if (isImage) {
      return {
        icon: <PhotoIcon className="w-4 h-4 text-pink-400" />,
        textColor: "text-pink-400",
      };
    }

    // Env/config keep Heroicons
    const isEnvish =
      ext === "env" ||
      ext === "config" ||
      ext === "yml" ||
      ext === "yaml" ||
      ext === "ini" ||
      ext === "toml";
    if (isEnvish) {
      return {
        icon: <Cog6ToothIcon className="w-4 h-4 text-lime-400" />,
        textColor: "text-lime-400",
      };
    }

    // Use Devicon when available
    if (deviconClass) {
      return {
        icon: <Devicon klass={deviconClass} title={name} />,
        textColor: "text-text-primary",
      };
    }

    // Fallback to generic code icon
    return {
      icon: <CodeBracketIcon className="w-4 h-4 text-text-tertiary" />,
      textColor: "text-text-primary",
    };
  };

  const getFolderAppearance = (name: string) => {
    const lower = name.toLowerCase();
    let icon = <FolderIcon className="w-4 h-4 text-text-secondary" />;
    let textColor = "text-text-primary";

    if (lower.includes("src")) {
      icon = <FolderIcon className="w-4 h-4 text-app-accent" />;
      textColor = "text-app-accent";
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

  const formatRelative = (iso?: string | null) => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
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

  if (node.type === "folder") {
    const {icon, textColor} = getFolderAppearance(node.name);
    return (
      <li>
        <div
          className="flex items-center justify-between gap-2 py-2 px-2 rounded-md hover:bg-app-hover cursor-pointer select-none transition-colors"
          style={{paddingLeft: `${indent}px`}}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <ChevronRightIcon
              className={`w-3 h-3 text-text-tertiary transition-transform ${open ? "rotate-90" : ""}`}
            />
            {icon}
            <span className={`text-sm font-medium ${textColor} truncate`}>
              {node.name}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0 opacity-60 text-sm">
            <span className="text-ellipsis max-w-[28ch]">—</span>
            <span className="text-xs text-text-tertiary">—</span>
          </div>
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
      className="flex items-center justify-between gap-2 py-2 px-2 rounded-md hover:bg-app-hover cursor-pointer transition-colors"
      style={{paddingLeft: `${indent + 20}px`}}
      onClick={() => onFileClick && onFileClick(node.path)}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {icon}
        <span className={`text-sm ${textColor} truncate`}>{node.name}</span>
      </div>

      <div className="hidden sm:flex items-center gap-4 shrink-0 text-sm opacity-80">
        <span
          className="whitespace-nowrap block text-text-primary"
          title={node.lastCommitMsg ?? ""}
        >
          {node.lastCommitMsg && node.lastCommitMsg.length > 25
            ? `${node.lastCommitMsg.slice(0, 25)}...`
            : (node.lastCommitMsg ?? "")}
        </span>
        <span className="text-xs text-text-primary">
          {formatRelative(node.lastCommitTime)}
        </span>
      </div>
    </li>
  );
};
