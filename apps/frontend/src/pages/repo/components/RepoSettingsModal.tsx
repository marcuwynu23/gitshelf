import {
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Alert} from "~/components/ui/Alert";
import {Button} from "~/components/ui/Button";
import {Input} from "~/components/ui/Input";
import {Modal} from "~/components/ui/Modal";

interface RepoMetadata {
  title?: string;
  description?: string;
  archived?: boolean;
  sshAddress: string | null;
  httpAddress: string;
}

interface RepoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  repoMetadata?: RepoMetadata | null;
  onMetadataUpdate?: (metadata: RepoMetadata) => void;
  isArchived?: boolean;
}

type TabKey = "general" | "access" | "danger";

function ensureGitSuffix(name: string): string {
  const trimmed = name.trim();
  return trimmed.endsWith(".git") ? trimmed : `${trimmed}.git`;
}

function stripGitSuffix(name: string): string {
  return name.replace(/\.git$/i, "");
}

export const RepoSettingsModal: React.FC<RepoSettingsModalProps> = ({
  isOpen,
  onClose,
  repoName,
  repoMetadata,
  onMetadataUpdate,
  isArchived = false,
}) => {
  const navigate = useNavigate();

  const repoNameWithGit = useMemo(() => ensureGitSuffix(repoName), [repoName]);
  const repoNameWithoutGit = useMemo(
    () => stripGitSuffix(repoName),
    [repoName],
  );

  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newRepoName, setNewRepoName] = useState("");

  // Inline confirm sections
  const [renameConfirmText, setRenameConfirmText] = useState("");
  const [archiveConfirmChecked, setArchiveConfirmChecked] = useState(false);
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Loading + errors
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("general");
    setError(null);

    setTitle(repoMetadata?.title ?? "");
    setDescription(repoMetadata?.description ?? "");
    setNewRepoName(repoNameWithoutGit);

    // reset inline confirmations
    setRenameConfirmText("");
    setArchiveConfirmChecked(false);
    setDeleteExpanded(false);
    setDeleteConfirmText("");
  }, [isOpen, repoMetadata, repoNameWithoutGit]);

  const closeAndReset = () => {
    setError(null);
    setDeleteExpanded(false);
    setDeleteConfirmText("");
    setRenameConfirmText("");
    setArchiveConfirmChecked(false);
    onClose();
  };

  const canSaveMeta =
    title.trim() !== (repoMetadata?.title ?? "").trim() ||
    description.trim() !== (repoMetadata?.description ?? "").trim();

  const renameTarget = newRepoName.trim();
  const renameChanged =
    renameTarget.length > 0 && renameTarget !== repoNameWithoutGit;
  const renameConfirmed = renameConfirmText.trim() === repoNameWithoutGit;
  const canRename = renameChanged && renameConfirmed;

  const canArchiveToggle = archiveConfirmChecked;

  const canDelete = deleteConfirmText.trim() === repoNameWithGit;

  const handleSaveMetadata = async () => {
    setError(null);
    setIsSavingMeta(true);
    try {
      const response = await axios.put(
        `/api/repos/${encodeURIComponent(repoNameWithGit)}/metadata`,
        {
          title: title.trim() ? title.trim() : null,
          description: description.trim() ? description.trim() : null,
        },
      );

      onMetadataUpdate?.(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to update repository metadata",
      );
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleRename = async () => {
    const trimmed = newRepoName.trim();

    if (!trimmed) {
      setError("Repository name cannot be empty");
      return;
    }
    if (trimmed === repoNameWithoutGit) {
      setError("New name is the same as current name");
      return;
    }
    if (!renameConfirmed) {
      setError(`Type "${repoNameWithoutGit}" to confirm rename`);
      return;
    }

    setError(null);
    setIsRenaming(true);
    try {
      await axios.patch(
        `/api/repos/${encodeURIComponent(repoNameWithGit)}/rename`,
        {newName: trimmed},
      );

      // Close modal then navigate to the new repo route
      closeAndReset();
      navigate(`/repository/${encodeURIComponent(trimmed)}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to rename repository");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!archiveConfirmChecked) {
      setError("Please confirm this action first");
      return;
    }

    setError(null);
    setIsArchiving(true);
    try {
      const endpoint = isArchived ? "unarchive" : "archive";
      await axios.patch(
        `/api/repos/${encodeURIComponent(repoNameWithGit)}/${endpoint}`,
      );

      // Let parent refresh list/state; fallback to closing.
      closeAndReset();
    } catch (err: any) {
      const action = isArchived ? "unarchive" : "archive";
      setError(err?.response?.data?.error || `Failed to ${action} repository`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      setError(`Type "${repoNameWithGit}" to confirm deletion`);
      return;
    }

    setError(null);
    setIsDeleting(true);
    try {
      await axios.delete(`/api/repos/${encodeURIComponent(repoNameWithGit)}`);
      closeAndReset();
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to delete repository");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title="Repository Settings"
      size="half"
    >
      {error && <Alert variant="error">{error}</Alert>}
      <div data-testid="repo-settings-shell" className="h-full min-h-0">
        <div className="grid grid-cols-4 gap-4 h-full min-h-0">
          {/* Left nav (fixed / sticky) */}
          <nav
            data-testid="repo-settings-nav"
            className="col-span-1 border-r border-[#2f2f2f] pr-3 h-full"
          >
            <ul className="space-y-2 sticky top-0">
              <li>
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === "general"
                      ? "bg-app-accent/10 text-app-accent"
                      : "hover:bg-[#272727] text-text-primary"
                  }`}
                  type="button"
                >
                  General
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("access")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === "access"
                      ? "bg-app-accent/10 text-app-accent"
                      : "hover:bg-[#272727] text-text-primary"
                  }`}
                  type="button"
                >
                  Access
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("danger")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === "danger"
                      ? "bg-red-900/10 text-red-400"
                      : "hover:bg-[#272727] text-text-primary"
                  }`}
                  type="button"
                >
                  Danger
                </button>
              </li>
            </ul>
          </nav>

          {/* Right pane scrolls per tab */}
          <div
            data-testid="repo-settings-content"
            className="col-span-3 h-full min-h-0 overflow-y-auto pr-1"
          >
            <div className="min-h-full flex flex-col">
              {activeTab === "general" && (
                <div className="flex-1 space-y-6 pb-4">
                  <div className="text-sm text-text-tertiary">
                    Manage settings for{" "}
                    <strong className="text-text-primary">
                      {repoNameWithGit}
                    </strong>
                  </div>

                  {/* Metadata */}
                  <section className="space-y-3 border border-[#2f2f2f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary flex items-center">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Title & Description
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                        Title
                      </label>
                      <Input
                        type="text"
                        placeholder="Repository title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Repository description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-app-surface border border-[#3d3d3d] rounded-md text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSaveMetadata}
                      disabled={!canSaveMeta || isSavingMeta}
                      className="min-w-[120px]"
                      type="button"
                    >
                      {isSavingMeta ? "Saving..." : "Save"}
                    </Button>
                  </section>

                  {/* Rename */}
                  <section className="space-y-3 border border-[#2f2f2f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary flex items-center">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Rename repository
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                        New name (without .git)
                      </label>
                      <Input
                        type="text"
                        placeholder="repository-name"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-[#808080] mt-1">
                        This changes URLs and requires updating remotes for
                        existing clones.
                      </p>
                    </div>

                    <div className="mt-2 p-3 rounded border border-yellow-700/50 bg-yellow-900/20">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-[#b0b0b0]">
                          Type{" "}
                          <strong className="text-[#e8e8e8]">
                            {newRepoName}
                          </strong>{" "}
                          to confirm rename.
                        </div>
                      </div>
                      <div className="mt-3">
                        <Input
                          type="text"
                          placeholder={`Type "${repoNameWithoutGit}" to confirm`}
                          value={renameConfirmText}
                          onChange={(e) => setRenameConfirmText(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleRename}
                      disabled={!canRename || isRenaming}
                      className="min-w-[160px]"
                      type="button"
                    >
                      {isRenaming ? "Renaming..." : "Rename"}
                    </Button>
                  </section>
                </div>
              )}

              {activeTab === "access" && (
                <div className="flex-1 pb-4">
                  <div className="text-sm text-text-tertiary pb-4">
                    Manage collaborators, teams, and access control here.
                    (Coming soon)
                  </div>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="flex-1 space-y-4 pb-4">
                  <div className="text-sm text-text-tertiary pb-4">
                    Danger zone actions for this repository.
                  </div>
                  {/* Archive */}
                  <section className="space-y-3 border border-[#2f2f2f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary flex items-center">
                        <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                        {isArchived ? "Unarchive" : "Archive"}
                      </h3>
                      <Button
                        variant="secondary"
                        onClick={handleArchiveToggle}
                        disabled={!canArchiveToggle || isArchiving}
                        className="min-w-[160px]"
                        type="button"
                      >
                        {isArchiving
                          ? isArchived
                            ? "Unarchiving..."
                            : "Archiving..."
                          : isArchived
                            ? "Unarchive"
                            : "Archive"}
                      </Button>
                    </div>

                    <label className="flex items-start gap-2 text-sm text-[#b0b0b0]">
                      <input
                        type="checkbox"
                        checked={archiveConfirmChecked}
                        onChange={(e) =>
                          setArchiveConfirmChecked(e.target.checked)
                        }
                        className="mt-1"
                      />
                      <span>
                        I understand this will{" "}
                        {isArchived
                          ? "restore visibility/access"
                          : "hide the repo from the main list"}
                        .
                      </span>
                    </label>
                  </section>
                  <section className="space-y-3 border border-[#2f2f2f] rounded-lg p-4">
                    <div className=" space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-red-400 flex items-center">
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete repository
                        </h3>

                        {!deleteExpanded && (
                          <Button
                            variant="danger"
                            onClick={() => setDeleteExpanded((v) => !v)}
                            type="button"
                          >
                            Delete
                          </Button>
                        )}
                      </div>

                      {deleteExpanded && (
                        <>
                          <div className="flex items-start space-x-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-[#b0b0b0]">
                              This action <strong>cannot be undone</strong>.
                              Type{" "}
                              <strong className="text-[#e8e8e8]">
                                {repoNameWithGit}
                              </strong>{" "}
                              to confirm deletion.
                            </div>
                          </div>

                          <Input
                            type="text"
                            placeholder={`Type "${repoNameWithGit}" to confirm`}
                            value={deleteConfirmText}
                            onChange={(e) =>
                              setDeleteConfirmText(e.target.value)
                            }
                            className="w-full"
                          />

                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setDeleteExpanded(false);
                                setDeleteConfirmText("");
                              }}
                              className="flex-1"
                              type="button"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="danger"
                              onClick={handleDelete}
                              disabled={!canDelete || isDeleting}
                              className="flex-1"
                              type="button"
                            >
                              {isDeleting ? "Deleting..." : "Confirm delete"}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
