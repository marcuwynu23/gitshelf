import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface SettingsAttributes {
  id: string;
  userId: string;
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    commitNotifications: boolean;
    branchNotifications: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
  };
  appearance: {
    theme?: string;
    fontSize?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsCreationAttributes extends Optional<SettingsAttributes, "id" | "createdAt" | "updatedAt"> {}

export class SettingsModel extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
  declare id: string;
  declare userId: string;
  declare general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  declare notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    commitNotifications: boolean;
    branchNotifications: boolean;
  };
  declare security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
  };
  declare appearance: {
    theme?: string;
    fontSize?: string;
  };
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SettingsModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    general: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        emailNotifications: true,
        pushNotifications: false,
        commitNotifications: true,
        branchNotifications: false,
      },
    },
    security: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        twoFactorEnabled: false,
        sessionTimeout: "30",
      },
    },
    appearance: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        theme: "dark",
        fontSize: "medium",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "settings",
    timestamps: true,
  }
);

