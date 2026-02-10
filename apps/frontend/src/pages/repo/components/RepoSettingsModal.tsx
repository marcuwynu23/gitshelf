import {
  ExclamationTriangleIcon,
  PencilIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  KeyIcon,
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

  const renderTabButton = (
    key: TabKey,
    label: string,
    icon: React.ReactNode,
    variant: "default" | "danger" = "default",
  ) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
        activeTab === key
          ? variant === "danger"
            ? "bg-error/10 text-error border-error"
            : "bg-app-accent/10 text-app-accent border-app-accent"
          : variant === "danger"
            ? "text-error/70 hover:bg-error/5 hover:text-error border-transparent"
            : "text-text-tertiary hover:bg-app-hover hover:text-text-primary border-transparent"
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title="Repository Settings"
      size="xl"
      maxHeightClass="max-h-[85vh]"
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div
        data-testid="repo-settings-shell"
        className="flex flex-col md:flex-row h-full min-h-[500px] border-t border-app-border -mx-6"
      >
        {/* Left Sidebar */}
        <nav
          data-testid="repo-settings-nav"
          className="w-full md:w-64 bg-app-surface border-b md:border-b-0 md:border-r border-app-border flex-shrink-0"
        >
          <div className="p-4 md:py-6 space-y-1">
            {renderTabButton(
              "general",
              "General",
              <Cog6ToothIcon className="w-5 h-5" />,
            )}
            {renderTabButton(
              "access",
              "Access",
              <ShieldCheckIcon className="w-5 h-5" />,
            )}
            <div className="h-px bg-app-border my-2 mx-4" />
            {renderTabButton(
              "danger",
              "Danger Zone",
              <ExclamationTriangleIcon className="w-5 h-5" />,
              "danger",
            )}
          </div>
        </nav>

        {/* Right Content */}
        <div
          data-testid="repo-settings-content"
          className="flex-1 overflow-y-auto bg-app-surface"
        >
          <div className="p-6 max-w-3xl mx-auto">
            {activeTab === "general" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    General Settings
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Manage your repository's main configuration.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Metadata Section */}
                  <section className="bg-app-surface/30 border border-app-border rounded-lg p-5 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-app-border">
                      <PencilIcon className="w-5 h-5 text-app-accent" />
                      <h4 className="font-medium text-text-primary">
                        Repository Details
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Repository Name"
                        value={repoNameWithoutGit}
                        disabled
                        className="opacity-60"
                        helperText="The repository name can only be changed in the Rename section."
                      />

                      <Input
                        label="Title"
                        placeholder="Project Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        helperText="A human-readable title for your project."
                      />

                      <div className="w-full">
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Description
                        </label>
                        <textarea
                          placeholder="What is this project about?"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-app-surface border border-app-border rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors resize-none"
                          rows={4}
                        />
                        <p className="mt-1 text-xs text-text-tertiary">
                          Brief description of your repository.
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          onClick={handleSaveMetadata}
                          disabled={!canSaveMeta || isSavingMeta}
                        >
                          {isSavingMeta ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* Rename Section */}
                  <section className="bg-app-surface/30 border border-app-border rounded-lg p-5 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-app-border">
                      <KeyIcon className="w-5 h-5 text-text-primary" />
                      <h4 className="font-medium text-text-primary">
                        Rename Repository
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-app-accent/10 border border-app-accent/20 rounded-md text-sm text-app-accent">
                        <p className="font-medium">
                          Warning: This can have unintended side effects.
                        </p>
                        <ul className="list-disc list-inside mt-1 opacity-90">
                          <li>
                            Existing clones will need to update their remote
                            URL.
                          </li>
                          <li>Links to this repository will break.</li>
                        </ul>
                      </div>

                      <Input
                        label="New Repository Name"
                        placeholder="new-name"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        helperText={`Current name: ${repoNameWithoutGit}`}
                      />

                      {newRepoName && newRepoName !== repoNameWithoutGit && (
                        <div className="space-y-3 pt-2 animate-fadeIn">
                          <Input
                            label={`To confirm, type "${repoNameWithoutGit}"`}
                            placeholder={repoNameWithoutGit}
                            value={renameConfirmText}
                            onChange={(e) =>
                              setRenameConfirmText(e.target.value)
                            }
                          />
                          <Button
                            onClick={handleRename}
                            disabled={!canRename || isRenaming}
                            className="w-full sm:w-auto"
                          >
                            {isRenaming
                              ? "Renaming..."
                              : "I understand, rename this repository"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "access" && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-app-surface flex items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 text-text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Access Control
                  </h3>
                  <p className="text-text-tertiary max-w-sm mt-2">
                    Manage collaborators, teams, and deploy keys. This feature
                    is currently under development.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-error mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Destructive actions that affect your repository.
                  </p>
                </div>

                <div className="border border-error/30 rounded-lg overflow-hidden divide-y divide-error/30">
                  {/* Archive Row */}
                  <div className="p-5 bg-error/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-text-primary">
                        {isArchived
                          ? "Unarchive this repository"
                          : "Archive this repository"}
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        {isArchived
                          ? "Mark this repository as active again."
                          : "Mark this repository as read-only and hide it from the main dashboard."}
                      </p>

                      {archiveConfirmChecked && (
                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            onClick={handleArchiveToggle}
                            disabled={isArchiving}
                            className="text-error hover:text-error/80 border-error/30 hover:bg-error/10"
                          >
                            {isArchiving
                              ? isArchived
                                ? "Unarchiving..."
                                : "Archiving..."
                              : isArchived
                                ? "Confirm Unarchive"
                                : "Confirm Archive"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {!archiveConfirmChecked && (
                      <Button
                        variant="secondary"
                        onClick={() => setArchiveConfirmChecked(true)}
                        className="text-error hover:text-error/80 border-error/30 hover:bg-error/10 shrink-0"
                      >
                        {isArchived ? "Unarchive" : "Archive"}
                      </Button>
                    )}
                  </div>

                  {/* Delete Row */}
                  <div className="p-5 bg-error/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-medium text-text-primary">
                        Delete this repository
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        Once you delete a repository, there is no going back.
                        Please be certain.
                      </p>

                      {deleteExpanded && (
                        <div className="mt-4 p-4 bg-app-bg border border-error/50 rounded-md space-y-4 animate-fadeIn">
                          <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-error shrink-0 mt-0.5" />
                            <p className="text-sm text-text-primary">
                              This will permanently delete the{" "}
                              <strong>{repoNameWithGit}</strong> repository, all
                              its files, branches, tags, and commits.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs text-text-tertiary mb-1.5">
                              Type <strong>{repoNameWithGit}</strong> to
                              confirm:
                            </label>
                            <Input
                              value={deleteConfirmText}
                              onChange={(e) =>
                                setDeleteConfirmText(e.target.value)
                              }
                              placeholder={repoNameWithGit}
                              className="border-error/50 focus:border-error focus:ring-error/20"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="danger"
                              onClick={handleDelete}
                              disabled={!canDelete || isDeleting}
                              className="w-full sm:w-auto"
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "I understand, delete this repository"}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setDeleteExpanded(false);
                                setDeleteConfirmText("");
                              }}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!deleteExpanded && (
                      <Button
                        variant="danger"
                        onClick={() => setDeleteExpanded(true)}
                        className="shrink-0"
                      >
                        Delete repository
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
