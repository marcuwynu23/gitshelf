import fs from "fs";
import path from "path";
import {User, UserPublic} from "../models/User";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {recursive: true});
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

export class UserService {
  private getUsers(): User[] {
    try {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  async findById(id: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id) || null;

    // Migrate old users without username (generate from email)
    if (user && !user.username) {
      const username = user.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      const baseUsername = username || `user${user.id.slice(-6)}`;
      let finalUsername = baseUsername;
      let counter = 1;

      // Ensure uniqueness
      while (await this.findByUsername(finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      // Directly update the user in the array and save (bypassing update method's username restriction)
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          username: finalUsername,
          updatedAt: new Date().toISOString(),
        };
        this.saveUsers(users);
        return users[userIndex];
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    const user =
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;

    // Migrate old users without username
    if (user && !user.username) {
      const username = user.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      const baseUsername = username || `user${user.id.slice(-6)}`;
      let finalUsername = baseUsername;
      let counter = 1;

      // Ensure uniqueness
      while (await this.findByUsername(finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      // Directly update the user in the array and save (bypassing update method's username restriction)
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          username: finalUsername,
          updatedAt: new Date().toISOString(),
        };
        this.saveUsers(users);
        return users[userIndex];
      }
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = this.getUsers();
    return (
      users.find(
        (u) => u.username && u.username.toLowerCase() === username.toLowerCase()
      ) || null
    );
  }

  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const users = this.getUsers();

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

    const newUser: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  async update(
    id: string,
    updates: Partial<Omit<User, "id" | "createdAt" | "email" | "username">>
  ): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveUsers(users);
    return users[userIndex];
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.update(id, {password: newPassword});
  }

  toPublic(user: User): UserPublic {
    const {password, ...publicUser} = user;
    return publicUser;
  }
}
