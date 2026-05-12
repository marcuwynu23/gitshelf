import {
  CodeBracketIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, {useMemo, useState} from "react";
import {Badge, Button, Input, Modal} from "~/components/ui";
import {useBranchStore} from "~/stores/branchStore";
import {useRepoStore} from "~/stores/repoStore";

interface BranchListProps {
  branches: string[];
  currentBranch: string | null;
  viewingBranch?: string | null;
  onSwitchBranch: (branch: string) => void;
  previewCount?: number;
}

export const BranchList: React.FC<BranchListProps> = ({
  branches,
  currentBranch,
  viewingBranch,
  onSwitchBranch,
  previewCount = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranch, setSourceBranch] = useState(currentBranch || "");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const createBranchAction = useBranchStore((s) => s.createBranch);
  const deleteBranchAction = useBranchStore((s) => s.deleteBranch);
  const selectedRepo = useRepoStore((s) => s.selectedRepo);

  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    return branches.filter((b) =>
      b.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [branches, searchQuery]);

  const previewBranches = branches.slice(0, previewCount);

  const handleCreateBranch = async () => {
    if (!newBranchName.trim() || !sourceBranch.trim() || !selectedRepo) return;

    setCreating(true);
    setCreateError(null);

    try {
      await createBranchAction(
        selectedRepo,
        newBranchName.trim(),
        sourceBranch.trim(),
      );
      setNewBranchName("");
      setShowCreateModal(false);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const msg =
        e?.response?.data?.error || e?.message || "Failed to create branch";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete || !selectedRepo) return;

    setDeleting(true);
    try {
      await deleteBranchAction(selectedRepo, branchToDelete);
      setBranchToDelete(null);
    } catch {
      // Error handled silently; branch list refreshes
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CodeBracketIcon className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Branches
          </h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSourceBranch(currentBranch || branches[0] || "");
            setShowCreateModal(true);
          }}
          className="text-xs"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          New
        </Button>
      </div>

      {branches.length === 0 ? (
        <p className="text-text-tertiary text-xs">No branches found</p>
      ) : (
        <div className="space-y-1">
          {previewBranches.map((branch) => (
            <BranchRow
              key={branch}
              branch={branch}
              defaultBranch={currentBranch}
              viewingBranch={viewingBranch}
              onClick={() => onSwitchBranch(branch)}
              onDelete={() => setBranchToDelete(branch)}
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

      {/* View All Branches Modal */}
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
                  defaultBranch={currentBranch}
                  viewingBranch={viewingBranch}
                  onClick={() => {
                    onSwitchBranch(branch);
                    setIsOpen(false);
                  }}
                  onDelete={() => setBranchToDelete(branch)}
                />
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Create Branch Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
          setNewBranchName("");
        }}
        title="Create New Branch"
        size="sm"
        closeOnBackdrop={true}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError(null);
                setNewBranchName("");
              }}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={creating || !newBranchName.trim()}
              className="flex-1 sm:flex-none"
            >
              {creating ? "Creating..." : "Create Branch"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="bg-error/10 border border-error/20 text-error text-sm p-3 rounded-lg">
              {createError}
            </div>
          )}

          <Input
            label="Branch Name"
            placeholder="feature/my-new-branch"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            required
            helperText="Use lowercase with hyphens or slashes."
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Source Branch
            </label>
            <select
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
              className="w-full h-9 px-3 bg-app-surface border border-app-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                  {b === currentBranch ? " (current)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-tertiary mt-1">
              The new branch will be created from this branch.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Branch Confirmation Modal */}
      <Modal
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        title="Delete Branch"
        size="sm"
        closeOnBackdrop={true}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => setBranchToDelete(null)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBranch}
              disabled={deleting}
              className="flex-1 sm:flex-none bg-error hover:bg-error/90 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete branch{" "}
          <span className="font-mono font-medium text-text-primary">
            {branchToDelete}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

const BranchRow: React.FC<{
  branch: string;
  defaultBranch: string | null;
  viewingBranch?: string | null;
  onClick?: () => void;
  onDelete?: () => void;
}> = ({branch, defaultBranch, viewingBranch, onClick, onDelete}) => {
  const isDefault = branch === defaultBranch;
  const isViewing = branch === (viewingBranch || defaultBranch);

  return (
    <div
      onClick={isViewing ? undefined : onClick}
      className={`group flex items-center justify-between p-2.5 rounded border transition-all ${
        isViewing
          ? "bg-app-accent/10 border-app-accent cursor-default"
          : "bg-transparent border-transparent hover:bg-app-hover hover:border-app-border cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3">
        <CodeBracketIcon
          className={`w-4 h-4 ${
            isViewing
              ? "text-app-accent"
              : "text-text-tertiary group-hover:text-text-secondary"
          }`}
        />
        <span
          className={`text-sm font-mono ${
            isViewing
              ? "text-text-primary font-medium"
              : "text-text-secondary group-hover:text-text-primary"
          }`}
        >
          {branch}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isDefault && (
          <Badge
            variant="success"
            size="sm"
            className="text-[10px] px-1.5 py-0.5"
          >
            Default
          </Badge>
        )}
        {!isDefault && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-text-tertiary hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete branch"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BranchList;
