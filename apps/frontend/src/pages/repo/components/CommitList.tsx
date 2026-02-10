import {ClockIcon} from "@heroicons/react/24/outline";
import React, {useMemo, useState} from "react";
import {Button, Modal} from "~/components/ui";

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
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-4 h-4 text-text-tertiary" />
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
          Commits
        </h2>
      </div>

      <div className="relative pl-2">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-app-border" />

        <CommitItems commits={latestCommits} />
      </div>

      {commits.length >= previewCount && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs text-app-accent hover:text-app-accent-hover"
          >
            View all commits
          </Button>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Commit History"
        size="lg"
        closeOnBackdrop={true}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 relative pl-2">
          {/* Timeline line in modal */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-app-border" />
          <CommitItems commits={commits} />
        </div>
      </Modal>
    </div>
  );
};

const CommitItems: React.FC<{commits: Commit[]}> = ({commits}) => (
  <ul className="space-y-4 relative z-0">
    {commits.map((c) => (
      <li key={c.hash} className="group relative flex gap-4 items-start">
        {/* Timeline dot */}
        <div className="mt-1.5 w-2 h-2 rounded-full bg-text-tertiary ring-4 ring-app-bg group-hover:bg-app-accent transition-colors shrink-0 z-10" />

        <div className="flex-1 min-w-0 bg-transparent rounded-md group-hover:bg-app-hover/50 transition-colors -ml-2 pl-2 py-1 pr-2">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className="text-sm font-medium text-text-primary truncate">
              {c.message}
            </span>
            <span className="text-[10px] font-mono text-app-accent shrink-0 bg-app-accent/10 px-1.5 py-0.5 rounded">
              {c.hash.slice(0, 7)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="font-medium text-text-secondary truncate max-w-[150px]">
              {c.author}
            </span>
            <span>•</span>
            <span>
              {new Date(c.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default CommitList;
