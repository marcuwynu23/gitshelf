import type {FileNode} from "@myapp/ui";
import {FileTree} from "@myapp/ui";
import type {FC} from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {useRepoStore} from "~/stores/repoStore";
import {FileViewer} from "./FileViewer";
import LoadingSkeleton from "./LoadingSkeleton";
import {
  RepoFileTreeHeader,
  type DocFile,
  type DocTab,
  type PanelView,
} from "./RepoFileTreeHeader";
import {BranchList} from "./BranchList";
import {CommitList} from "./CommitList";
import type {Commit} from "~/props/Commit";
import {MarkdownRenderer} from "./MarkdownRenderer";

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
    selectedRepo,
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

  // Detect all documentation files in the root of the tree
  const docFiles = useMemo<DocFile[]>(() => {
    const docs: DocFile[] = [];
    const patterns: Array<{key: DocTab; label: string; regex: RegExp}> = [
      {key: "readme", label: "README", regex: /^README(\.md)?$/i},
      {
        key: "contributing",
        label: "CONTRIBUTING",
        regex: /^CONTRIBUTING(\.md)?$/i,
      },
      {
        key: "code_of_conduct",
        label: "CODE OF CONDUCT",
        regex: /^CODE_OF_CONDUCT(\.md)?$/i,
      },
      {key: "changelog", label: "CHANGELOG", regex: /^CHANGELOG(\.md)?$/i},
      {key: "license", label: "LICENSE", regex: /^LICENSE(\.md|\.txt)?$/i},
    ];

    for (const pattern of patterns) {
      const node = fileTree.find(
        (n) => n.type === "file" && pattern.regex.test(n.name),
      );
      if (node) {
        docs.push({key: pattern.key, label: pattern.label, path: node.path});
      }
    }

    return docs;
  }, [fileTree]);

  // default panel: show Documentation (readme) by default
  const [panelView, setPanelView] = useState<PanelView>("readme");
  const [docTab, setDocTab] = useState<DocTab>("readme");
  const isLoading = useRepoStore((s) => s.isLoading);

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

  // Track in-flight doc fetches to prevent duplicates
  const fetchingRef = useRef<Set<string>>(new Set());

  // When Documentation panel is active and doc file becomes available, fetch it
  useEffect(() => {
    if (panelView !== "readme") return;

    const activeDoc = docFiles.find((d) => d.key === docTab);
    const target = activeDoc?.path;
    if (!target) return;

    // Already have content — skip
    if (fileContent[target] !== undefined) return;

    // Already fetching — skip
    if (fetchingRef.current.has(target)) return;
    fetchingRef.current.add(target);

    fetchFileContent(target, branchOrCommit).finally(() => {
      fetchingRef.current.delete(target);
    });
  }, [
    panelView,
    docTab,
    docFiles,
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
        const activeDoc = docFiles.find((d) => d.key === docTab);
        const target = activeDoc?.path;

        if (!target) {
          // No doc file found — show skeleton while tree is loading, otherwise show fallback
          if (isLoading) return <LoadingSkeleton />;

          const fallbackContent = `# ${(selectedRepo || "Project").replace(/\.git$/, "")}\n\nNo Documentation Yet.`;
          return (
            <div className="bg-app-surface border border-app-border rounded-lg p-6">
              <div className="markdown-body overflow-auto">
                <MarkdownRenderer content={fallbackContent} />
              </div>
            </div>
          );
        }

        const content = fileContent[target];

        // undefined means not fetched yet
        if (content === undefined) {
          return <LoadingSkeleton />;
        }

        const displayContent =
          content && content.trim()
            ? content
            : `# ${(selectedRepo || "Project").replace(/\.git$/, "")}\n\nNo Documentation Yet.`;

        return (
          <div className="bg-app-surface border border-app-border rounded-lg p-6">
            <div className="markdown-body overflow-auto">
              <MarkdownRenderer content={displayContent} />
            </div>
          </div>
        );
      }
      case "branches":
        return (
          <BranchList
            branches={branches}
            currentBranch={currentBranch}
            viewingBranch={branchOrCommit || null}
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
        docFiles={docFiles}
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
