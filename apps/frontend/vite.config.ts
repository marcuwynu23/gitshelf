import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
