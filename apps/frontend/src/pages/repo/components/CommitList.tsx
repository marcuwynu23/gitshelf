import React from "react";
import {ClockIcon, UserIcon} from "@heroicons/react/24/outline";

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

interface CommitListProps {
  commits: Commit[];
}

export const CommitList: React.FC<CommitListProps> = ({commits}) => (
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-4">
      <ClockIcon className="w-4 h-4 text-[#808080]" />
      <h2 className="text-sm font-semibold text-[#e8e8e8] uppercase tracking-wider">
        Recent Commits
      </h2>
    </div>

    {commits.length === 0 ? (
      <p className="text-[#808080] text-xs">No commits found</p>
    ) : (
      <div className="space-y-2">
        {commits.map((commit) => (
          <div
            key={commit.hash}
            className="p-3 rounded border border-[#3d3d3d] bg-app-bg hover:bg-[#353535] hover:border-[#3d3d3d] transition-colors"
          >
            <p className="text-sm text-[#e8e8e8] mb-2 line-clamp-2">
              {commit.message}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#b0b0b0]">
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                <span>{commit.author}</span>
              </div>
              <span className="font-mono text-app-accent">
                {commit.hash.slice(0, 7)}
              </span>
            </div>
            <p className="text-xs text-[#808080] mt-1">
              {new Date(commit.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);
