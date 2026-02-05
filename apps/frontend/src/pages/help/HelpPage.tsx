import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs} from "~/components/ui";
import {
  BookOpenIcon,
  CommandLineIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

export const HelpPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"docs" | "api" | "support">(
    "docs",
  );

  useEffect(() => {
    if (tabParam === "api" || tabParam === "support" || tabParam === "docs") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "docs" | "api" | "support") => {
    setActiveTab(tab);
    setSearchParams({tab});
  };

  const breadcrumbs = [
    {
      label: "Help Center",
    },
  ];

  const tabs = [
    {id: "docs" as const, label: "Documentation", icon: BookOpenIcon},
    {id: "api" as const, label: "API References", icon: CommandLineIcon},
    {id: "support" as const, label: "Support", icon: LifebuoyIcon},
  ];

  return (
    <MainLayout activeSidebarItem="help">
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm text-[#b0b0b0]">
            Guides, references, and support for using GitShelf
          </p>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${
                          activeTab === tab.id
                            ? "bg-app-accent/10 text-app-accent"
                            : "text-[#b0b0b0] hover:text-[#e8e8e8] hover:bg-[#353535]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Panel */}
            <div className="lg:col-span-3">
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
                {/* Documentation */}
                {activeTab === "docs" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        Documentation
                      </h2>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-[#b0b0b0]">
                          Welcome to the GitShelf documentation. Here you can
                          find comprehensive guides and tutorials to help you
                          start working with GitShelf as quickly as possible.
                        </p>

                        <h3 className="text-md font-medium text-[#e8e8e8] mt-6 mb-2">
                          Getting Started
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-[#b0b0b0]">
                          <li>Setting up your account</li>
                          <li>Creating your first repository</li>
                          <li>Cloning and pushing code</li>
                          <li>Managing branches</li>
                        </ul>

                        <h3 className="text-md font-medium text-[#e8e8e8] mt-6 mb-2">
                          Advanced Features
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-[#b0b0b0]">
                          <li>Branch protection rules</li>
                          <li>Webhooks and integrations</li>
                          <li>Team management and permissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* API References */}
                {activeTab === "api" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        API References
                      </h2>
                      <p className="text-[#b0b0b0] mb-6">
                        GitShelf provides a REST API to interact with your
                        repositories programmatically.
                      </p>

                      <div className="space-y-4">
                        <div className="border border-[#3d3d3d] rounded-md overflow-hidden">
                          <div className="bg-[#2f2f2f] px-4 py-2 text-sm font-medium text-[#e8e8e8] border-b border-[#3d3d3d]">
                            Authentication
                          </div>
                          <div className="p-4 bg-[#1e1e1e]">
                            <code className="text-sm text-app-accent">
                              Authorization: Bearer &lt;your_token&gt;
                            </code>
                          </div>
                        </div>

                        <div className="border border-[#3d3d3d] rounded-md overflow-hidden">
                          <div className="bg-[#2f2f2f] px-4 py-2 text-sm font-medium text-[#e8e8e8] border-b border-[#3d3d3d] flex justify-between">
                            <span>List Repositories</span>
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                              GET
                            </span>
                          </div>
                          <div className="p-4 bg-[#1e1e1e]">
                            <code className="text-sm text-[#b0b0b0]">
                              /api/v1/repos
                            </code>
                          </div>
                        </div>

                        <div className="border border-[#3d3d3d] rounded-md overflow-hidden">
                          <div className="bg-[#2f2f2f] px-4 py-2 text-sm font-medium text-[#e8e8e8] border-b border-[#3d3d3d] flex justify-between">
                            <span>Get Repository Details</span>
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                              GET
                            </span>
                          </div>
                          <div className="p-4 bg-[#1e1e1e]">
                            <code className="text-sm text-[#b0b0b0]">
                              /api/v1/repos/:owner/:repo
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support */}
                {activeTab === "support" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        Support
                      </h2>
                      <p className="text-[#b0b0b0] mb-6">
                        Need help? Our support team is here to assist you.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-[#3d3d3d] rounded-lg p-4 hover:bg-[#353535] transition-colors cursor-pointer">
                          <h3 className="font-medium text-[#e8e8e8] mb-2">
                            Community Forum
                          </h3>
                          <p className="text-sm text-[#b0b0b0]">
                            Browse existing discussions or ask a new question in
                            our community forum.
                          </p>
                        </div>

                        <div className="border border-[#3d3d3d] rounded-lg p-4 hover:bg-[#353535] transition-colors cursor-pointer">
                          <h3 className="font-medium text-[#e8e8e8] mb-2">
                            Contact Support
                          </h3>
                          <p className="text-sm text-[#b0b0b0]">
                            Open a ticket directly with our support team for
                            personalized assistance.
                          </p>
                        </div>

                        <div className="border border-[#3d3d3d] rounded-lg p-4 hover:bg-[#353535] transition-colors cursor-pointer">
                          <h3 className="font-medium text-[#e8e8e8] mb-2">
                            System Status
                          </h3>
                          <p className="text-sm text-[#b0b0b0]">
                            Check the current status of GitShelf services and
                            API.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
