import {create} from "zustand";
import {persist} from "zustand/middleware";

type Theme = "light" | "dark" | "auto";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark", // Default to dark as per existing app style
      setTheme: (theme) => {
        set({theme});
        applyTheme(theme);
      },
      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);

// Helper to apply theme to DOM
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  if (theme === "auto") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    if (systemTheme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme"); // Default is dark
    }
  } else if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme"); // Default is dark
  }
};
