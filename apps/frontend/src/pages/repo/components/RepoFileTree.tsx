import {useState, useEffect} from "react";
import {useRepoStore} from "~/stores/repoStore";
import type {FC} from "react";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {FileTree} from "@myapp/ui";
import type {FileNode} from "@myapp/ui";
import {Button} from "~/components/ui";
import {EyeIcon, CodeBracketIcon} from "@heroicons/react/24/outline";

export interface RepoFileTreeProps {
  selectedRepo: string | null;
  fileTree: FileNode[];
  currentBranch: string | null;
}

export const RepoFileTree: FC<RepoFileTreeProps> = ({
  selectedRepo,
  fileTree,
  currentBranch,
}) => {
  const fetchFileContent = useRepoStore((state) => state.fetchFileContent);
  const fileContent = useRepoStore((state) => state.fileContent);
  const selectedFile = useRepoStore((state) => state.selectedFile);
  const setSelectedFile = useRepoStore((state) => state.setSelectedFile);

  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [readmeFile, setReadmeFile] = useState<string | null>(null);

  const handleFileClick = async (filePath: string) => {
    await fetchFileContent(filePath);
    setSelectedFile(filePath);
    setViewMode("preview");
  };

  const displayName = (name: string) => name.replace(/\.git$/, "");

  // Check if README.md exists in root
  useEffect(() => {
    if (!selectedFile && fileTree.length) {
      const readmeNode = fileTree.find(
        (node) => node.type === "file" && /^README\.md$/i.test(node.name)
      );
      if (readmeNode) {
        setReadmeFile(readmeNode.path);
        fetchFileContent(readmeNode.path);
      } else {
        setReadmeFile(null);
      }
    }
  }, [fileTree, selectedFile, fetchFileContent]);

  if (selectedFile) {
    const content = fileContent[selectedFile] || "";
    const isMarkdown = selectedFile.endsWith(".md");

    return (
      <div className="w-full h-full flex flex-col">
        {/* File Header */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pb-4 border-b border-[#3d3d3d]">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-[#e8e8e8] truncate">
              {selectedFile.split("/").pop() || selectedFile}
            </h2>
          </div>

          {isMarkdown && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={viewMode === "preview" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setViewMode("preview")}
              >
                <EyeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                variant={viewMode === "raw" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setViewMode("raw")}
              >
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
                <MonacoEditor
                  height="100%"
                  language="markdown"
                  theme="vs-dark"
                  value={content}
                  options={{readOnly: true}}
                />
              </div>
            )
          ) : (
            <div className="h-full">
              <MonacoEditor
                height="100%"
                language="text"
                theme="vs-dark"
                value={content}
                options={{readOnly: true}}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File Tree Section */}
      <div className="flex-1 overflow-auto mb-6">
        {fileTree.length ? (
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
            <FileTree nodes={fileTree} onFileClick={handleFileClick} />
          </div>
        ) : (
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-8 text-center">
            <p className="text-[#808080] text-sm">No files found</p>
          </div>
        )}
      </div>

      {/* README Preview */}
      {readmeFile && fileContent[readmeFile] && (
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#e8e8e8] mb-4 uppercase tracking-wider">
            README
          </h3>
          <div className="markdown-body">
            <ReactMarkdown>{fileContent[readmeFile]}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
