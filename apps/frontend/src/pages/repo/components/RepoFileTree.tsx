import { CodeBracketIcon, EyeIcon } from "@heroicons/react/24/outline";
import MonacoEditor from "@monaco-editor/react";
import type { FileNode } from "@myapp/ui";
import { FileTree } from "@myapp/ui";
import type { FC } from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "~/components/ui";
import { useRepoStore } from "~/stores/repoStore";

export interface RepoFileTreeProps {
  selectedRepo: string | null;
  fileTree: FileNode[];
  currentBranch: string | null;
}

export const RepoFileTree: FC<RepoFileTreeProps> = ({ selectedRepo, fileTree, currentBranch }) => {
  const fetchFileContent = useRepoStore((state) => state.fetchFileContent);
  const fileContent = useRepoStore((state) => state.fileContent);
  const selectedFile = useRepoStore((state) => state.selectedFile);
  const setSelectedFile = useRepoStore((state) => state.setSelectedFile);

  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [readmeFile, setReadmeFile] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<"files" | "readme">("files");

  const handleFileClick = async (filePath: string) => {
    await fetchFileContent(filePath);
    setSelectedFile(filePath);
    setViewMode("preview");
  };

  // Check if README.md exists in root
  useEffect(() => {
    if (!selectedFile && fileTree.length) {
      const readmeNode = fileTree.find((node) => node.type === "file" && /^README\.md$/i.test(node.name));
      if (readmeNode) {
        setReadmeFile(readmeNode.path);
        fetchFileContent(readmeNode.path);
      } else {
        setReadmeFile(null);
      }
    }
  }, [fileTree, selectedFile, fetchFileContent]);

  // Normalize fileTree nodes to ensure `path` exists for keys and nested children
  const normalizeNodes = (nodes: FileNode[], parentPath = ""): FileNode[] => {
    return nodes.map((n) => {
      const path = n.path || (parentPath ? `${parentPath}/${n.name}` : n.name);
      const children = n.children && n.children.length ? normalizeNodes(n.children, path) : undefined;
      return { ...n, path, children };
    });
  };

  const normalizedTree = Array.isArray(fileTree) ? normalizeNodes(fileTree) : [];

  // Debug logs to help identify mount/unmount and data state
  useEffect(() => {
    console.log("RepoFileTree mounted/updated", {
      selectedRepo,
      selectedFile,
      normalizedTreeLength: normalizedTree.length,
    });
    return () => console.log("RepoFileTree unmounted", { selectedRepo });
  }, [selectedRepo, selectedFile, normalizedTree.length]);

  // Default panel when README appears
  useEffect(() => {
    if (readmeFile && fileContent[readmeFile]) {
      setPanelView("readme");
    } else {
      setPanelView("files");
    }
  }, [readmeFile, fileContent]);

  if (selectedFile) {
    const content = fileContent[selectedFile] || "";
    const isMarkdown = selectedFile.endsWith(".md");
    const getLanguageFromFilename = (name: string) => {
      const ext = name.split(".").pop()?.toLowerCase() || "";
      switch (ext) {
        case "ts":
        case "tsx":
          return "typescript";
        case "js":
        case "jsx":
          return "javascript";
        case "mjs":
          return "javascript";
        case "cjs":
          return "javascript";
        case "py":
          return "python";
        case "java":
          return "java";
        case "go":
          return "go";
        case "cs":
          return "csharp";
        case "cpp":
        case "cc":
        case "cxx":
          return "cpp";
        case "c":
          return "c";
        case "rs":
          return "rust";
        case "rb":
          return "ruby";
        case "php":
          return "php";
        case "json":
          return "json";
        case "css":
          return "css";
        case "scss":
          return "scss";
        case "html":
        case "htm":
          return "html";
        case "xml":
          return "xml";
        case "sh":
        case "bash":
          return "shell";
        case "yml":
        case "yaml":
          return "yaml";
        case "md":
          return "markdown";
        default:
          return "plaintext";
      }
    };
    const language = isMarkdown ? "markdown" : getLanguageFromFilename(selectedFile);

    return (
      <div className="flex-1 w-full h-full flex flex-col">
        {/* File Header */}
        <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pb-2">
          {isMarkdown && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant={viewMode === "preview" ? "primary" : "secondary"} size="sm" onClick={() => setViewMode("preview")}>
                <EyeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button variant={viewMode === "raw" ? "primary" : "secondary"} size="sm" onClick={() => setViewMode("raw")}>
                <CodeBracketIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Raw</span>
              </Button>
            </div>
          )}
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-auto bg-app-surface border border-[#3d3d3d] rounded-lg">
          {isMarkdown ? (
            viewMode === "preview" ? (
              <div className="markdown-body p-6">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full">
                <MonacoEditor height="100%" language={language} theme="vs-dark" value={content} options={{ readOnly: true }} />
              </div>
            )
          ) : (
            <div className="h-full">
              <MonacoEditor height="100%" language={language} theme="vs-dark" value={content} options={{ readOnly: true }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Panel switcher (README / Files) - defaults to README when present */}
      {readmeFile && fileContent[readmeFile] && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setPanelView("readme")}
            className={`px-3 py-1 rounded ${panelView === "readme" ? "bg-app-accent text-black" : "bg-app-surface"}`}
          >
            README
          </button>
          <button
            onClick={() => setPanelView("files")}
            className={`px-3 py-1 rounded ${panelView === "files" ? "bg-app-accent text-black" : "bg-app-surface"}`}
          >
            Files
          </button>
        </div>
      )}

      {/* Main panel area */}
      <div className="flex-1 min-h-0 overflow-auto mb-6">
        {panelView === "files" ? (
          normalizedTree.length ? (
            <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
              <FileTree nodes={normalizedTree} onFileClick={handleFileClick} />
            </div>
          ) : (
            <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-8 text-center">
              <p className="text-[#808080] text-sm">No files found</p>
            </div>
          )
        ) : (
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#e8e8e8] mb-4 uppercase tracking-wider">README</h3>
            <div className="markdown-body max-h-96 overflow-auto">
              <ReactMarkdown>{fileContent[readmeFile!]}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
