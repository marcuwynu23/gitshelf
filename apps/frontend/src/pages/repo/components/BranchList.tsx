import {CodeBracketIcon, XMarkIcon} from "@heroicons/react/24/outline";
import React, {useState} from "react";
import {Badge, Button} from "~/components/ui";

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

  const previewBranches = branches.slice(0, previewCount);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CodeBracketIcon className="w-4 h-4 text-[#808080]" />
        <h2 className="text-sm font-semibold text-[#e8e8e8] uppercase tracking-wider">
          Branches
        </h2>
      </div>

      {branches.length === 0 ? (
        <p className="text-[#808080] text-xs">No branches found</p>
      ) : (
        <div className="space-y-1">
          {previewBranches.map((branch) => (
            <BranchRow
              key={branch}
              branch={branch}
              currentBranch={currentBranch}
            />
          ))}

          {branches.length > previewBranches.length && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-2 text-xs text-app-accent hover:underline"
              >
                View all branches
              </button>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <BranchDialog
          branches={branches}
          currentBranch={currentBranch}
          onClose={() => setIsOpen(false)}
          onSwitchBranch={onSwitchBranch}
        />
      )}
    </div>
  );
};

const BranchRow: React.FC<{
  branch: string;
  currentBranch: string | null;
}> = ({branch, currentBranch}) => (
  <div
    className={`p-2.5 rounded border transition-colors ${
      branch === currentBranch
        ? "bg-blue-500 border-app-accent shadow-sm"
        : "bg-transparent border-transparent hover:bg-[#353535] hover:border-[#3d3d3d]"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-mono text-[#e8e8e8]">{branch}</span>
      {branch === currentBranch && (
        <span className="text-xs">Current Branch</span>
      )}
    </div>
  </div>
);

interface BranchDialogProps {
  branches: string[];
  currentBranch: string | null;
  onClose: () => void;
  onSwitchBranch: (branch: string) => void;
}

const BranchDialog: React.FC<BranchDialogProps> = ({
  branches,
  currentBranch,
  onClose,
  onSwitchBranch,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-app-bg w-full max-w-md rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-medium">Switch branch</h3>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2">
          {branches.map((branch) => (
            <div
              key={branch}
              className="flex items-center justify-between p-2 rounded hover:bg-[#353535]"
            >
              <span className="text-sm font-mono">{branch}</span>

              {branch === currentBranch ? (
                <Badge variant="success" className="text-xs">
                  Current
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onSwitchBranch(branch);
                    onClose();
                  }}
                >
                  Switch
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchList;
