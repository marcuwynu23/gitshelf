import { UserSettings, UpdateSettingsRequest } from "../models/Settings";
import { SettingsModel } from "../models/sequelize/Settings";

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

// Helper function to convert Sequelize model to UserSettings interface
function modelToSettings(model: SettingsModel): UserSettings {
  return {
    userId: model.userId,
    general: model.general as UserSettings["general"],
    notifications: model.notifications as UserSettings["notifications"],
    security: model.security as UserSettings["security"],
    appearance: model.appearance as UserSettings["appearance"],
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

export class SettingsService {
  async getByUserId(userId: string): Promise<UserSettings> {
    let settingsModel = await SettingsModel.findOne({
      where: { userId },
    });

    if (!settingsModel) {
      // Create default settings if user has no settings
      settingsModel = await SettingsModel.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId,
        general: DEFAULT_GENERAL,
        notifications: DEFAULT_NOTIFICATIONS,
        security: DEFAULT_SECURITY,
        appearance: DEFAULT_APPEARANCE,
      });
    }

    return modelToSettings(settingsModel);
  }

  async update(userId: string, updates: UpdateSettingsRequest): Promise<UserSettings> {
    let settingsModel = await SettingsModel.findOne({
      where: { userId },
    });

    if (!settingsModel) {
      // Create new settings with defaults
      settingsModel = await SettingsModel.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId,
        general: DEFAULT_GENERAL,
        notifications: DEFAULT_NOTIFICATIONS,
        security: DEFAULT_SECURITY,
        appearance: DEFAULT_APPEARANCE,
      });
    }

    // Merge updates
    const currentGeneral = settingsModel.general as UserSettings["general"];
    const currentNotifications = settingsModel.notifications as UserSettings["notifications"];
    const currentSecurity = settingsModel.security as UserSettings["security"];
    const currentAppearance = settingsModel.appearance as UserSettings["appearance"];

    await settingsModel.update({
      general: updates.general
        ? { ...currentGeneral, ...updates.general }
        : currentGeneral,
      notifications: updates.notifications
        ? { ...currentNotifications, ...updates.notifications }
        : currentNotifications,
      security: updates.security
        ? { ...currentSecurity, ...updates.security }
        : currentSecurity,
      appearance: updates.appearance
        ? { ...currentAppearance, ...updates.appearance }
        : currentAppearance,
      updatedAt: new Date(),
    });

    return modelToSettings(settingsModel);
  }

  private createDefaultSettings(userId: string): UserSettings {
    return {
      userId,
      general: { ...DEFAULT_GENERAL },
      notifications: { ...DEFAULT_NOTIFICATIONS },
      security: { ...DEFAULT_SECURITY },
      appearance: { ...DEFAULT_APPEARANCE },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

