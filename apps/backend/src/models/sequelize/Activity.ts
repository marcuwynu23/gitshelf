import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export interface ActivityAttributes {
  id: string;
  userId: string; // The user who performed the action
  type: "PUSH" | "COMMIT" | "REPO_CREATE" | "REPO_DELETE" | "BRANCH_CREATE" | "BRANCH_DELETE" | "MEMBER_ADD";
  title: string;
  description?: string;
  link?: string; // URL to the resource (e.g., /repository/owner/repo)
  data?: any; // JSON data for extra details
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ActivityCreationAttributes extends Optional<ActivityAttributes, "id" | "createdAt" | "updatedAt" | "read" | "description" | "link" | "data"> {}

export class ActivityModel extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  declare id: string;
  declare userId: string;
  declare type: ActivityAttributes["type"];
  declare title: string;
  declare description?: string;
  declare link?: string;
  declare data?: any;
  declare read: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActivityModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "activities",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);
