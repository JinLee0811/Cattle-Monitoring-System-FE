import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const backendUrl =
    process.env.VITE_API_BASE_URL || process.env.VITE_BACKEND_URL || "http://localhost:5050";
  const frontendPort = process.env.VITE_FRONTEND_PORT || 5173;

  return {
    plugins: [react()],
    server: {
      port: parseInt(frontendPort), // 프론트엔드 포트
      host: true, // 외부 접근 허용
      proxy: {
        "/api": {
          target: backendUrl, // 백엔드 URL
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
