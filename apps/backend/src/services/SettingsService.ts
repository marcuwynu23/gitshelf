import fs from "fs";
import path from "path";
import {UserSettings, UpdateSettingsRequest} from "../models/Settings";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// Ensure data directory exists
const dataDir = path.dirname(SETTINGS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {recursive: true});
}

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify([], null, 2));
}

// Default settings
const DEFAULT_GENERAL = {
  language: "en",
  timezone: "UTC",
  dateFormat: "MM/DD/YYYY",
};

const DEFAULT_NOTIFICATIONS = {
  emailNotifications: true,
  pushNotifications: false,
  commitNotifications: true,
  branchNotifications: false,
};

const DEFAULT_SECURITY = {
  twoFactorEnabled: false,
  sessionTimeout: "30",
};

const DEFAULT_APPEARANCE = {
  theme: "dark",
  fontSize: "medium",
};

export class SettingsService {
  private getSettings(): UserSettings[] {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  private saveSettings(settings: UserSettings[]): void {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  }

  async getByUserId(userId: string): Promise<UserSettings> {
    const allSettings = this.getSettings();
    const userSettings = allSettings.find((s) => s.userId === userId);

    if (userSettings) {
      return userSettings;
    }

    // Return default settings if user has no settings
    return this.createDefaultSettings(userId);
  }

  async update(userId: string, updates: UpdateSettingsRequest): Promise<UserSettings> {
    const allSettings = this.getSettings();
    const settingsIndex = allSettings.findIndex((s) => s.userId === userId);

    let userSettings: UserSettings;

    if (settingsIndex === -1) {
      // Create new settings with defaults
      userSettings = this.createDefaultSettings(userId);
      allSettings.push(userSettings);
    } else {
      userSettings = allSettings[settingsIndex];
    }

    // Merge updates
    if (updates.general) {
      userSettings.general = {
        ...userSettings.general,
        ...updates.general,
      };
    }

    if (updates.notifications) {
      userSettings.notifications = {
        ...userSettings.notifications,
        ...updates.notifications,
      };
    }

    if (updates.security) {
      userSettings.security = {
        ...userSettings.security,
        ...updates.security,
      };
    }

    if (updates.appearance) {
      userSettings.appearance = {
        ...userSettings.appearance,
        ...updates.appearance,
      };
    }

    userSettings.updatedAt = new Date().toISOString();

    // Update or add to array
    if (settingsIndex === -1) {
      allSettings.push(userSettings);
    } else {
      allSettings[settingsIndex] = userSettings;
    }

    this.saveSettings(allSettings);
    return userSettings;
  }

  private createDefaultSettings(userId: string): UserSettings {
    return {
      userId,
      general: {...DEFAULT_GENERAL},
      notifications: {...DEFAULT_NOTIFICATIONS},
      security: {...DEFAULT_SECURITY},
      appearance: {...DEFAULT_APPEARANCE},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

