import {
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import {useEffect, useState} from "react";
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

export const RepoSettingsModal: React.FC<RepoSettingsModalProps> = ({
  isOpen,
  onClose,
  repoName,
  repoMetadata,
  onMetadataUpdate,
  isArchived = false,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "access" | "danger">(
    "general",
  );

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Rename form state
  const [renameName, setRenameName] = useState("");

  // Initialize forms with current data
  useEffect(() => {
    if (isOpen) {
      // Remove .git extension for display
      setRenameName(repoName.replace(/\.git$/, ""));
      if (repoMetadata) {
        setEditTitle(repoMetadata.title || "");
        setEditDescription(repoMetadata.description || "");
      } else {
        setEditTitle("");
        setEditDescription("");
      }
    }
  }, [repoMetadata, isOpen, repoName]);

  const handleArchiveUnarchiveClick = () => {
    setShowArchiveConfirm(true);
  };

  const handleArchiveUnarchiveConfirm = async () => {
    setIsArchiving(true);
    setError(null);
    try {
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes(".git")
        ? repoName
        : `${repoName}.git`;

      if (isArchived) {
        // Unarchive the repository
        await axios.patch(
          `/api/repos/${encodeURIComponent(repoNameWithGit)}/unarchive`,
        );
      } else {
        // Archive the repository
        await axios.patch(
          `/api/repos/${encodeURIComponent(repoNameWithGit)}/archive`,
        );
      }

      onClose();
      // Refresh the page or update state
      window.location.reload();
    } catch (err: any) {
      const action = isArchived ? "unarchive" : "archive";
      setError(err.response?.data?.error || `Failed to ${action} repository`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRename = async () => {
    const trimmedName = renameName.trim();

    if (!trimmedName) {
      setError("Repository name cannot be empty");
      return;
    }

    // Check if name has changed
    const currentRepoNameWithoutGit = repoName.replace(/\.git$/, "");
    const isRenaming = trimmedName !== currentRepoNameWithoutGit;

    if (!isRenaming) {
      setError("New name is the same as current name");
      return;
    }

    setShowRenameConfirm(true);
  };

  const handleUpdateMetadata = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    await performMetadataUpdate(trimmedTitle, trimmedDescription);
  };

  const performRename = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      // Repository rename requires different endpoint
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes(".git")
        ? repoName
        : `${repoName}.git`;
      console.log(
        "Renaming repository:",
        repoNameWithGit,
        "to:",
        renameName.trim(),
      );
      const response = await axios.patch(
        `/api/repos/${encodeURIComponent(repoNameWithGit)}/rename`,
        {
          newName: renameName.trim(),
        },
      );
      console.log("Rename response:", response.data);

      // Close modal and navigate to new repository URL
      onClose();
      window.location.href = `/repository/${encodeURIComponent(renameName.trim())}`;
    } catch (err: any) {
      console.error("Rename error:", err);
      setError(err.response?.data?.error || "Failed to rename repository");
    } finally {
      setIsUpdating(false);
    }
  };

  const performMetadataUpdate = async (
    trimmedTitle: string,
    trimmedDescription: string,
  ) => {
    setIsUpdating(true);
    setError(null);
    try {
      // Simple metadata update
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes(".git")
        ? repoName
        : `${repoName}.git`;
      const response = await axios.put(
        `/api/repos/${encodeURIComponent(repoNameWithGit)}/metadata`,
        {
          title: trimmedTitle || null,
          description: trimmedDescription || null,
        },
      );

      if (onMetadataUpdate) {
        onMetadataUpdate(response.data);
      }
      setShowEditForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update repository");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== repoName) {
      setError("Repository name doesn't match");
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes(".git")
        ? repoName
        : `${repoName}.git`;
      await axios.delete(`/api/repos/${encodeURIComponent(repoNameWithGit)}`);
      onClose();
      navigate("/"); // Redirect to home page after deletion
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete repository");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setShowDeleteConfirm(false);
    setShowEditForm(false);
    setShowRenameForm(false);
    setShowRenameConfirm(false);
    setShowArchiveConfirm(false);
    setDeleteConfirmText("");
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        showRenameConfirm
          ? "Confirm Rename"
          : showArchiveConfirm
            ? "Confirm Archive"
            : "Repository Settings"
      }
      size="half"
    >
      {error && !showRenameConfirm && !showArchiveConfirm && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Rename Confirmation Dialog */}
      {showRenameConfirm ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-400">
                Rename Repository
              </h3>
              <div className="mt-2 text-sm text-[#b0b0b0]">
                <p className="mb-2">
                  You are about to rename{" "}
                  <strong className="text-[#e8e8e8]">{repoName}</strong> to{" "}
                  <strong className="text-[#e8e8e8]">
                    {renameName.trim()}.git
                  </strong>
                </p>
                <p className="mb-2">This will:</p>
                <ul className="list-disc list-inside ml-4 mb-2">
                  <li>Change all repository URLs</li>
                  <li>Update Git remote URLs for existing clones</li>
                  <li>Break any hardcoded links or references</li>
                </ul>
                <p>
                  Existing clones will need to update their remote URL manually.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowRenameConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await performRename();
                setShowRenameConfirm(false);
              }}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? "Renaming..." : "Confirm Rename"}
            </Button>
          </div>
        </div>
      ) : /* Archive Confirmation */
      showArchiveConfirm ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <ArchiveBoxIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-400">
                {isArchived ? "Unarchive Repository" : "Archive Repository"}
              </h3>
              <div className="mt-2 text-sm text-[#b0b0b0]">
                <p className="mb-2">
                  You are about to {isArchived ? "unarchive" : "archive"}{" "}
                  <strong className="text-[#e8e8e8]">{repoName}</strong>
                </p>
                {isArchived ? (
                  <div>
                    <p className="mb-2">Unarchiving will:</p>
                    <ul className="list-disc list-inside ml-4 mb-2">
                      <li>Show the repository in the main list again</li>
                      <li>Make it visible to all users</li>
                      <li>Restore normal repository access</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">Archiving will:</p>
                    <ul className="list-disc list-inside ml-4 mb-2">
                      <li>Hide the repository from the main list</li>
                      <li>Keep all code and history intact</li>
                      <li>Allow unarchiving later if needed</li>
                    </ul>
                    <p>
                      You can unarchive repositories from the settings page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowArchiveConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchiveUnarchiveConfirm}
              disabled={isArchiving}
              className="flex-1"
            >
              {isArchiving
                ? isArchived
                  ? "Unarchiving..."
                  : "Archiving..."
                : isArchived
                  ? "Unarchive Repository"
                  : "Archive Repository"}
            </Button>
          </div>
        </div>
      ) : /* Rename Form */
      showRenameForm ? (
        <div className="space-y-4">
          <div className="text-sm text-[#b0b0b0] mb-4">
            Rename repository{" "}
            <strong className="text-[#e8e8e8]">{repoName}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
              New Repository Name
            </label>
            <Input
              type="text"
              placeholder="Repository name (without .git)"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-[#808080] mt-1">
              .git extension will be added automatically. This will change all
              repository URLs.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowRenameForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? "Renaming..." : "Rename"}
            </Button>
          </div>
        </div>
      ) : showEditForm ? (
        <div className="space-y-4">
          <div className="text-sm text-[#b0b0b0] mb-4">
            Edit title and description for{" "}
            <strong className="text-[#e8e8e8]">{repoName}</strong>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                Title
              </label>
              <Input
                type="text"
                placeholder="Repository title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                Description
              </label>
              <textarea
                placeholder="Repository description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 bg-app-surface border border-[#3d3d3d] rounded-md text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowEditForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMetadata}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      ) : /* Main Repository Settings Interface (tabbed) */
      !showDeleteConfirm ? (
        <div className="grid grid-cols-4 gap-4">
          <nav className="col-span-1 border-r border-[#2f2f2f] pr-3">
            <ul className="space-y-2 sticky top-6">
              <li>
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === "general"
                      ? "bg-app-accent/10 text-app-accent"
                      : "hover:bg-[#272727] text-text-primary"
                  }`}
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
                >
                  Danger
                </button>
              </li>
            </ul>
          </nav>

          <div className="col-span-3">
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="text-sm text-text-tertiary mb-2">
                  Manage settings for{" "}
                  <strong className="text-text-primary">{repoName}</strong>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowRenameForm(true)}
                      className="w-full justify-start"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Rename Repository
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setShowEditForm(true)}
                      className="w-full justify-start"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Title & Description
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleArchiveUnarchiveClick}
                      disabled={isArchiving}
                      className="w-full justify-start"
                    >
                      <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                      {isArchived
                        ? "Unarchive Repository"
                        : "Archive Repository"}
                    </Button>
                  </div>

                  {/* Repository options removed as requested */}
                </div>
              </div>
            )}

            {activeTab === "access" && (
              <div className="text-sm text-text-tertiary">
                Manage collaborators, teams, and access control here. (Coming
                soon)
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="text-sm text-text-tertiary">
                  Danger zone actions for this repository.
                </div>
                <div>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Repository
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : /* Delete Confirmation */
      showDeleteConfirm ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-400">
                Delete Repository
              </h3>
              <div className="mt-2 text-sm text-[#b0b0b0]">
                <p className="mb-2">
                  This action <strong>cannot be undone</strong>. This will
                  permanently delete the{" "}
                  <strong className="text-[#e8e8e8]">{repoName}</strong>{" "}
                  repository, including all code, commits, and branches.
                </p>
                <p>
                  Please type{" "}
                  <strong className="text-[#e8e8e8]">{repoName}</strong> to
                  confirm.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Input
              type="text"
              placeholder={`Type "${repoName}" to confirm`}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmText !== repoName}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete Repository"}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
