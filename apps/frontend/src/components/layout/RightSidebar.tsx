import React, {useState} from "react";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";

interface RightSidebarProps {
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  title,
  children,
  footer,
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside
        className={`w-12 bg-app-surface border-l border-app-border flex flex-col items-center py-4 ${className} transition-all duration-300`}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-app-hover rounded-md transition-colors"
          title="Expand Sidebar"
        >
          <ChevronDoubleLeftIcon className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`w-80 bg-app-surface border-l border-app-border flex flex-col shadow-md ${className} transition-all duration-300`}
    >
      <div className="px-4 py-3 border-b border-app-border flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-text-primary">
          {title || "Overview"}
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-text-tertiary hover:text-text-primary hover:bg-app-hover rounded transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">{children}</div>

      {footer && (
        <div className="border-t border-app-border p-4 bg-gradient-to-t from-black/5 to-transparent shrink-0">
          {footer}
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
