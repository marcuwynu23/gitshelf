import React, {useState} from "react";
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
          <p className="text-sm text-text-secondary">
            Guides, references, and support for using GitShelf
          </p>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-app-surface border border-app-border rounded-lg p-2">
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
                            : "text-text-secondary hover:text-text-primary hover:bg-app-hover"
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
              <div className="bg-app-surface border border-app-border rounded-lg p-6 min-h-[500px]">
                {/* Documentation */}
                {activeTab === "docs" && (
                  <div className="space-y-6">
                    {activeArticle ? (
                      <div>
                        <button
                          onClick={() => setSearchParams({tab: "docs"})}
                          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
                        >
                          <ArrowLeftIcon className="w-4 h-4" />
                          Back to Documentation
                        </button>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">
                          {activeArticle.title}
                        </h2>
                        <div className="prose prose-invert max-w-none text-text-secondary">
                          {activeArticle.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary mb-4">
                          Documentation
                        </h2>
                        <p className="text-text-secondary mb-8">
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
                                      className="text-text-secondary hover:text-text-primary hover:underline text-left"
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
                                      className="text-text-secondary hover:text-text-primary hover:underline text-left"
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
                      <h2 className="text-2xl font-bold text-text-primary mb-4">
                        API References
                      </h2>
                      <p className="text-text-secondary mb-6">
                        GitShelf provides a REST API to interact with your
                        repositories programmatically. All API access is over
                        HTTPS, and accessed from{" "}
                        <code className="bg-app-surface px-1 py-0.5 rounded text-app-accent">
                          https://api.gitshelf.com
                        </code>
                        .
                      </p>
                    </div>

                    <div className="space-y-8">
                      {apiEndpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="border border-app-border rounded-lg overflow-hidden"
                        >
                          <div className="bg-app-surface px-4 py-3 border-b border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                  endpoint.method === "GET"
                                    ? "bg-info/20 text-info"
                                    : endpoint.method === "POST"
                                      ? "bg-success/20 text-success"
                                      : endpoint.method === "DELETE"
                                        ? "bg-error/20 text-error"
                                        : "bg-warning/20 text-warning"
                                }`}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-sm text-text-primary font-medium">
                                {endpoint.path}
                              </code>
                            </div>
                          </div>

                          <div className="p-4 bg-app-surface">
                            <p className="text-text-secondary mb-4 text-sm">
                              {endpoint.description}
                            </p>

                            {endpoint.parameters &&
                              endpoint.parameters.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                                    Parameters
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                      <thead className="text-xs text-text-tertiary bg-app-surface uppercase">
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
                                              className="border-b border-app-border last:border-0"
                                            >
                                              <td className="px-3 py-2 font-mono text-app-accent">
                                                {param.name}
                                              </td>
                                              <td className="px-3 py-2 text-text-secondary">
                                                {param.type}
                                              </td>
                                              <td className="px-3 py-2">
                                                {param.required ? (
                                                  <span className="text-error text-xs">
                                                    Yes
                                                  </span>
                                                ) : (
                                                  <span className="text-text-tertiary text-xs">
                                                    No
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 text-text-secondary">
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
                              <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                                Example Request
                              </h4>
                              <div className="bg-app-bg p-3 rounded-md overflow-x-auto group relative">
                                <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap">
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
                      <h2 className="text-2xl font-bold text-text-primary mb-4">
                        Support Center
                      </h2>
                      <p className="text-text-secondary mb-8">
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
                              className="block bg-app-surface border border-app-border rounded-xl p-6 hover:border-app-accent/50 hover:bg-app-hover transition-all group"
                            >
                              <div className="bg-app-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6 text-app-accent" />
                              </div>
                              <h3 className="text-lg font-semibold text-text-primary mb-2">
                                {option.title}
                              </h3>
                              <p className="text-sm text-text-secondary mb-4 h-10 line-clamp-2">
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
                      <h3 className="text-xl font-bold text-text-primary mb-6">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-4">
                        {faq.map((item, index) => (
                          <div
                            key={index}
                            className="border border-app-border rounded-lg overflow-hidden bg-app-surface"
                          >
                            <button
                              onClick={() => toggleFaq(index)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-app-hover transition-colors"
                            >
                              <span className="font-medium text-text-primary">
                                {item.question}
                              </span>
                              {openFaq === index ? (
                                <ChevronUpIcon className="w-5 h-5 text-text-tertiary" />
                              ) : (
                                <ChevronDownIcon className="w-5 h-5 text-text-tertiary" />
                              )}
                            </button>
                            {openFaq === index && (
                              <div className="px-6 pb-4 text-text-secondary text-sm leading-relaxed border-t border-app-border/50 pt-4">
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
