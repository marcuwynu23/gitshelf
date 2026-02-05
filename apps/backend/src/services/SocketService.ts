import {Server as HttpServer} from "http";
import {Server} from "socket.io";
import {AuthService} from "./AuthService";

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private authService: AuthService;

  private constructor() {
    this.authService = new AuthService();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(httpServer: HttpServer, corsOrigins: string | string[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        const decoded = this.authService.verifyToken(token as string);
        if (!decoded || !decoded.userId) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // Attach user info to socket
        (socket as any).user = {id: decoded.userId};
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = (socket as any).user.id;

      // Register user socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(socket.id);

      // console.log(`User connected: ${userId} (${socket.id})`);

      socket.on("disconnect", () => {
        const sockets = this.userSockets.get(userId) || [];
        this.userSockets.set(
          userId,
          sockets.filter((id) => id !== socket.id),
        );
        // console.log(`User disconnected: ${userId} (${socket.id})`);
      });
    });
  }

  public notifyUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.io?.to(socketId).emit(event, data);
      });
    }
  }

  public broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}
