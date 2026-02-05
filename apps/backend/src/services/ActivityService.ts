import { ActivityModel, ActivityAttributes } from "../models/sequelize/Activity";
import { SocketService } from "./SocketService";

export class ActivityService {
  private socketService: SocketService;

  constructor() {
    this.socketService = SocketService.getInstance();
  }

  async createActivity(
    userId: string,
    type: ActivityAttributes["type"],
    title: string,
    description?: string,
    link?: string,
    data?: any
  ): Promise<ActivityModel> {
    const activity = await ActivityModel.create({
      userId,
      type,
      title,
      description,
      link,
      data,
      read: false,
    });

    // Notify the user via socket
    this.socketService.notifyUser(userId, "new_activity", activity.toJSON());

    return activity;
  }

  async getUserActivities(userId: string, limit: number = 20, offset: number = 0): Promise<{ count: number; rows: ActivityModel[] }> {
    return ActivityModel.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async markAsRead(activityId: string, userId: string): Promise<boolean> {
    const [updated] = await ActivityModel.update(
      { read: true },
      { where: { id: activityId, userId } }
    );
    return updated > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const [updated] = await ActivityModel.update(
      { read: true },
      { where: { userId, read: false } }
    );
    return updated > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return ActivityModel.count({
      where: { userId, read: false },
    });
  }
}
