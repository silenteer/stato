import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactPlugin()],
  test: {
    environment: 'jsdom'
  }
})