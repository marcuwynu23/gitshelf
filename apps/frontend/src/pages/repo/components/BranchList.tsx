import React from "react";

interface BranchListProps {
  branches: string[];
  currentBranch: string;
}

export const BranchList: React.FC<BranchListProps> = ({
  branches,
  currentBranch,
}) => (
  <div className="">
    <h2 className="font-bold text-sm mb-2 text-white">Branches</h2>
    <ul className="space-y-1">
      {branches.map((b) => (
        <li
          key={b}
          className={`p-1 consolas text-xs  w-20 text-center  shadow ${
            b === currentBranch
              ? "bg-green-300 font-semibold"
              : " bg-black border border-green-400 text-green-200"
          }`}
        >
          {b}
        </li>
      ))}
    </ul>
  </div>
);
