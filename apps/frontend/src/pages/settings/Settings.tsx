import {useState} from "react";
import axios from "axios";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs} from "~/components/ui";
import {Button, Select, Alert} from "~/components/ui";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "security" | "appearance"
  >("general");
  const [loading, setLoading] = useState(false);
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace with actual API endpoint
      await axios.put("/api/settings", {
        general: generalSettings,
        notifications: notificationSettings,
        security: securitySettings,
      });
      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save settings");
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
    <MainLayout activeSidebarItem="settings">
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] mb-1">
            Settings
          </h1>
          <p className="text-sm text-[#b0b0b0]">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Settings Content */}
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
                        onClick={() => setActiveTab(tab.id)}
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

            {/* Settings Panel */}
            <div className="lg:col-span-3">
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
                {/* General Settings */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
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
                            {value: "America/New_York", label: "Eastern Time"},
                            {value: "America/Chicago", label: "Central Time"},
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
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        Notification Preferences
                      </h2>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-[#3d3d3d] cursor-pointer hover:bg-[#353535] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#e8e8e8]">
                              Email Notifications
                            </p>
                            <p className="text-xs text-[#b0b0b0] mt-1">
                              Receive notifications via email
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-[#3d3d3d] cursor-pointer hover:bg-[#353535] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#e8e8e8]">
                              Push Notifications
                            </p>
                            <p className="text-xs text-[#b0b0b0] mt-1">
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
                            className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-[#3d3d3d] cursor-pointer hover:bg-[#353535] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#e8e8e8]">
                              Commit Notifications
                            </p>
                            <p className="text-xs text-[#b0b0b0] mt-1">
                              Get notified about new commits
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.commitNotifications}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                commitNotifications: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-[#3d3d3d] cursor-pointer hover:bg-[#353535] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#e8e8e8]">
                              Branch Notifications
                            </p>
                            <p className="text-xs text-[#b0b0b0] mt-1">
                              Get notified about branch changes
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.branchNotifications}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                branchNotifications: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
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
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        Security Settings
                      </h2>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-app-bg rounded border border-[#3d3d3d] cursor-pointer hover:bg-[#353535] transition-colors">
                          <div>
                            <p className="text-sm font-medium text-[#e8e8e8]">
                              Two-Factor Authentication
                            </p>
                            <p className="text-xs text-[#b0b0b0] mt-1">
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
                            className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
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
                      <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                        Appearance
                      </h2>
                      <p className="text-sm text-[#b0b0b0]">
                        Appearance settings coming soon...
                      </p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-[#3d3d3d]">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
