import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Puerto fijo del backend en desarrollo (`DevPort` en src-dotnet/Program.cs).
const BACKEND_DEV_URL = "http://127.0.0.1:5180";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Alias "@/..." -> "src/..." (lo usa shadcn/ui y nuestro propio código)
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  // `npm run dev` sirve solo la UI: cualquier /api/* se reenvía al backend de
  // C# arrancado aparte con `dotnet run --project src-dotnet`.
  server: {
    proxy: {
      "/api": {
        target: BACKEND_DEV_URL,
        // Host: 127.0.0.1:5180 en vez de localhost:<puerto de Vite>, el mismo
        // que vería el backend sin proxy (AllowedHosts en Program.cs).
        changeOrigin: true,
      },
    },
  },
});
