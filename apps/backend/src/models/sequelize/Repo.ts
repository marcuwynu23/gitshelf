import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface RepoAttributes {
  id: string;
  username: string;
  name: string; // repo name (e.g., "my-repo.git")
  title?: string;
  description?: string;
  archived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RepoCreationAttributes extends Optional<RepoAttributes, "id" | "createdAt" | "updatedAt" | "title" | "description" | "archived"> {}

export class RepoModel extends Model<RepoAttributes, RepoCreationAttributes> implements RepoAttributes {
  declare id: string;
  declare username: string;
  declare name: string;
  declare title?: string;
  declare description?: string;
  declare archived?: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RepoModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archived: {
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
    tableName: "repos",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["username", "name"],
      },
    ],
  }
);

