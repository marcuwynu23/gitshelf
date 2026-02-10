import {
  CodeBracketIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, {useMemo, useState} from "react";
import {Badge, Button, Modal} from "~/components/ui";

interface BranchListProps {
  branches: string[];
  currentBranch: string | null;
  onSwitchBranch: (branch: string) => void;
  previewCount?: number;
}

export const BranchList: React.FC<BranchListProps> = ({
  branches,
  currentBranch,
  onSwitchBranch,
  previewCount = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    return branches.filter((b) =>
      b.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [branches, searchQuery]);

  const previewBranches = branches.slice(0, previewCount);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CodeBracketIcon className="w-4 h-4 text-text-tertiary" />
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          Branches
        </h2>
      </div>

      {branches.length === 0 ? (
        <p className="text-text-tertiary text-xs">No branches found</p>
      ) : (
        <div className="space-y-1">
          {previewBranches.map((branch) => (
            <BranchRow
              key={branch}
              branch={branch}
              currentBranch={currentBranch}
              onClick={() => onSwitchBranch(branch)}
            />
          ))}

          {branches.length > previewBranches.length && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-xs text-app-accent hover:text-app-accent-hover"
              >
                View all branches
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Switch Branch"
        size="md"
        closeOnBackdrop={true}
      >
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-app-bg border border-app-border rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {filteredBranches.length === 0 ? (
              <p className="text-center text-sm text-text-tertiary py-4">
                No branches found
              </p>
            ) : (
              filteredBranches.map((branch) => (
                <BranchRow
                  key={branch}
                  branch={branch}
                  currentBranch={currentBranch}
                  onClick={() => {
                    onSwitchBranch(branch);
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const BranchRow: React.FC<{
  branch: string;
  currentBranch: string | null;
  onClick?: () => void;
}> = ({branch, currentBranch, onClick}) => {
  const isCurrent = branch === currentBranch;

  return (
    <div
      onClick={isCurrent ? undefined : onClick}
      className={`group flex items-center justify-between p-2.5 rounded border transition-all ${
        isCurrent
          ? "bg-app-accent/10 border-app-accent cursor-default"
          : "bg-transparent border-transparent hover:bg-app-hover hover:border-app-border cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3">
        <CodeBracketIcon
          className={`w-4 h-4 ${
            isCurrent
              ? "text-app-accent"
              : "text-text-tertiary group-hover:text-text-secondary"
          }`}
        />
        <span
          className={`text-sm font-mono ${
            isCurrent
              ? "text-text-primary font-medium"
              : "text-text-secondary group-hover:text-text-primary"
          }`}
        >
          {branch}
        </span>
      </div>
      {isCurrent && (
        <Badge
          variant="success"
          size="sm"
          className="text-[10px] px-1.5 py-0.5"
        >
          Current
        </Badge>
      )}
    </div>
  );
};

export default BranchList;
