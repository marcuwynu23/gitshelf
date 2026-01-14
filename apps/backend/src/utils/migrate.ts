import fs from "fs";
import path from "path";
import { UserModel } from "../models/sequelize/User";
import { SettingsModel } from "../models/sequelize/Settings";
import { RepoModel } from "../models/sequelize/Repo";
import { User } from "../models/User";
import { UserSettings } from "../models/Settings";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

export async function migrateFromFileToDatabase() {
  try {
    // Migrate users
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, "utf-8");
      const users: User[] = JSON.parse(usersData);
      
      if (users.length > 0) {
        // @ts-ignore - Sequelize static methods are available after init()
        const existingUsers = await UserModel.findAll();
        const existingUserIds = new Set(existingUsers.map((u: UserModel) => u.id));
        const existingUserEmails = new Set(existingUsers.map((u: UserModel) => u.email.toLowerCase()));
        
        const usersToMigrate = users.filter(u => 
          !existingUserIds.has(u.id) && !existingUserEmails.has(u.email.toLowerCase())
        );
        
        if (usersToMigrate.length > 0) {
          // @ts-ignore - Sequelize static methods are available after init()
          await UserModel.bulkCreate(
            usersToMigrate.map(user => ({
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              password: user.password,
              bio: user.bio,
              avatar: user.avatar,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            })),
            { ignoreDuplicates: true }
          );
          console.log(`Migrated ${usersToMigrate.length} users from JSON to database.`);
        } else {
          console.log("No new users to migrate.");
        }
      }
    }

    // Migrate settings
    if (fs.existsSync(SETTINGS_FILE)) {
      const settingsData = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const settings: UserSettings[] = JSON.parse(settingsData);
      
      if (settings.length > 0) {
        // @ts-ignore - Sequelize static methods are available after init()
        const existingSettings = await SettingsModel.findAll();
        const existingUserIds = new Set(existingSettings.map((s: SettingsModel) => s.userId));
        
        const settingsToMigrate = settings.filter(s => !existingUserIds.has(s.userId));
        
        if (settingsToMigrate.length > 0) {
          // @ts-ignore - Sequelize static methods are available after init()
          await SettingsModel.bulkCreate(
            settingsToMigrate.map(setting => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              userId: setting.userId,
              general: setting.general,
              notifications: setting.notifications,
              security: setting.security,
              appearance: setting.appearance,
              createdAt: new Date(setting.createdAt),
              updatedAt: new Date(setting.updatedAt),
            })),
            { ignoreDuplicates: true }
          );
          console.log(`Migrated ${settingsToMigrate.length} settings from JSON to database.`);
        } else {
          console.log("No new settings to migrate.");
        }
      }
    }
  } catch (error) {
    console.error("Error during migration:", error);
    // Don't throw - migration is optional
  }
}

