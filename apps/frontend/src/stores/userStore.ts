import {create} from "zustand";
import type {User, UserStore} from "~/props/stores/userStore.props";

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/users");
      const data: User[] = await res.json();
      set({users: data});
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  },
}));
