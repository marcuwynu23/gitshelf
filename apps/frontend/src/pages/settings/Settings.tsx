import {useState, useEffect} from "react";
import axios from "axios";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {Breadcrumbs} from "~/components/ui";
import {Button, Select, Alert} from "~/components/ui";
import {SettingsSkeleton} from "./components/SettingsSkeleton";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {useThemeStore} from "~/stores/themeStore";

export const Settings = () => {
  const {setTheme} = useThemeStore();
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "security" | "appearance"
  >("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    commitNotifications: true,
    branchNotifications: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "dark",
    fontSize: "medium",
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const response = await axios.get("/api/settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const settings = response.data;

        if (settings.general) {
          setGeneralSettings(settings.general);
        }
        if (settings.notifications) {
          setNotificationSettings(settings.notifications);
        }
        if (settings.security) {
          setSecuritySettings(settings.security);
        }
        if (settings.appearance) {
          setAppearanceSettings(settings.appearance);
          setTheme(settings.appearance.theme as any);
        }
      } catch (err: any) {
        // If 401, user is not authenticated - that's okay, use defaults
        if (err?.response?.status !== 401) {
          console.error("Failed to fetch settings:", err);
          setError("Failed to load settings");
        }
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        "/api/settings",
        {
          general: generalSettings,
          notifications: notificationSettings,
          security: securitySettings,
          appearance: appearanceSettings,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Please log in to save settings");
      } else {
        setError(err?.response?.data?.error || "Failed to save settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    {
      label: "Settings",
    },
  ];

  const tabs = [
    {id: "general" as const, label: "General", icon: Cog6ToothIcon},
    {id: "notifications" as const, label: "Notifications", icon: BellIcon},
    {id: "security" as const, label: "Security", icon: ShieldCheckIcon},
    {id: "appearance" as const, label: "Appearance", icon: GlobeAltIcon},
  ];

  return (
    <MainLayout
      activeSidebarItem="settings"
      rightSidebar={<HelpSidebarContent />}
    >
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Settings
                </h2>
                <p className="text-sm text-text-secondary">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Alerts */}
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Settings Content */}
            {fetching ? (
              <SettingsSkeleton />
            ) : (
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
                            onClick={() => setActiveTab(tab.id)}
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

                {/* Settings Panel */}
                <div className="lg:col-span-3">
                  <div className="bg-app-surface border border-app-border rounded-lg p-6">
                    {/* General Settings */}
                    {activeTab === "general" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary mb-4">
                            General Settings
                          </h2>
                          <div className="space-y-4">
                            <Select
                              label="Language"
                              value={generalSettings.language}
                              onChange={(value) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  language: value,
                                })
                              }
                              options={[
                                {value: "en", label: "English"},
                                {value: "es", label: "Spanish"},
                                {value: "fr", label: "French"},
                                {value: "de", label: "German"},
                              ]}
                            />

                            <Select
                              label="Timezone"
                              value={generalSettings.timezone}
                              onChange={(value) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  timezone: value,
                                })
                              }
                              options={[
                                {value: "UTC", label: "UTC"},
                                {
                                  value: "America/New_York",
                                  label: "Eastern Time",
                                },
                                {
                                  value: "America/Chicago",
                                  label: "Central Time",
                                },
                                {
                                  value: "America/Los_Angeles",
                                  label: "Pacific Time",
                                },
                                {value: "Europe/London", label: "London"},
                                {value: "Europe/Paris", label: "Paris"},
                              ]}
                            />

                            <Select
                              label="Date Format"
                              value={generalSettings.dateFormat}
                              onChange={(value) =>
                                setGeneralSettings({
                                  ...generalSettings,
                                  dateFormat: value,
                                })
                              }
                              options={[
                                {value: "MM/DD/YYYY", label: "MM/DD/YYYY"},
                                {value: "DD/MM/YYYY", label: "DD/MM/YYYY"},
                                {value: "YYYY-MM-DD", label: "YYYY-MM-DD"},
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary mb-4">
                            Notification Preferences
                          </h2>
                          <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-app-border cursor-pointer hover:bg-app-hover transition-colors">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  Email Notifications
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  Receive notifications via email
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  notificationSettings.emailNotifications
                                }
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    emailNotifications: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-app-border bg-app-surface text-app-accent focus:ring-app-accent"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-app-border cursor-pointer hover:bg-app-hover transition-colors">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  Push Notifications
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  Receive browser push notifications
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={notificationSettings.pushNotifications}
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    pushNotifications: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-app-border bg-app-surface text-app-accent focus:ring-app-accent"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-app-border cursor-pointer hover:bg-app-hover transition-colors">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  Commit Notifications
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  Get notified about new commits
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  notificationSettings.commitNotifications
                                }
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    commitNotifications: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-app-border bg-app-surface text-app-accent focus:ring-app-accent"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-app-border cursor-pointer hover:bg-app-hover transition-colors">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  Branch Notifications
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  Get notified about branch changes
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  notificationSettings.branchNotifications
                                }
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    branchNotifications: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-app-border bg-app-surface text-app-accent focus:ring-app-accent"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary mb-4">
                            Security Settings
                          </h2>
                          <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-app-border cursor-pointer hover:bg-app-hover transition-colors">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  Two-Factor Authentication
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  Add an extra layer of security to your account
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={securitySettings.twoFactorEnabled}
                                onChange={(e) =>
                                  setSecuritySettings({
                                    ...securitySettings,
                                    twoFactorEnabled: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-app-border bg-app-surface text-app-accent focus:ring-app-accent"
                              />
                            </label>

                            <Select
                              label="Session Timeout (minutes)"
                              value={securitySettings.sessionTimeout}
                              onChange={(value) =>
                                setSecuritySettings({
                                  ...securitySettings,
                                  sessionTimeout: value,
                                })
                              }
                              options={[
                                {value: "15", label: "15 minutes"},
                                {value: "30", label: "30 minutes"},
                                {value: "60", label: "1 hour"},
                                {value: "120", label: "2 hours"},
                                {value: "0", label: "Never"},
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === "appearance" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-semibold text-text-primary mb-4">
                            Appearance
                          </h2>
                          <div className="space-y-4">
                            <Select
                              label="Theme"
                              value={appearanceSettings.theme}
                              onChange={(value) => {
                                setAppearanceSettings({
                                  ...appearanceSettings,
                                  theme: value,
                                });
                                setTheme(value as any);
                              }}
                              options={[
                                {value: "dark", label: "Dark"},
                                {value: "light", label: "Light"},
                                {value: "auto", label: "Auto"},
                              ]}
                            />

                            <Select
                              label="Font Size"
                              value={appearanceSettings.fontSize}
                              onChange={(value) =>
                                setAppearanceSettings({
                                  ...appearanceSettings,
                                  fontSize: value,
                                })
                              }
                              options={[
                                {value: "small", label: "Small"},
                                {value: "medium", label: "Medium"},
                                {value: "large", label: "Large"},
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-app-border">
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
