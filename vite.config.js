import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const tatRoot = path.resolve(projectRoot, "tat");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tat": path.resolve(tatRoot, "browser.ts"),
      "@tatcore": tatRoot,
    },
  },
  server: {
    fs: {
      allow: [projectRoot, tatRoot],
    },
  },
});