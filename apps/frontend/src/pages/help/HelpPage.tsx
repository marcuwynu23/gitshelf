import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs} from "~/components/ui";
import {docs} from "./data/docs";
import {
  BookOpenIcon,
  CommandLineIcon,
  LifebuoyIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {apiEndpoints} from "./data/api";
import {supportOptions, faq} from "./data/support";

export const HelpPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const articleId = searchParams.get("article");
  const activeTab: "docs" | "api" | "support" =
    tabParam === "api" || tabParam === "support" || tabParam === "docs"
      ? (tabParam as "docs" | "api" | "support")
      : "docs";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTabChange = (tab: "docs" | "api" | "support") => {
    setSearchParams({tab});
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const activeArticle = docs.find((d) => d.id === articleId);

  const breadcrumbs = [
    {
      label: "Help Center",
      path: "/help",
    },
    ...(activeTab === "docs" && activeArticle
      ? [
          {
            label: "Documentation",
            path: "/help?tab=docs",
          },
          {
            label: activeArticle.title,
          },
        ]
      : []),
    ...(activeTab === "api"
      ? [
          {
            label: "API References",
          },
        ]
      : []),
    ...(activeTab === "support"
      ? [
          {
            label: "Support",
          },
        ]
      : []),
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
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6 min-h-[500px]">
                {/* Documentation */}
                {activeTab === "docs" && (
                  <div className="space-y-6">
                    {activeArticle ? (
                      <div>
                        <button
                          onClick={() => setSearchParams({tab: "docs"})}
                          className="flex items-center gap-2 text-sm text-[#b0b0b0] hover:text-[#e8e8e8] mb-4 transition-colors"
                        >
                          <ArrowLeftIcon className="w-4 h-4" />
                          Back to Documentation
                        </button>
                        <h2 className="text-2xl font-bold text-[#e8e8e8] mb-6">
                          {activeArticle.title}
                        </h2>
                        <div className="prose prose-invert max-w-none text-[#b0b0b0]">
                          {activeArticle.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                          Documentation
                        </h2>
                        <p className="text-[#b0b0b0] mb-8">
                          Welcome to the GitShelf documentation. Select a topic
                          below to get started.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-md font-medium text-app-accent mb-4 flex items-center gap-2">
                              <BookOpenIcon className="w-5 h-5" />
                              Getting Started
                            </h3>
                            <ul className="space-y-2">
                              {docs
                                .filter((d) => d.category === "Getting Started")
                                .map((doc) => (
                                  <li key={doc.id}>
                                    <button
                                      onClick={() =>
                                        setSearchParams({
                                          tab: "docs",
                                          article: doc.id,
                                        })
                                      }
                                      className="text-[#b0b0b0] hover:text-[#e8e8e8] hover:underline text-left"
                                    >
                                      {doc.title}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="text-md font-medium text-app-accent mb-4 flex items-center gap-2">
                              <CommandLineIcon className="w-5 h-5" />
                              Advanced Features
                            </h3>
                            <ul className="space-y-2">
                              {docs
                                .filter(
                                  (d) => d.category === "Advanced Features",
                                )
                                .map((doc) => (
                                  <li key={doc.id}>
                                    <button
                                      onClick={() =>
                                        setSearchParams({
                                          tab: "docs",
                                          article: doc.id,
                                        })
                                      }
                                      className="text-[#b0b0b0] hover:text-[#e8e8e8] hover:underline text-left"
                                    >
                                      {doc.title}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* API References */}
                {activeTab === "api" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8e8e8] mb-4">
                        API References
                      </h2>
                      <p className="text-[#b0b0b0] mb-6">
                        GitShelf provides a REST API to interact with your
                        repositories programmatically. All API access is over
                        HTTPS, and accessed from{" "}
                        <code className="bg-[#2f2f2f] px-1 py-0.5 rounded text-app-accent">
                          https://api.gitshelf.com
                        </code>
                        .
                      </p>
                    </div>

                    <div className="space-y-8">
                      {apiEndpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="border border-[#3d3d3d] rounded-lg overflow-hidden"
                        >
                          <div className="bg-[#2f2f2f] px-4 py-3 border-b border-[#3d3d3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                  endpoint.method === "GET"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : endpoint.method === "POST"
                                      ? "bg-green-500/20 text-green-400"
                                      : endpoint.method === "DELETE"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-sm text-[#e8e8e8] font-medium">
                                {endpoint.path}
                              </code>
                            </div>
                          </div>

                          <div className="p-4 bg-app-surface">
                            <p className="text-[#b0b0b0] mb-4 text-sm">
                              {endpoint.description}
                            </p>

                            {endpoint.parameters &&
                              endpoint.parameters.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-2">
                                    Parameters
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                      <thead className="text-xs text-[#808080] bg-[#2f2f2f] uppercase">
                                        <tr>
                                          <th className="px-3 py-2 rounded-tl-md">
                                            Name
                                          </th>
                                          <th className="px-3 py-2">Type</th>
                                          <th className="px-3 py-2">
                                            Required
                                          </th>
                                          <th className="px-3 py-2 rounded-tr-md">
                                            Description
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {endpoint.parameters.map(
                                          (param, idx) => (
                                            <tr
                                              key={idx}
                                              className="border-b border-[#2f2f2f] last:border-0"
                                            >
                                              <td className="px-3 py-2 font-mono text-app-accent">
                                                {param.name}
                                              </td>
                                              <td className="px-3 py-2 text-[#b0b0b0]">
                                                {param.type}
                                              </td>
                                              <td className="px-3 py-2">
                                                {param.required ? (
                                                  <span className="text-red-400 text-xs">
                                                    Yes
                                                  </span>
                                                ) : (
                                                  <span className="text-[#808080] text-xs">
                                                    No
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 text-[#b0b0b0]">
                                                {param.description}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                            <div>
                              <h4 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-2">
                                Example Request
                              </h4>
                              <div className="bg-[#1e1e1e] p-3 rounded-md overflow-x-auto group relative">
                                <pre className="text-sm font-mono text-[#e8e8e8] whitespace-pre-wrap">
                                  {endpoint.example}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support */}
                {activeTab === "support" && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8e8e8] mb-4">
                        Support Center
                      </h2>
                      <p className="text-[#b0b0b0] mb-8">
                        Need help? Choose one of the options below to get in
                        touch with us or find answers to your questions.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {supportOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <a
                              key={option.id}
                              href={option.link}
                              className="block bg-app-surface border border-[#3d3d3d] rounded-xl p-6 hover:border-app-accent/50 hover:bg-[#2a2a2a] transition-all group"
                            >
                              <div className="bg-app-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6 text-app-accent" />
                              </div>
                              <h3 className="text-lg font-semibold text-[#e8e8e8] mb-2">
                                {option.title}
                              </h3>
                              <p className="text-sm text-[#b0b0b0] mb-4 h-10 line-clamp-2">
                                {option.description}
                              </p>
                              <span className="text-app-accent text-sm font-medium group-hover:underline">
                                {option.action} &rarr;
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    {/* FAQ Section */}
                    <div>
                      <h3 className="text-xl font-bold text-[#e8e8e8] mb-6">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-4">
                        {faq.map((item, index) => (
                          <div
                            key={index}
                            className="border border-[#3d3d3d] rounded-lg overflow-hidden bg-app-surface"
                          >
                            <button
                              onClick={() => toggleFaq(index)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#2a2a2a] transition-colors"
                            >
                              <span className="font-medium text-[#e8e8e8]">
                                {item.question}
                              </span>
                              {openFaq === index ? (
                                <ChevronUpIcon className="w-5 h-5 text-[#808080]" />
                              ) : (
                                <ChevronDownIcon className="w-5 h-5 text-[#808080]" />
                              )}
                            </button>
                            {openFaq === index && (
                              <div className="px-6 pb-4 text-[#b0b0b0] text-sm leading-relaxed border-t border-[#3d3d3d]/50 pt-4">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        ))}
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
