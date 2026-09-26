import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// Puerto fijo del backend en desarrollo (`DevPort` en src-dotnet/Program.cs).
const BACKEND_DEV_URL = "http://127.0.0.1:5180";

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],

  // Alias "@/..." -> "src/..." (lo usa shadcn/ui y nuestro propio código)
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    // `npm run dev` sirve solo la UI: cualquier /api/* se reenvía al backend de
    // C# arrancado aparte con `dotnet run --project src-dotnet`.
    proxy: {
      "/api": {
        target: BACKEND_DEV_URL,
        // Host: 127.0.0.1:5180 en vez de localhost:<puerto de Vite>, el mismo
        // que vería el backend sin proxy (AllowedHosts en Program.cs).
        changeOrigin: true,
      },
    },
  },
}));
