import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { User, UserPublic } from "../models/User";
import { UserModel } from "../models/sequelize/User";

// Helper function to convert Sequelize model to User interface
function modelToUser(model: UserModel): User {
  return {
    id: model.id,
    username: model.username,
    name: model.name,
    email: model.email,
    password: model.password,
    bio: model.bio || undefined,
    avatar: model.avatar || undefined,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

export class UserService {
  async findById(id: string): Promise<User | null> {
    const userModel = await UserModel.findByPk(id);
    if (!userModel) {
      return null;
    }

    // Migrate old users without username (generate from email)
    if (!userModel.username) {
      const username = userModel.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      const baseUsername = username || `user${userModel.id.slice(-6)}`;
      let finalUsername = baseUsername;
      let counter = 1;

      // Ensure uniqueness
      while (await this.findByUsername(finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      userModel.username = finalUsername;
      await userModel.save();
    }

    return modelToUser(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("UserModel.email")),
        email.toLowerCase()
      ),
    });

    if (!userModel) {
      return null;
    }

    // Migrate old users without username
    if (!userModel.username) {
      const username = userModel.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      const baseUsername = username || `user${userModel.id.slice(-6)}`;
      let finalUsername = baseUsername;
      let counter = 1;

      // Ensure uniqueness
      while (await this.findByUsername(finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      userModel.username = finalUsername;
      await userModel.save();
    }

    return modelToUser(userModel);
  }

  async findByUsername(username: string): Promise<User | null> {
    const userModel = await UserModel.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("UserModel.username")),
        username.toLowerCase()
      ),
    });

    if (!userModel) {
      return null;
    }

    return modelToUser(userModel);
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    // Check if email already exists
    if (await this.findByEmail(userData.email)) {
      throw new Error("Email already registered");
    }

    // Check if username already exists
    if (await this.findByUsername(userData.username)) {
      throw new Error("Username already taken");
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(userData.username)) {
      throw new Error(
        "Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens"
      );
    }

    const newUserModel = await UserModel.create({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: userData.username,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      bio: userData.bio,
      avatar: userData.avatar,
    });

    return modelToUser(newUserModel);
  }

  async update(
    id: string,
    updates: Partial<Omit<User, "id" | "createdAt" | "email" | "username">>
  ): Promise<User> {
    const userModel = await UserModel.findByPk(id);

    if (!userModel) {
      throw new Error("User not found");
    }

    await userModel.update({
      ...updates,
      updatedAt: new Date(),
    });

    return modelToUser(userModel);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.update(id, { password: newPassword });
  }

  toPublic(user: User): UserPublic {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
