import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/tasks": "http://localhost:4000",
      "/statistics": "http://localhost:4000",
    },
  },
});
