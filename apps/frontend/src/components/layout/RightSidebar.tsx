import React from "react";

interface RightSidebarProps {
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ title = "Overview", children, footer, className = "" }) => {
  return (
    <aside className={`w-72 bg-app-surface border-l border-[#3d3d3d] flex flex-col shadow-md ${className}`}>
      <div className="px-4 py-3 border-b border-[#2f2f2f] bg-gradient-to-b from-black/5 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#e8e8e8]">{title}</h3>
          <div className="text-xs text-[#9b9b9b]">{/* place for small controls */}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">{children}</div>

      {footer && <div className="border-t border-[#2f2f2f] p-4 bg-gradient-to-t from-black/5 to-transparent">{footer}</div>}
    </aside>
  );
};

export default RightSidebar;
