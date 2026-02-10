import {create} from "zustand";
import axios from "axios";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    username: string,
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

// Set up axios interceptor for auth token
axios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || sessionStorage.getItem("token"),
  isAuthenticated: !!(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  ),

  login: async (username: string, password: string, rememberMe?: boolean) => {
    try {
      const res = await axios.post("/api/auth/login", {username, password});
      const {user, token} = res.data;

      // Clear any existing session data to avoid conflicts
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));
      set({user, token, isAuthenticated: true});
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Login failed");
    }
  },

  register: async (
    username: string,
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      const res = await axios.post("/api/auth/register", {
        username,
        name,
        email,
        password,
      });
      const {user, token} = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({user, token, isAuthenticated: true});
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Registration failed");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({user: null, token: null, isAuthenticated: false});
  },

  fetchProfile: async () => {
    try {
      const res = await axios.get("/api/user/profile");
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({user});
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      // If unauthorized, logout
      if (err?.response?.status === 401) {
        get().logout();
      }
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const res = await axios.put("/api/user/profile", data);
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({user});
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Failed to update profile");
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      await axios.put("/api/user/password", {
        currentPassword,
        newPassword,
      });
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.error || "Failed to change password",
      );
    }
  },
}));

// Set up axios response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const {logout} = useAuthStore.getState();

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      logout();
    }
    // Handle 502/504 Bad Gateway/Timeout (Backend down)
    else if (error.response?.status === 502 || error.response?.status === 504) {
      logout();
    }
    // Handle Network Errors (No response - e.g. ECONNREFUSED)
    else if (!error.response && error.code !== "ERR_CANCELED") {
      logout();
    }

    return Promise.reject(error);
  },
);

// Initialize user from localStorage or sessionStorage on mount
if (typeof window !== "undefined") {
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      useAuthStore.setState({user, isAuthenticated: true});
      // Fetch fresh profile data
      useAuthStore.getState().fetchProfile();
    } catch (err) {
      console.error("Failed to parse stored user:", err);
    }
  }
}
