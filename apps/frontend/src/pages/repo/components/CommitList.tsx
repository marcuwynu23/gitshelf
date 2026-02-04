import {ClockIcon, XMarkIcon} from "@heroicons/react/24/outline";
import React, {useMemo, useState} from "react";

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface CommitListProps {
  commits: Commit[];
  previewCount?: number;
}

export const CommitList: React.FC<CommitListProps> = ({
  commits,
  previewCount = 4,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const latestCommits = useMemo(
    () => commits.slice(0, previewCount),
    [commits, previewCount],
  );

  if (!commits || commits.length === 0) {
    return <p className="text-text-tertiary text-xs">No commits found</p>;
  }

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <ClockIcon className="w-4 h-4 text-text-secondary" />
        <h2 className="text-sm font-medium text-text-primary uppercase">
          Recent Commits
        </h2>
      </div>

      <CommitItems commits={latestCommits} />

      {commits.length >= previewCount && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-2 text-xs text-app-accent hover:underline"
          >
            View all commits
          </button>
        </div>
      )}

      {isOpen && (
        <CommitDialog commits={commits} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

const CommitItems: React.FC<{commits: Commit[]}> = ({commits}) => (
  <ul className="space-y-1">
    {commits.map((c) => (
      <li
        key={c.hash}
        className="block px-2 py-2 rounded-md hover:bg-app-bg/60 transition-colors"
      >
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-[6pt]">
            <span className="font-medium text-text-primary truncate">
              {c.author}
            </span>
          </div>

          <span className="text-xs text-text-secondary truncate border-b border-gray-700 pb-0.5">
            {c.message}
          </span>
          <div className="flex items-center gap-2 text-[7pt] text-text-tertiary">
            <span className="mr-auto">{new Date(c.date).toDateString()}</span>
            <span className="font-mono text-app-accent">
              {c.hash.slice(0, 7)}
            </span>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

interface CommitDialogProps {
  commits: Commit[];
  onClose: () => void;
}

const CommitDialog: React.FC<CommitDialogProps> = ({commits, onClose}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-app-bg rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-medium">All commits</h3>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto">
          <CommitItems commits={commits} />
        </div>
      </div>
    </div>
  );
};

export default CommitList;
