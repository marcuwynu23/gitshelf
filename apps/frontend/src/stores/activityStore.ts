import {create} from "zustand";
import axios from "axios";

export interface Activity {
  id: string;
  userId: string;
  type:
    | "PUSH"
    | "COMMIT"
    | "REPO_CREATE"
    | "REPO_DELETE"
    | "BRANCH_CREATE"
    | "BRANCH_DELETE"
    | "MEMBER_ADD";
  title: string;
  description?: string;
  link?: string;
  data?: any;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActivityState {
  activities: Activity[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;

  fetchActivities: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  page: 0,

  fetchActivities: async (page = 0, limit = 20) => {
    set({loading: true, error: null});
    try {
      const offset = page * limit;
      const res = await axios.get<Activity[]>("/api/activities", {
        params: {limit, offset},
      });

      const newActivities = res.data;

      set((state) => ({
        activities:
          page === 0 ? newActivities : [...state.activities, ...newActivities],
        hasMore: newActivities.length === limit,
        page,
        loading: false,
      }));
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      set({error: "Failed to load activities", loading: false});
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await axios.get<{count: number}>(
        "/api/activities/unread-count",
      );
      set({unreadCount: res.data.count});
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await axios.put(`/api/activities/${id}/read`);
      set((state) => {
        const activity = state.activities.find((a) => a.id === id);
        if (activity && !activity.read) {
          return {
            activities: state.activities.map((a) =>
              a.id === id ? {...a, read: true} : a,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }
        return {};
      });
    } catch (err) {
      console.error("Failed to mark activity as read:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put("/api/activities/read-all");
      set((state) => ({
        activities: state.activities.map((a) => ({...a, read: true})),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("Failed to mark all activities as read:", err);
    }
  },
}));
