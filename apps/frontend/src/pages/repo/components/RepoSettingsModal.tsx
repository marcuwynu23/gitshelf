import {useState, useEffect} from "react";
import {Modal} from "~/components/ui/Modal";
import {Button} from "~/components/ui/Button";
import {Input} from "~/components/ui/Input";
import {Alert} from "~/components/ui/Alert";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {
  ArchiveBoxIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

interface RepoMetadata {
  title?: string;
  description?: string;
}

interface RepoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  repoMetadata?: RepoMetadata | null;
  onMetadataUpdate?: (metadata: RepoMetadata) => void;
}

export const RepoSettingsModal: React.FC<RepoSettingsModalProps> = ({
  isOpen,
  onClose,
  repoName,
  repoMetadata,
  onMetadataUpdate,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);
    try {
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes('.git') ? repoName : `${repoName}.git`;
      await axios.patch(`/api/repos/${encodeURIComponent(repoNameWithGit)}/archive`);
      onClose();
      // Refresh the page or update state
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to archive repository");
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
      const repoNameWithGit = repoName.includes('.git') ? repoName : `${repoName}.git`;
      console.log('Renaming repository:', repoNameWithGit, 'to:', renameName.trim());
      const response = await axios.patch(`/api/repos/${encodeURIComponent(repoNameWithGit)}/rename`, {
        newName: renameName.trim(),
      });
      console.log('Rename response:', response.data);

      // Close modal and navigate to new repository URL
      onClose();
      window.location.href = `/repository/${encodeURIComponent(renameName.trim())}`;
    } catch (err: any) {
      console.error('Rename error:', err);
      setError(err.response?.data?.error || "Failed to rename repository");
    } finally {
      setIsUpdating(false);
    }
  };

  const performMetadataUpdate = async (trimmedTitle: string, trimmedDescription: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      // Simple metadata update
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes('.git') ? repoName : `${repoName}.git`;
      const response = await axios.put(`/api/repos/${encodeURIComponent(repoNameWithGit)}/metadata`, {
        title: trimmedTitle || null,
        description: trimmedDescription || null,
      });

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
      const repoNameWithGit = repoName.includes('.git') ? repoName : `${repoName}.git`;
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
      title={showRenameConfirm ? "Confirm Rename" : "Repository Settings"}
      size="md"
    >
      {error && !showRenameConfirm && (
        <Alert variant="error">
          {error}
        </Alert>
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
                  You are about to rename <strong className="text-[#e8e8e8]">{repoName}</strong> to{" "}
                  <strong className="text-[#e8e8e8]">{renameName.trim()}.git</strong>
                </p>
                <p className="mb-2">
                  This will:
                </p>
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
      ) :

      /* Rename Form */
      showRenameForm ? (
        <div className="space-y-4">
          <div className="text-sm text-[#b0b0b0] mb-4">
            Rename repository <strong className="text-[#e8e8e8]">{repoName}</strong>
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
              .git extension will be added automatically. This will change all repository URLs.
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
            Edit title and description for <strong className="text-[#e8e8e8]">{repoName}</strong>
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
      ) :

      /* Main Repository Settings Interface */
      !showDeleteConfirm ? (
        <div className="space-y-4">
          <div className="text-sm text-[#b0b0b0] mb-4">
            Manage settings for <strong className="text-[#e8e8e8]">{repoName}</strong>
          </div>

          <div className="space-y-3">
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

            <Button
              variant="secondary"
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full justify-start"
            >
              <ArchiveBoxIcon className="w-4 h-4 mr-2" />
              {isArchiving ? "Archiving..." : "Archive Repository"}
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full justify-start"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Repository
            </Button>
          </div>
        </div>
      ) :

      /* Delete Confirmation */
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
                  This action <strong>cannot be undone</strong>. This will permanently delete the{" "}
                  <strong className="text-[#e8e8e8]">{repoName}</strong> repository, including all code, commits, and branches.
                </p>
                <p>
                  Please type <strong className="text-[#e8e8e8]">{repoName}</strong> to confirm.
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