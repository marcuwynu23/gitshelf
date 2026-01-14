import {useState} from "react";
import {Modal} from "~/components/ui/Modal";
import {Button} from "~/components/ui/Button";
import {Input} from "~/components/ui/Input";
import {Alert} from "~/components/ui/Alert";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {
  ArchiveBoxIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface RepoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
}

export const RepoSettingsModal: React.FC<RepoSettingsModalProps> = ({
  isOpen,
  onClose,
  repoName,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);
    try {
      await axios.patch(`/api/repos/${encodeURIComponent(repoName)}/archive`);
      onClose();
      // Refresh the page or update state
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to archive repository");
    } finally {
      setIsArchiving(false);
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
      await axios.delete(`/api/repos/${encodeURIComponent(repoName)}`);
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
      title="Repository Settings"
      size="md"
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {!showDeleteConfirm ? (
        <div className="space-y-4">
          <div className="text-sm text-[#b0b0b0] mb-4">
            Manage settings for <strong className="text-[#e8e8e8]">{repoName}</strong>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full justify-start"
            >
              <ArchiveBoxIcon className="w-4 h-4 mr-2" />
              {isArchiving ? "Archiving..." : "Archive Repository"}
            </Button>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full justify-start"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Repository
            </Button>
          </div>
        </div>
      ) : (
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
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmText !== repoName}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete Repository"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};