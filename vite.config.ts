import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    root: ".",
    publicDir: "public",
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "shared"),
            "@client": path.resolve(__dirname, "client"),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: "dist/public",
        emptyOutDir: true,
    },
});
