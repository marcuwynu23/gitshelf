import type {FileNode} from "@myapp/ui";
import {FileTree} from "@myapp/ui";
import type {FC} from "react";
import {useEffect, useMemo, useState} from "react";
import ReactMarkdown from "react-markdown";
import {useRepoStore} from "~/stores/repoStore";
import {FileViewer} from "./FileViewer";
import LoadingSkeleton from "./LoadingSkeleton";
import {RepoFileTreeHeader, type PanelView} from "./RepoFileTreeHeader";
import {BranchList} from "./BranchList";
import {CommitList} from "./CommitList";
import type {Commit} from "~/props/Commit";

// Persist fetched-file flags across mounts to avoid duplicate GETs
const globalFetchedFiles: Record<string, boolean> = {};

export interface RepoFileTreeProps {
  selectedRepo: string | null;
  fileTree: FileNode[];
  branchOrCommit?: string;
  branches: string[];
  currentBranch: string | null;
  commits: Commit[];
  onSwitchBranch: (branch: string) => void;
  onSettingsClick?: () => void;
}

export const RepoFileTree: FC<RepoFileTreeProps> = (props) => {
  const {
    fileTree,
    branchOrCommit,
    branches,
    currentBranch,
    commits,
    onSwitchBranch,
    onSettingsClick,
  } = props;
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

  // default panel: show Documentation (readme) by default
  const [panelView, setPanelView] = useState<PanelView>("readme");
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

  // Clear module-level fetch cache on mount (component re-keys per repo/ref)
  useEffect(() => {
    Object.keys(globalFetchedFiles).forEach(
      (k) => delete globalFetchedFiles[k],
    );
  }, []);

  // When Documentation panel is active and readmeFile/licenseFile becomes available, fetch it
  useEffect(() => {
    if (panelView !== "readme") return;

    const target = docTab === "readme" ? readmeFile : licenseFile;
    if (!target) return;

    // Already have content — skip
    if (fileContent[target] !== undefined) return;

    // Prevent duplicate in-flight requests
    if (globalFetchedFiles[target]) return;
    globalFetchedFiles[target] = true;

    fetchFileContent(target, branchOrCommit).catch(() => {
      globalFetchedFiles[target] = false;
    });
  }, [
    panelView,
    docTab,
    readmeFile,
    licenseFile,
    fileContent,
    fetchFileContent,
    branchOrCommit,
  ]);

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

  const renderPanelContent = () => {
    switch (panelView) {
      case "files":
        return normalizedTree.length ? (
          <div className="bg-app-surface border border-app-border rounded-lg py-2 overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <FileTree nodes={normalizedTree} onFileClick={handleFileClick} />
            </div>
          </div>
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center">
            <p className="text-text-tertiary text-sm">No files found</p>
          </div>
        );
      case "readme": {
        const target = docTab === "readme" ? readmeFile : licenseFile;

        if (!target) {
          // No README/LICENSE in tree yet — show skeleton while tree is loading, otherwise show message
          if (isLoading) return <LoadingSkeleton />;
          return (
            <div className="bg-app-surface border border-app-border rounded-lg p-8 text-center">
              <p className="text-text-tertiary text-sm">
                {docTab === "readme"
                  ? "No README.md found"
                  : "No LICENSE found"}
              </p>
            </div>
          );
        }

        const content = fileContent[target];

        // undefined means not fetched yet; null/empty string is valid content
        if (content === undefined) {
          return <LoadingSkeleton />;
        }

        return (
          <div className="bg-app-surface border border-app-border rounded-lg p-6">
            <div className="markdown-body overflow-auto">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        );
      }
      case "branches":
        return (
          <BranchList
            branches={branches}
            currentBranch={currentBranch}
            onSwitchBranch={onSwitchBranch}
          />
        );
      case "commits":
        return <CommitList commits={commits} />;
      default:
        return null;
    }
  };

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
        onSettingsClick={onSettingsClick}
      />

      {/* Main panel area */}
      <div className="flex-1 min-h-0 overflow-auto mb-6 mt-2">
        {renderPanelContent()}
      </div>
    </div>
  );
};
