import {useEffect, useState, useMemo} from "react";
import {useRepoStore} from "~/stores/repoStore";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {RepoList} from "./components/RepoList";
import {Button, Input, Modal, Breadcrumbs} from "~/components/ui";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  CloudArrowDownIcon,
  BookOpenIcon,
  DocumentTextIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {RepoListSkeleton} from "./components/RepoListSkeleton";

export const RepoListPage = () => {
  const {repos, setRepoName, fetchRepos, createRepo, importRepo, isLoading} =
    useRepoStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<"create" | "import">("create");
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoTitle, setNewRepoTitle] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [addReadme, setAddReadme] = useState(false);
  const [addLicense, setAddLicense] = useState(false);
  const [addGitignore, setAddGitignore] = useState(false);
  const [importUrl, setImportUrl] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch = (repo.title || repo.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "archived"
            ? repo.archived
            : !repo.archived;

      return matchesSearch && matchesFilter;
    });
  }, [repos, searchQuery, filterStatus]);

  const handleCreateRepo = () => {
    if (newRepoName.trim()) {
      setRepoName(newRepoName.trim());

      if (createMode === "create") {
        createRepo(
          newRepoTitle.trim() || undefined,
          newRepoDescription.trim() || undefined,
          {
            defaultBranch,
            addReadme,
            addLicense,
            addGitignore,
          },
        );
      } else {
        if (!importUrl.trim()) return;
        importRepo(
          importUrl.trim(),
          newRepoTitle.trim() || undefined,
          newRepoDescription.trim() || undefined,
        );
      }

      setNewRepoName("");
      setNewRepoTitle("");
      setNewRepoDescription("");
      setDefaultBranch("main");
      setAddReadme(false);
      setAddLicense(false);
      setAddGitignore(false);
      setImportUrl("");
      setCreateMode("create");
      setShowCreateModal(false);
    }
  };

  // Build breadcrumbs for repo list page
  const breadcrumbs = [
    {
      label: "Repositories",
    },
  ];

  return (
    <MainLayout
      activeSidebarItem="repos"
      rightSidebar={<HelpSidebarContent />}
      headerActions={
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Create Repository</span>
          <span className="sm:hidden">Create</span>
        </Button>
      }
    >
      {isLoading && repos.length === 0 ? (
        <RepoListSkeleton />
      ) : (
        <div className="h-full flex flex-col">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-full space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                    Repositories
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Manage your git repositories and projects
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative group w-full sm:w-auto">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-app-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full sm:w-72 pl-10 pr-4 bg-app-surface border border-app-border rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-all shadow-sm"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center bg-app-surface border border-app-border rounded-lg p-1 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    {(["all", "active", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize whitespace-nowrap ${
                          filterStatus === status
                            ? "bg-app-hover text-text-primary shadow-sm"
                            : "text-text-tertiary hover:text-text-secondary"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-transparent">
                <RepoList repos={filteredRepos} selectedRepo={null} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Repository Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewRepoName("");
          setNewRepoTitle("");
          setNewRepoDescription("");
          setDefaultBranch("main");
          setAddReadme(false);
          setAddLicense(false);
          setAddGitignore(false);
          setImportUrl("");
          setCreateMode("create");
        }}
        title={
          createMode === "create"
            ? "Create New Repository"
            : "Import Repository"
        }
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewRepoName("");
                setNewRepoTitle("");
                setNewRepoDescription("");
                setDefaultBranch("main");
                setAddReadme(false);
                setAddLicense(false);
                setAddGitignore(false);
                setImportUrl("");
                setCreateMode("create");
              }}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRepo} className="flex-1 sm:flex-none">
              {createMode === "create"
                ? "Create Repository"
                : "Import Repository"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-app-surface rounded-lg">
            <button
              onClick={() => setCreateMode("create")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                createMode === "create"
                  ? "bg-app-hover text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <PlusCircleIcon className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setCreateMode("import")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                createMode === "import"
                  ? "bg-app-hover text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <CloudArrowDownIcon className="w-4 h-4" />
              Import Repository
            </button>
          </div>

          <div className="space-y-4">
            {createMode === "import" && (
              <div className="bg-app-surface/30 p-4 rounded-lg border border-app-border">
                <Input
                  label="Git URL"
                  placeholder="https://github.com/username/repo.git"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  required
                  helperText="The URL of the Git repository you want to import."
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Repository Name"
                  placeholder="my-awesome-project"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  required
                  helperText="Great repository names are short and memorable."
                />
                <Input
                  label="Title (optional)"
                  placeholder="My Awesome Project"
                  value={newRepoTitle}
                  onChange={(e) => setNewRepoTitle(e.target.value)}
                  helperText="A human-readable title for your project."
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  className="h-24 w-full px-3 py-2 bg-app-surface border border-app-border rounded-md text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors resize-none"
                  placeholder="What is this project about?"
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                />
              </div>
            </div>

            {createMode === "create" && (
              <div className="pt-2 border-t border-app-border">
                <h3 className="text-sm font-medium text-text-primary mb-3">
                  Initialization Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Default Branch"
                    placeholder="main"
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    helperText="Usually main or master."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      addReadme
                        ? "bg-app-accent/10 border-app-accent"
                        : "bg-app-surface/30 border-app-border hover:border-app-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <BookOpenIcon
                        className={`w-5 h-5 ${addReadme ? "text-app-accent" : "text-text-tertiary"}`}
                      />
                      <input
                        type="checkbox"
                        checked={addReadme}
                        onChange={(e) => setAddReadme(e.target.checked)}
                        className="rounded bg-app-bg border-app-border text-app-accent focus:ring-app-accent"
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${addReadme ? "text-text-primary" : "text-text-secondary"}`}
                    >
                      Add README
                    </span>
                  </label>

                  <label
                    className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      addLicense
                        ? "bg-app-accent/10 border-app-accent"
                        : "bg-app-surface/30 border-app-border hover:border-app-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <DocumentTextIcon
                        className={`w-5 h-5 ${addLicense ? "text-app-accent" : "text-text-tertiary"}`}
                      />
                      <input
                        type="checkbox"
                        checked={addLicense}
                        onChange={(e) => setAddLicense(e.target.checked)}
                        className="rounded bg-app-bg border-app-border text-app-accent focus:ring-app-accent"
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${addLicense ? "text-text-primary" : "text-text-secondary"}`}
                    >
                      Add License
                    </span>
                  </label>

                  <label
                    className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      addGitignore
                        ? "bg-app-accent/10 border-app-accent"
                        : "bg-app-surface/30 border-app-border hover:border-app-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <EyeSlashIcon
                        className={`w-5 h-5 ${addGitignore ? "text-app-accent" : "text-text-tertiary"}`}
                      />
                      <input
                        type="checkbox"
                        checked={addGitignore}
                        onChange={(e) => setAddGitignore(e.target.checked)}
                        className="rounded bg-app-bg border-app-border text-app-accent focus:ring-app-accent"
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${addGitignore ? "text-text-primary" : "text-text-secondary"}`}
                    >
                      Add .gitignore
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
