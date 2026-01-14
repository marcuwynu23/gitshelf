import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  rightSidebarFooter?: ReactNode;
  activeSidebarItem?: string;
  onSidebarItemClick?: (itemId: string) => void;
  headerActions?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  rightSidebar,
  rightSidebarFooter,
  activeSidebarItem,
  onSidebarItemClick,
  headerActions,
}) => {
  return (
    <div className="h-screen flex flex-col bg-app-bg">
      {/* Header */}
      <Header actions={headerActions} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeItem={activeSidebarItem} onItemClick={onSidebarItemClick} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-app-bg">
          <div className="px-4 py-6 h-full w-full">{children}</div>
        </main>

        {/* Right Sidebar (Contextual) */}
        {rightSidebar && (
          <aside className="w-70 bg-app-surface border-l border-app-border flex flex-col">
            <div className="flex-1 overflow-auto p-5">{rightSidebar}</div>
            {rightSidebarFooter && <div className="border-t border-app-border p-4">{rightSidebarFooter}</div>}
          </aside>
        )}
      </div>
    </div>
  );
};
