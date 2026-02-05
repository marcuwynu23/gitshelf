import React, {useState, useEffect, useMemo, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {Modal} from "~/components/ui/Modal";
import {useRepoStore} from "~/stores/repoStore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: "repo" | "page" | "action";
  title: string;
  description?: string;
  path?: string;
  action?: () => void;
  icon?: React.ElementType;
}

export const SearchModal: React.FC<SearchModalProps> = ({isOpen, onClose}) => {
  const navigate = useNavigate();
  const {repos} = useRepoStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const staticResults: SearchResult[] = useMemo(
    () => [
      {
        id: "dashboard",
        type: "page",
        title: "Dashboard",
        description: "Go to your dashboard",
        path: "/dashboard",
      },
      {
        id: "settings",
        type: "page",
        title: "Settings",
        description: "Manage your account settings",
        path: "/settings",
      },
      {
        id: "help",
        type: "page",
        title: "Help Center",
        description: "Documentation and support",
        path: "/help",
      },
      {
        id: "create-repo",
        type: "action",
        title: "Create Repository",
        description: "Start a new project",
        path: "/repos",
      },
    ],
    [],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();

    // Search Static Pages
    const matchedPages = staticResults.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery),
    );

    // Search Repositories
    const matchedRepos = repos
      .filter(
        (repo) =>
          repo.name.toLowerCase().includes(lowerQuery) ||
          repo.description?.toLowerCase().includes(lowerQuery),
      )
      .map((repo) => ({
        id: `repo-${repo.name}`,
        type: "repo" as const,
        title: repo.name,
        description: repo.description || "Repository",
        path: `/repo/${repo.name}`,
      }));

    return [...matchedPages, ...matchedRepos];
  }, [query, repos, staticResults]);

  const handleSelect = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
    } else if (result.action) {
      result.action();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnBackdrop={true}
      title="Search"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808080]" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-app-bg border border-[#3d3d3d] rounded-md py-2.5 pl-10 pr-4 text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent transition-colors"
            placeholder="Search repositories, pages, settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="text-center text-[#808080] py-8">
              <p>Type to search...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center text-[#808080] py-8">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-[#353535] text-left group transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[#e8e8e8] font-medium group-hover:text-app-accent transition-colors">
                      {result.title}
                    </span>
                    {result.description && (
                      <span className="text-xs text-[#808080]">
                        {result.description}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#606060] uppercase tracking-wider bg-[#2a2a2a] px-2 py-1 rounded">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
