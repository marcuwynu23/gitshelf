import {useEffect} from "react";
import {useBranchStore} from "~/stores/branchStore";
import {useRepoStore} from "~/stores/repoStore";
import {RepoFileTree} from "./components/RepoFileTree";
import {Breadcrumbs} from "~/components/ui";
import {Badge} from "~/components/ui/Badge";

interface RepoDetailProps {
  repoName: string;
  isArchived?: boolean;
}

export const RepoDetail: React.FC<RepoDetailProps> = ({repoName, isArchived = false}) => {
  const {fileTree, selectedFile, setSelectedFile, viewRepo} = useRepoStore();
  const {currentBranch} = useBranchStore();

  const displayName = (name: string) => name.replace(/\.git$/, "");

  // Load repo data when component mounts or repoName changes
  useEffect(() => {
    viewRepo(repoName);
  }, [repoName, viewRepo]);

  // Build breadcrumbs with navigation
  const breadcrumbs = (() => {
    const crumbs: Array<{label: string; href?: string; onClick?: () => void}> =
      [];

    // Always show Repositories - use Link for navigation
    crumbs.push({
      label: "Repositories",
      href: "/",
    });

    // Add repo name
    crumbs.push({
      label: displayName(repoName),
      onClick: selectedFile
        ? () => {
            setSelectedFile(null);
          }
        : undefined, // No onClick if already at repo level
    });

    // If viewing a file, add file path segments
    if (selectedFile) {
      // Split file path into parts for nested breadcrumbs
      const pathParts = selectedFile.split("/").filter(Boolean);
      pathParts.forEach((part, index) => {
        if (index < pathParts.length - 1) {
          // For parent directories, clicking goes back to repo
          crumbs.push({
            label: part,
            onClick: () => {
              setSelectedFile(null);
            },
          });
        } else {
          // Current file (no onClick)
          crumbs.push({
            label: part,
          });
        }
      });
    }

    return crumbs;
  })();

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] truncate">
              {selectedFile
                ? selectedFile.split("/").pop() || selectedFile
                : displayName(repoName)}
            </h1>
            {isArchived && !selectedFile && (
              <Badge variant="neutral" size="sm">
                Archived
              </Badge>
            )}
          </div>
          {currentBranch && !selectedFile && (
            <p className="text-xs sm:text-sm text-[#b0b0b0] truncate">
              Branch:{" "}
              <span className="text-app-accent font-medium">
                {currentBranch}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <RepoFileTree
          selectedRepo={repoName}
          fileTree={fileTree}
          currentBranch={currentBranch}
        />
      </div>
    </div>
  );
};
