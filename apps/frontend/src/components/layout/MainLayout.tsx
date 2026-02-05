import {useState, type ReactNode} from "react";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {Footer} from "./Footer";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      {/* Header */}
      <Header
        actions={headerActions}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          activeItem={activeSidebarItem}
          onItemClick={onSidebarItemClick}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-app-bg flex flex-col">
          <div className="px-4 py-6 w-full flex-1">{children}</div>
          <Footer />
        </main>

        {/* Right Sidebar (Contextual) */}
        {rightSidebar && (
          <aside className="hidden lg:flex w-80 bg-app-surface border-l border-app-border flex-col">
            <div className="flex-1 overflow-auto p-5">{rightSidebar}</div>
            {rightSidebarFooter && (
              <div className="border-t border-app-border p-4">
                {rightSidebarFooter}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
