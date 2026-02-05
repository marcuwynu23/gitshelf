import React from "react";
import {Link} from "react-router-dom";

export const HelpSidebarContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-[#808080] mb-3 uppercase tracking-wider">
          Quick Guides
        </h3>
        <ul className="space-y-4">
          <li>
            <Link to="/help?tab=docs" className="block group">
              <h4 className="text-sm font-medium text-app-accent group-hover:text-app-accent-hover transition-colors">
                Getting Started
              </h4>
              <p className="text-xs text-[#808080] mt-1 group-hover:text-[#b0b0b0] transition-colors">
                Learn how to create and manage your first repository with GitShelf.
              </p>
            </Link>
          </li>
          <li>
            <Link to="/help?tab=docs" className="block group">
              <h4 className="text-sm font-medium text-app-accent group-hover:text-app-accent-hover transition-colors">
                Branch Management
              </h4>
              <p className="text-xs text-[#808080] mt-1 group-hover:text-[#b0b0b0] transition-colors">
                Best practices for branching, merging, and maintaining a clean history.
              </p>
            </Link>
          </li>
          <li>
            <Link to="/help?tab=docs" className="block group">
              <h4 className="text-sm font-medium text-app-accent group-hover:text-app-accent-hover transition-colors">
                Collaborating
              </h4>
              <p className="text-xs text-[#808080] mt-1 group-hover:text-[#b0b0b0] transition-colors">
                Invite team members, manage permissions, and review code together.
              </p>
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-[#808080] mb-3 uppercase tracking-wider">
          Resources
        </h3>
        <ul className="space-y-2">
          <li>
            <Link to="/help?tab=docs" className="text-sm text-[#b0b0b0] hover:text-app-accent transition-colors flex items-center gap-2">
              <span>Documentation</span>
            </Link>
          </li>
          <li>
            <Link to="/help?tab=api" className="text-sm text-[#b0b0b0] hover:text-app-accent transition-colors flex items-center gap-2">
              <span>API Reference</span>
            </Link>
          </li>
          <li>
            <Link to="/help?tab=support" className="text-sm text-[#b0b0b0] hover:text-app-accent transition-colors flex items-center gap-2">
              <span>Support</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
