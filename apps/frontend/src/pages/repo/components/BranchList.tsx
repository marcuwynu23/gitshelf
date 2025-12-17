import React from "react";
import {CodeBracketIcon} from "@heroicons/react/24/outline";
import {Badge} from "~/components/ui";

interface BranchListProps {
  branches: string[];
  currentBranch: string | null;
}

export const BranchList: React.FC<BranchListProps> = ({
  branches,
  currentBranch,
}) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <CodeBracketIcon className="w-4 h-4 text-[#808080]" />
      <h2 className="text-sm font-semibold text-[#e8e8e8] uppercase tracking-wider">
        Branches
      </h2>
    </div>
    {branches.length === 0 ? (
      <p className="text-[#808080] text-xs">No branches found</p>
    ) : (
      <div className="space-y-1">
        {branches.map((branch) => (
          <div
            key={branch}
            className={`p-2.5 rounded border transition-colors ${
              branch === currentBranch
                ? "bg-app-accent/10 border-app-accent"
                : "bg-transparent border-transparent hover:bg-[#353535] hover:border-[#3d3d3d]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-[#e8e8e8]">{branch}</span>
              {branch === currentBranch && (
                <Badge variant="success" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
