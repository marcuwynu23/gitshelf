import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="py-2 sm:py-6 mt-4 sm:mt-8 bg-[#2d2d2d] border-t border-[#3d3d3d]">
      <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 text-xs text-[#808080]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#b0b0b0]">GitShelf</span>
          <span className="bg-[#353535] px-1.5 py-0.5 rounded text-[10px]">
            v1.0.0
          </span>
        </div>
        <div className="flex gap-1 hidden sm:flex">
          <p>&copy; {new Date().getFullYear()} GitShelf Inc.</p>
          <span>•</span>
          <p>All rights reserved.</p>
        </div>
        <div className="flex gap-1 sm:hidden">
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};
