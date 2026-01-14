import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserPublic } from "../models/User";
import { UserService } from "./UserService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  user: UserPublic;
  token: string;
}

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(data: RegisterData): Promise<AuthResult> {
    // Validate password
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.userService.create({
      username: data.username,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.userService.toPublic(user),
      token,
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const user = await this.userService.findByUsername(credentials.username);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isValid = await bcrypt.compare(credentials.password, user.password);

    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.userService.toPublic(user),
      token,
    };
  }

  async requestPasswordRecovery(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // TODO: Send recovery email with reset token
    // For now, just log (in production, send email)
    console.log(`Password recovery requested for: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Verify recovery token and reset password
    // For now, this is a placeholder
    throw new Error("Password recovery not fully implemented");
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (err) {
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserPublic | null> {
    const user = await this.userService.findById(userId);
    return user ? this.userService.toPublic(user) : null;
  }
}
