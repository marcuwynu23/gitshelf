export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  commitNotifications: boolean;
  branchNotifications: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

export interface AppearanceSettings {
  theme?: string;
  fontSize?: string;
}

export interface UserSettings {
  userId: string;
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  general?: Partial<GeneralSettings>;
  notifications?: Partial<NotificationSettings>;
  security?: Partial<SecuritySettings>;
  appearance?: Partial<AppearanceSettings>;
}

