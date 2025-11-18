import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./ui/src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["ui/src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "ui/src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "ui/src/main.tsx",
        "ui/src/vite-env.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./ui/src"),
    },
  },
});
