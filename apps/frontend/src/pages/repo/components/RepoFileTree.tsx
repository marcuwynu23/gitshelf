import {useState, useEffect} from "react";
import {useRepoStore} from "~/stores/repoStore";
import type {FC} from "react";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {FileTree} from "@myapp/ui"; // import from your UI package
import type {FileNode} from "@myapp/ui";

export interface RepoFileTreeProps {
  selectedRepo: string | null;
  fileTree: FileNode[]; // must match the FileTree Node type from @myapp/ui
  currentBranch: string | null;
}

export const RepoFileTree: FC<RepoFileTreeProps> = ({
  selectedRepo,
  fileTree,
  currentBranch,
}) => {
  const fetchFileContent = useRepoStore((state) => state.fetchFileContent);
  const fileContent = useRepoStore((state) => state.fileContent);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [readmeFile, setReadmeFile] = useState<string | null>(null);

  const handleFileClick = async (filePath: string) => {
    await fetchFileContent(filePath);
    setSelectedFile(filePath);
    setViewMode("preview");
  };
  const displayName = (name: string) => name.replace(/\.git$/, ""); // remove .git
  const handleBack = () => setSelectedFile(null);

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
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2">
          <button
            className="px-4 py-1 bg-green-200 text-xs rounded"
            onClick={handleBack}
          >
            ← Back
          </button>

          {isMarkdown && (
            <>
              <button
                className={`px-4 py-1 text-xs rounded ${
                  viewMode === "preview"
                    ? "bg-green-200 text-black"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("preview")}
              >
                Preview
              </button>
              <button
                className={`px-4 py-1 text-xs  rounded ${
                  viewMode === "raw"
                    ? "bg-green-200 text-black"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("raw")}
              >
                Raw Content
              </button>
            </>
          )}
        </div>

        <h2 className="text-lg text-white font-bold mb-2">{selectedFile}</h2>

        {isMarkdown ? (
          viewMode === "preview" ? (
            <div className="prose max-w-full p-4 text-white rounded overflow-auto h-[calc(100vh-150px)]">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="w-full h-[calc(100vh-150px)]">
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
          <div className="w-full h-[calc(100vh-150px)]">
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
    );
  }

  return (
    <div className="overflow-auto">
      <div className="mb-4 flex items-center gap-2">
        {selectedRepo && (
          <>
            <span className="px-2 py-1 text-gray-200 font-bold">
              {displayName(selectedRepo)}
            </span>
            <span className="px-2 py-0.5 text-xs bg-green-100 text-black font-semibold">
              {currentBranch}
            </span>
          </>
        )}
      </div>

      {fileTree.length ? (
        <FileTree nodes={fileTree} onFileClick={handleFileClick} />
      ) : (
        <p className="text-gray-500 text-center text-sm">No files found</p>
      )}

      {/* Render README.md preview if exists */}
      {readmeFile && fileContent[readmeFile] && (
        <div className="mt-4">
          <div className="markdown-body max-w-full p-4 rounded bg-[#181818] mx-2 overflow-auto">
            <ReactMarkdown>{fileContent[readmeFile]}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
