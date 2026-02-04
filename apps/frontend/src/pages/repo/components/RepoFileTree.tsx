import type {FileNode} from "@myapp/ui";
import {FileTree} from "@myapp/ui";
import type {FC} from "react";
import {useEffect, useMemo, useState} from "react";
import ReactMarkdown from "react-markdown";
import {useRepoStore} from "~/stores/repoStore";
import {FileViewer} from "./FileViewer";
import LoadingSkeleton from "./LoadingSkeleton";
import {RepoFileTreeHeader} from "./RepoFileTreeHeader";
// Persist fetched-file flags across mounts to avoid duplicate GETs
const globalFetchedFiles: Record<string, boolean> = {};

export interface RepoFileTreeProps {
  selectedRepo: string | null;
  fileTree: FileNode[];
  branchOrCommit?: string;
}

export const RepoFileTree: FC<RepoFileTreeProps> = ({
  selectedRepo,
  fileTree,
  branchOrCommit,
}) => {
  const fetchFileContent = useRepoStore((state) => state.fetchFileContent);
  const fileContent = useRepoStore((state) => state.fileContent);
  const selectedFile = useRepoStore((state) => state.selectedFile);
  const setSelectedFile = useRepoStore((state) => state.setSelectedFile);

  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  // compute README / LICENSE from fileTree to avoid state cascades
  const readmeFile = useMemo(() => {
    const n = fileTree.find(
      (node) => node.type === "file" && /^README\.md$/i.test(node.name),
    );
    return n ? n.path : null;
  }, [fileTree]);
  const licenseFile = useMemo(() => {
    const n = fileTree.find(
      (node) => node.type === "file" && /^LICENSE(\.|$)/i.test(node.name),
    );
    return n ? n.path : null;
  }, [fileTree]);

  // default panel: show README when present, otherwise show files
  const [panelView, setPanelView] = useState<"files" | "readme">("files");
  const [docTab, setDocTab] = useState<"readme" | "license">("readme");
  const isLoading = useRepoStore((s) => s.isLoading);
  // using module-level `globalFetchedFiles` instead of per-mount ref

  const handleFileClick = async (filePath: string) => {
    await fetchFileContent(filePath, branchOrCommit);
    setSelectedFile(filePath);
    setViewMode("preview");
  };

  // Normalize fileTree nodes to ensure `path` exists for keys and nested children
  const normalizeNodes = (nodes: FileNode[], parentPath = ""): FileNode[] => {
    return nodes.map((n) => {
      const path = n.path || (parentPath ? `${parentPath}/${n.name}` : n.name);
      const children =
        n.children && n.children.length
          ? normalizeNodes(n.children, path)
          : undefined;
      return {...n, path, children};
    });
  };

  const normalizedTree = Array.isArray(fileTree)
    ? normalizeNodes(fileTree)
    : [];

  // Debug logs to help identify mount/unmount and data state
  useEffect(() => {
    console.log("RepoFileTree mounted/updated", {
      selectedRepo,
      selectedFile,
      normalizedTreeLength: normalizedTree.length,
    });
    return () => console.log("RepoFileTree unmounted", {selectedRepo});
  }, [selectedRepo, selectedFile, normalizedTree.length]);

  // When Documentation panel is opened, fetch the active doc (README or LICENSE)
  useEffect(() => {
    if (panelView !== "readme") return;
    const target = docTab === "readme" ? readmeFile : licenseFile;
    if (!target) return;
    if (fileContent[target] || globalFetchedFiles[target]) return;
    globalFetchedFiles[target] = true;
    (async () => {
      try {
        await fetchFileContent(target, branchOrCommit);
      } catch {
        globalFetchedFiles[target] = false;
      }
    })();
  }, [
    panelView,
    docTab,
    readmeFile,
    licenseFile,
    fileContent,
    fetchFileContent,
    branchOrCommit,
  ]);

  // Default panel when README appears
  // (removed earlier auto-panel effect to avoid cascading setState)

  // Render selected file using split-out viewer
  if (selectedFile) {
    return (
      <FileViewer
        selectedFile={selectedFile}
        fileContent={fileContent}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setSelectedFile={setSelectedFile}
      />
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Sticky panel header (switcher + docs sub-tabs) */}
      <RepoFileTreeHeader
        panelView={panelView}
        setPanelView={setPanelView}
        docTab={docTab}
        setDocTab={setDocTab}
        readmeFile={readmeFile}
        licenseFile={licenseFile}
        fileContent={fileContent}
        fetchFileContent={fetchFileContent}
        globalFetchedFiles={globalFetchedFiles}
        branchOrCommit={branchOrCommit}
      />

      {/* Main panel area */}
      <div className="flex-1 min-h-0 overflow-auto mb-6 mt-2">
        {panelView === "files" ? (
          normalizedTree.length ? (
            <div className="bg-app-surface border border-app-border rounded-lg py-2">
              <FileTree nodes={normalizedTree} onFileClick={handleFileClick} />
            </div>
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center">
              <p className="text-text-tertiary text-sm">No files found</p>
            </div>
          )
        ) : (
          <div className="bg-app-surface border border-app-border rounded-lg p-6">
            <div className="markdown-body overflow-auto">
              <ReactMarkdown>
                {docTab === "readme"
                  ? fileContent[readmeFile!]
                  : fileContent[licenseFile!]}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
