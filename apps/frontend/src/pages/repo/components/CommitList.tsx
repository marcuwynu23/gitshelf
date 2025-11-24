import React from "react";

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
  <div className="flex-1 mt-2 mb-2 h-[50vh] overflow-y-auto">
    <h2 className="font-bold mb-3 text-sm text-white">Commits</h2>

    {commits.length ? (
      <ul className="space-y-2">
        {commits.map((c) => (
          <li key={c.hash} className="p-2">
            <p className="consolas font-medium text-white text-xs">
              {c.message}
            </p>
            <p className="consolas text-[7pt] text-gray-500">
              {c.author} • {new Date(c.date).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">#{c.hash.slice(0, 7)}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No commits.</p>
    )}
  </div>
);
